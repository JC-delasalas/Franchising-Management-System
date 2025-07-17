import { BaseAPI } from './base'
import { Franchise, FranchisePackage, FranchiseApplication, FranchiseLocation } from '@/lib/supabase'

export interface CreateApplicationRequest {
  franchise_id: string
  package_id: string
  application_data: {
    personal_info: {
      full_name: string
      email: string
      phone: string
      address: string
    }
    business_experience: {
      years_experience: number
      previous_businesses: string[]
      management_experience: boolean
    }
    financial_info: {
      liquid_capital: number
      net_worth: number
      financing_needed: boolean
    }
  }
  business_plan?: string
}

export interface UpdateApplicationRequest {
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  notes?: string
}

export class FranchiseAPI extends BaseAPI {
  // Get all active franchises (public)
  static async getAllFranchises(): Promise<Franchise[]> {
    return this.read<Franchise>('franchises', 
      { status: 'active' },
      '*',
      { column: 'featured', ascending: false }
    )
  }

  // Get franchises by owner (franchisor only)
  static async getFranchisesByOwner(ownerId: string): Promise<Franchise[]> {
    await this.checkPermission(['franchisor', 'admin'])
    
    return this.read<Franchise>('franchises', 
      { owner_id: ownerId },
      '*',
      { column: 'created_at', ascending: false }
    )
  }

  // Get franchise by ID with packages
  static async getFranchiseById(franchiseId: string): Promise<Franchise & { packages: FranchisePackage[] }> {
    const franchise = await this.readSingle<Franchise>('franchises', { id: franchiseId })
    const packages = await this.getFranchisePackages(franchiseId)
    
    return { ...franchise, packages }
  }

  // Get franchise packages
  static async getFranchisePackages(franchiseId: string): Promise<FranchisePackage[]> {
    return this.read<FranchisePackage>('franchise_packages',
      { franchise_id: franchiseId, active: true },
      '*',
      { column: 'sort_order', ascending: true }
    )
  }

  // Create franchise application
  static async createApplication(applicationData: CreateApplicationRequest): Promise<FranchiseApplication> {
    const user = await this.getCurrentUserProfile()
    
    // Check if user already has a pending application for this franchise
    const existingApplications = await this.read<FranchiseApplication>('franchise_applications', {
      franchise_id: applicationData.franchise_id,
      applicant_id: user.id,
      status: 'pending'
    })

    if (existingApplications.length > 0) {
      throw new Error('You already have a pending application for this franchise')
    }

    // Get package details for pricing
    const packageDetails = await this.readSingle<FranchisePackage>('franchise_packages', {
      id: applicationData.package_id
    })

    const application = await this.create<FranchiseApplication>('franchise_applications', {
      franchise_id: applicationData.franchise_id,
      package_id: applicationData.package_id,
      applicant_id: user.id,
      application_data: applicationData.application_data,
      business_plan: applicationData.business_plan,
      initial_payment_amount: packageDetails.initial_fee,
      monthly_royalty_amount: packageDetails.monthly_royalty_rate,
      status: 'pending',
      submitted_at: new Date().toISOString()
    })

    return application
  }

  // Get applications by user
  static async getApplicationsByUser(userId: string): Promise<FranchiseApplication[]> {
    return this.read<FranchiseApplication>('franchise_applications',
      { applicant_id: userId },
      `
        *,
        franchises (name, logo_url),
        franchise_packages (name, initial_fee)
      `,
      { column: 'submitted_at', ascending: false }
    )
  }

  // Get applications for franchise (franchisor only)
  static async getApplicationsForFranchise(franchiseId: string): Promise<FranchiseApplication[]> {
    await this.checkPermission(['franchisor', 'admin'])

    return this.read<FranchiseApplication>('franchise_applications',
      { franchise_id: franchiseId },
      `
        *,
        user_profiles!applicant_id (full_name, email, phone),
        franchise_packages (name, initial_fee)
      `,
      { column: 'submitted_at', ascending: false }
    )
  }

  // Get applications for franchisor (all franchises owned by franchisor)
  static async getApplicationsForFranchisor(franchisorId: string): Promise<FranchiseApplication[]> {
    await this.checkPermission(['franchisor', 'admin'])

    try {
      // Get all franchises owned by this franchisor
      const { data: franchises, error: franchisesError } = await supabase
        .from('franchises')
        .select('id')
        .eq('owner_id', franchisorId)

      if (franchisesError) throw franchisesError

      const franchiseIds = franchises?.map(f => f.id) || []

      if (franchiseIds.length === 0) {
        return []
      }

      // Get all applications for these franchises
      const { data: applications, error: applicationsError } = await supabase
        .from('franchise_applications')
        .select(`
          *,
          user_profiles!applicant_id (full_name, email, phone),
          franchises (name)
        `)
        .in('franchise_id', franchiseIds)
        .order('submitted_at', { ascending: false })

      if (applicationsError) throw applicationsError

      return applications || []
    } catch (error) {
      console.error('Error fetching franchisor applications:', error)
      throw new Error('Failed to fetch applications for franchisor')
    }
  }

  // Update application status (franchisor only)
  static async updateApplicationStatus(
    applicationId: string, 
    updates: UpdateApplicationRequest
  ): Promise<FranchiseApplication> {
    const profile = await this.checkPermission(['franchisor', 'admin'])
    
    const updateData: any = {
      status: updates.status,
      reviewed_at: new Date().toISOString(),
      notes: updates.notes
    }

    if (updates.status === 'approved') {
      updateData.approved_by = profile.id
      updateData.approved_at = new Date().toISOString()
    } else if (updates.status === 'rejected') {
      updateData.rejection_reason = updates.rejection_reason
    }

    const application = await this.update<FranchiseApplication>('franchise_applications', applicationId, updateData)

    // If approved, create franchise location
    if (updates.status === 'approved') {
      await this.createFranchiseLocation(application)
    }

    return application
  }

  // Create franchise location after approval
  private static async createFranchiseLocation(application: FranchiseApplication): Promise<FranchiseLocation> {
    const applicantProfile = await this.readSingle('user_profiles', { id: application.applicant_id })

    const locationData = {
      franchise_id: application.franchise_id,
      franchisee_id: application.applicant_id,
      location_code: `LOC-${Date.now()}`,
      name: `${applicantProfile.full_name}'s Location`,
      description: 'New franchise location',
      status: 'planning' as const,
      country: 'Philippines',
      opening_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    }

    const location = await this.create<FranchiseLocation>('franchise_locations', locationData)

    // Trigger initial package fulfillment
    await this.fulfillInitialPackage(application, location)

    return location
  }

  // Fulfill initial package after franchise approval
  private static async fulfillInitialPackage(
    application: FranchiseApplication,
    location: FranchiseLocation
  ): Promise<void> {
    try {
      // Get package details
      const packageDetails = await this.readSingle('franchise_packages', {
        id: application.package_id
      })

      // Create initial inventory allocation
      await this.allocateInitialInventory(location.id, packageDetails)

      // Create transaction history for package fulfillment
      await this.createPackageFulfillmentTransaction(application, location, packageDetails)

      // Send welcome notification
      await this.sendWelcomeNotification(application.applicant_id, location)

    } catch (error) {
      console.error('Error fulfilling initial package:', error)
      // Don't throw error to prevent blocking location creation
    }
  }

  // Allocate initial inventory based on package
  private static async allocateInitialInventory(
    locationId: string,
    packageDetails: any
  ): Promise<void> {
    // Get default products for initial inventory
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .limit(10)

    if (!products) return

    // Get default warehouse
    const { data: warehouse } = await supabase
      .from('warehouses')
      .select('id')
      .limit(1)
      .single()

    if (!warehouse) return

    // Create inventory allocations
    const inventoryAllocations = products.map(product => ({
      warehouse_id: warehouse.id,
      product_id: product.id,
      quantity_on_hand: Math.floor(Math.random() * 50) + 10, // 10-60 units
      reserved_quantity: 0,
      reorder_level: 5,
      max_stock_level: 100,
      cost_per_unit: product.price * 0.7,
      batch_number: `INITIAL-${Date.now()}`,
      location_in_warehouse: `${locationId.slice(0, 8)}-${product.sku}`
    }))

    await supabase
      .from('inventory_levels')
      .insert(inventoryAllocations)
  }

  // Create transaction history for package fulfillment
  private static async createPackageFulfillmentTransaction(
    application: FranchiseApplication,
    location: FranchiseLocation,
    packageDetails: any
  ): Promise<void> {
    const transactionData = {
      transaction_number: `TXN-PKG-${Date.now()}`,
      transaction_type: 'package_fulfillment',
      reference_id: application.id,
      reference_type: 'franchise_application',
      franchise_location_id: location.id,
      franchisee_id: application.applicant_id,
      franchisor_id: (await this.readSingle('franchises', { id: application.franchise_id })).owner_id,
      amount: application.initial_payment_amount,
      description: `Initial package fulfillment for ${location.name}`,
      status: 'completed',
      metadata: {
        package_name: packageDetails.name,
        application_number: application.application_number,
        location_code: location.location_code
      }
    }

    await supabase
      .from('transaction_history')
      .insert(transactionData)
  }

  // Send welcome notification to new franchisee
  private static async sendWelcomeNotification(
    franchiseeId: string,
    location: FranchiseLocation
  ): Promise<void> {
    const notificationData = {
      user_id: franchiseeId,
      type: 'welcome',
      title: 'Welcome to the Franchise Family!',
      message: `Congratulations! Your franchise location "${location.name}" has been approved and your initial package is being prepared.`,
      data: {
        location_id: location.id,
        location_name: location.name,
        next_steps: [
          'Review your initial inventory allocation',
          'Schedule your training sessions',
          'Prepare for grand opening',
          'Contact your dedicated support team'
        ]
      },
      is_read: false
    }

    await supabase
      .from('notifications')
      .insert(notificationData)
  }

  // Get franchise locations
  static async getFranchiseLocations(franchiseId?: string, franchiseeId?: string): Promise<FranchiseLocation[]> {
    const filters: Record<string, any> = {}
    
    if (franchiseId) filters.franchise_id = franchiseId
    if (franchiseeId) filters.franchisee_id = franchiseeId

    return this.read<FranchiseLocation>('franchise_locations',
      filters,
      `
        *,
        franchises (name, logo_url),
        user_profiles!franchisee_id (full_name, email, phone)
      `,
      { column: 'created_at', ascending: false }
    )
  }

  // Get locations by franchisee
  static async getLocationsByFranchisee(franchiseeId: string): Promise<FranchiseLocation[]> {
    return this.getFranchiseLocations(undefined, franchiseeId)
  }

  // Update franchise location
  static async updateFranchiseLocation(
    locationId: string, 
    updates: Partial<FranchiseLocation>
  ): Promise<FranchiseLocation> {
    const user = await this.getCurrentUserProfile()
    
    // Check if user owns this location or is franchisor/admin
    const location = await this.readSingle<FranchiseLocation>('franchise_locations', { id: locationId })
    
    if (location.franchisee_id !== user.id && !['franchisor', 'admin'].includes(user.role || '')) {
      throw new Error('Insufficient permissions to update this location')
    }

    return this.update<FranchiseLocation>('franchise_locations', locationId, updates)
  }

  // Search franchises
  static async searchFranchises(searchTerm: string, category?: string): Promise<Franchise[]> {
    const filters: Record<string, any> = { status: 'active' }
    if (category) filters.category = category
    
    return this.search<Franchise>(
      'franchises',
      searchTerm,
      ['name', 'description', 'category'],
      filters,
      '*',
      20
    )
  }

  // Get franchise categories
  static async getFranchiseCategories(): Promise<string[]> {
    const { data, error } = await this.handleResponse(
      this.read<{ category: string }>('franchises', { status: 'active' }, 'category')
    )

    if (error) throw error

    const categories = [...new Set(data.map(f => f.category).filter(Boolean))]
    return categories.sort()
  }

  // Get franchise statistics (franchisor only)
  static async getFranchiseStatistics(franchiseId: string): Promise<{
    total_applications: number
    pending_applications: number
    approved_applications: number
    total_locations: number
    active_locations: number
  }> {
    await this.checkPermission(['franchisor', 'admin'])

    const [applications, locations] = await Promise.all([
      this.read<FranchiseApplication>('franchise_applications', { franchise_id: franchiseId }),
      this.read<FranchiseLocation>('franchise_locations', { franchise_id: franchiseId })
    ])

    return {
      total_applications: applications.length,
      pending_applications: applications.filter(app => app.status === 'pending').length,
      approved_applications: applications.filter(app => app.status === 'approved').length,
      total_locations: locations.length,
      active_locations: locations.filter(loc => loc.status === 'open').length
    }
  }

  // Get franchise packages for a franchise
  static async getFranchisePackages(franchiseId: string): Promise<any[]> {
    try {
      const { data: packages, error } = await supabase
        .from('franchise_packages')
        .select('*')
        .eq('franchise_id', franchiseId)
        .eq('active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error

      return packages || []
    } catch (error) {
      console.error('Error fetching franchise packages:', error)
      throw new Error('Failed to fetch franchise packages')
    }
  }
}
