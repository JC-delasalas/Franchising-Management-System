import { supabase } from '@/integrations/supabase/client';

/**
 * ETL Service for OLTP to OLAP Data Pipeline
 * Handles data extraction, transformation, and loading for analytics
 */
export class DataWarehouseETL {
  
  /**
   * Initialize date dimension with comprehensive date data
   */
  static async initializeDateDimension(startYear: number = 2020, endYear: number = 2030): Promise<void> {
    console.log('Initializing date dimension...');
    
    const dates = [];
    const startDate = new Date(startYear, 0, 1);
    const endDate = new Date(endYear, 11, 31);
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateKey = parseInt(date.toISOString().slice(0, 10).replace(/-/g, ''));
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      
      dates.push({
        date_key: dateKey,
        date_value: date.toISOString().slice(0, 10),
        year: date.getFullYear(),
        quarter: Math.ceil((date.getMonth() + 1) / 3),
        month: date.getMonth() + 1,
        month_name: monthNames[date.getMonth()],
        week: this.getWeekNumber(date),
        day_of_year: this.getDayOfYear(date),
        day_of_month: date.getDate(),
        day_of_week: date.getDay() + 1,
        day_name: dayNames[date.getDay()],
        is_weekend: date.getDay() === 0 || date.getDay() === 6,
        fiscal_year: date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1,
        fiscal_quarter: Math.ceil(((date.getMonth() + 9) % 12 + 1) / 3)
      });
    }
    
    // Batch insert dates
    const batchSize = 1000;
    for (let i = 0; i < dates.length; i += batchSize) {
      const batch = dates.slice(i, i + batchSize);
      await supabase.from('analytics.dim_date').upsert(batch, { onConflict: 'date_key' });
    }
    
    console.log(`Date dimension initialized with ${dates.length} records`);
  }
  
  /**
   * Initialize time dimension for intraday analysis
   */
  static async initializeTimeDimension(): Promise<void> {
    console.log('Initializing time dimension...');
    
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) { // 15-minute intervals
        const timeKey = hour * 100 + minute;
        let timeOfDay = 'Night';
        if (hour >= 6 && hour < 12) timeOfDay = 'Morning';
        else if (hour >= 12 && hour < 18) timeOfDay = 'Afternoon';
        else if (hour >= 18 && hour < 22) timeOfDay = 'Evening';
        
        times.push({
          time_key: timeKey,
          hour,
          minute,
          time_of_day: timeOfDay,
          business_hour: hour >= 8 && hour < 20 // 8 AM to 8 PM
        });
      }
    }
    
    await supabase.from('analytics.dim_time').upsert(times, { onConflict: 'time_key' });
    console.log(`Time dimension initialized with ${times.length} records`);
  }
  
  /**
   * Extract and load franchisor dimension data
   */
  static async loadFranchisorDimension(): Promise<void> {
    console.log('Loading franchisor dimension...');
    
    const { data: franchisors, error } = await supabase
      .from('franchisor')
      .select(`
        franchisor_id,
        company_name,
        legal_name,
        status,
        created_at,
        address:address_id(
          country,
          state_province,
          city
        )
      `);
    
    if (error) throw error;
    
    const dimensionData = franchisors?.map(f => ({
      franchisor_id: f.franchisor_id,
      company_name: f.company_name,
      legal_name: f.legal_name,
      industry: 'Food & Beverage', // Default for franchise
      country: f.address?.country || 'Philippines',
      state_province: f.address?.state_province,
      city: f.address?.city,
      status: f.status,
      created_date: f.created_at?.split('T')[0],
      effective_date: new Date().toISOString().split('T')[0],
      is_current: true,
      version: 1
    })) || [];
    
    await supabase.from('analytics.dim_franchisor').upsert(dimensionData, { 
      onConflict: 'franchisor_id,is_current' 
    });
    
    console.log(`Loaded ${dimensionData.length} franchisor records`);
  }
  
  /**
   * Extract and load brand dimension data
   */
  static async loadBrandDimension(): Promise<void> {
    console.log('Loading brand dimension...');
    
    const { data: brands, error } = await supabase
      .from('brand')
      .select(`
        brand_id,
        franchisor_id,
        brand_name,
        status,
        created_at
      `);
    
    if (error) throw error;
    
    // Get franchisor keys
    const { data: franchisorKeys } = await supabase
      .from('analytics.dim_franchisor')
      .select('franchisor_key, franchisor_id')
      .eq('is_current', true);
    
    const franchisorKeyMap = new Map(
      franchisorKeys?.map(f => [f.franchisor_id, f.franchisor_key]) || []
    );
    
    const dimensionData = brands?.map(b => ({
      brand_id: b.brand_id,
      franchisor_key: franchisorKeyMap.get(b.franchisor_id),
      brand_name: b.brand_name,
      industry: 'Food & Beverage',
      status: b.status,
      created_date: b.created_at?.split('T')[0],
      effective_date: new Date().toISOString().split('T')[0],
      is_current: true,
      version: 1
    })).filter(b => b.franchisor_key) || [];
    
    await supabase.from('analytics.dim_brand').upsert(dimensionData, { 
      onConflict: 'brand_id,is_current' 
    });
    
    console.log(`Loaded ${dimensionData.length} brand records`);
  }
  
  /**
   * Extract and load franchisee dimension data
   */
  static async loadFranchiseeDimension(): Promise<void> {
    console.log('Loading franchisee dimension...');
    
    const { data: franchisees, error } = await supabase
      .from('franchisee')
      .select(`
        franchisee_id,
        brand_id,
        business_name,
        legal_name,
        onboarding_status,
        status,
        created_at
      `);
    
    if (error) throw error;
    
    // Get brand keys
    const { data: brandKeys } = await supabase
      .from('analytics.dim_brand')
      .select('brand_key, brand_id')
      .eq('is_current', true);
    
    const brandKeyMap = new Map(
      brandKeys?.map(b => [b.brand_id, b.brand_key]) || []
    );
    
    const dimensionData = franchisees?.map(f => ({
      franchisee_id: f.franchisee_id,
      brand_key: brandKeyMap.get(f.brand_id),
      business_name: f.business_name,
      legal_name: f.legal_name,
      onboarding_status: f.onboarding_status,
      status: f.status,
      created_date: f.created_at?.split('T')[0],
      effective_date: new Date().toISOString().split('T')[0],
      is_current: true,
      version: 1
    })).filter(f => f.brand_key) || [];
    
    await supabase.from('analytics.dim_franchisee').upsert(dimensionData, { 
      onConflict: 'franchisee_id,is_current' 
    });
    
    console.log(`Loaded ${dimensionData.length} franchisee records`);
  }
  
  /**
   * Extract and load location dimension data
   */
  static async loadLocationDimension(): Promise<void> {
    console.log('Loading location dimension...');
    
    const { data: locations, error } = await supabase
      .from('location')
      .select(`
        location_id,
        franchisee_id,
        location_name,
        opening_date,
        status,
        created_at,
        address:address_id(
          country,
          state_province,
          city,
          postal_code
        )
      `);
    
    if (error) throw error;
    
    // Get franchisee keys
    const { data: franchiseeKeys } = await supabase
      .from('analytics.dim_franchisee')
      .select('franchisee_key, franchisee_id')
      .eq('is_current', true);
    
    const franchiseeKeyMap = new Map(
      franchiseeKeys?.map(f => [f.franchisee_id, f.franchisee_key]) || []
    );
    
    const dimensionData = locations?.map(l => ({
      location_id: l.location_id,
      franchisee_key: franchiseeKeyMap.get(l.franchisee_id),
      location_name: l.location_name,
      country: l.address?.country || 'Philippines',
      state_province: l.address?.state_province,
      city: l.address?.city,
      postal_code: l.address?.postal_code,
      location_type: 'Store', // Default type
      opening_date: l.opening_date,
      status: l.status,
      effective_date: new Date().toISOString().split('T')[0],
      is_current: true,
      version: 1
    })).filter(l => l.franchisee_key) || [];
    
    await supabase.from('analytics.dim_location').upsert(dimensionData, { 
      onConflict: 'location_id,is_current' 
    });
    
    console.log(`Loaded ${dimensionData.length} location records`);
  }
  
  /**
   * Run full ETL process
   */
  static async runFullETL(): Promise<void> {
    console.log('Starting full ETL process...');
    
    try {
      // Initialize dimensions
      await this.initializeDateDimension();
      await this.initializeTimeDimension();
      
      // Load business dimensions
      await this.loadFranchisorDimension();
      await this.loadBrandDimension();
      await this.loadFranchiseeDimension();
      await this.loadLocationDimension();
      
      console.log('Full ETL process completed successfully');
    } catch (error) {
      console.error('ETL process failed:', error);
      throw error;
    }
  }
  
  // Helper functions
  private static getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
  
  private static getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
