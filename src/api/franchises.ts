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
      name: `${applicantProfile.full_name}'s Location`,
      status: 'planning' as const,
      country: 'Philippines'
    }

    return this.create<FranchiseLocation>('franchise_locations', locationData)
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
}
