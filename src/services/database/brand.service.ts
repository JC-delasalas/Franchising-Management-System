import { BaseService } from './base.service';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Brand = Database['public']['Tables']['brand']['Row'];
type BrandInsert = Database['public']['Tables']['brand']['Insert'];
type BrandUpdate = Database['public']['Tables']['brand']['Update'];

type Product = Database['public']['Tables']['product']['Row'];
type ProductCategory = Database['public']['Tables']['product_category']['Row'];

/**
 * Brand Management Service
 * Objective 1: Centralized Brand & Product Management
 */
export class BrandService extends BaseService<'brand'> {
  constructor() {
    super('brand');
  }

  /**
   * Get brand with its products and categories
   */
  async getBrandWithProducts(brandId: string): Promise<{
    data: (Brand & {
      products: Product[];
      categories: ProductCategory[];
    }) | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data: brand, error: brandError } = await supabase
      .from('brand')
      .select(`
        *,
        products:product(*),
        categories:product_category(*)
      `)
      .eq('brand_id', brandId)
      .eq('franchisor_id', franchisorId)
      .single();

    return { data: brand, error: brandError };
  }

  /**
   * Create a new brand with initial setup
   */
  async createBrand(brandData: Omit<BrandInsert, 'brand_id' | 'franchisor_id'>): Promise<{
    data: Brand | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    if (!franchisorId) {
      return { data: null, error: new Error('No franchisor ID found') };
    }

    const { data, error } = await supabase
      .from('brand')
      .insert({
        ...brandData,
        franchisor_id: franchisorId,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Update brand information
   */
  async updateBrand(brandId: string, updates: BrandUpdate): Promise<{
    data: Brand | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data, error } = await supabase
      .from('brand')
      .update(updates)
      .eq('brand_id', brandId)
      .eq('franchisor_id', franchisorId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get all brands for the current franchisor
   */
  async getAllBrands(): Promise<{
    data: Brand[] | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data, error } = await supabase
      .from('brand')
      .select('*')
      .eq('franchisor_id', franchisorId)
      .order('brand_nm');

    return { data, error };
  }

  /**
   * Delete a brand (with cascade considerations)
   */
  async deleteBrand(brandId: string): Promise<{ error: any }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    // Check if brand has associated products
    const { data: products } = await supabase
      .from('product')
      .select('product_id')
      .eq('brand_id', brandId)
      .eq('franchisor_id', franchisorId);

    if (products && products.length > 0) {
      return { error: new Error('Cannot delete brand with associated products') };
    }

    const { error } = await supabase
      .from('brand')
      .delete()
      .eq('brand_id', brandId)
      .eq('franchisor_id', franchisorId);

    return { error };
  }

  /**
   * Get brand analytics and metrics
   */
  async getBrandAnalytics(brandId: string): Promise<{
    data: {
      totalProducts: number;
      totalCategories: number;
      totalFranchisees: number;
      totalRevenue: number;
    } | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    try {
      // Get product count
      const { count: productCount } = await supabase
        .from('product')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brandId)
        .eq('franchisor_id', franchisorId);

      // Get category count
      const { count: categoryCount } = await supabase
        .from('product_category')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brandId)
        .eq('franchisor_id', franchisorId);

      // Get franchisee count
      const { count: franchiseeCount } = await supabase
        .from('franchisee')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brandId)
        .eq('franchisor_id', franchisorId);

      // Calculate total revenue (this would need to be implemented based on your sales data)
      const { data: revenueData } = await supabase
        .from('sales_transaction')
        .select('total_amount')
        .eq('franchisor_id', franchisorId);

      const totalRevenue = revenueData?.reduce((sum, transaction) => 
        sum + (transaction.total_amount || 0), 0) || 0;

      return {
        data: {
          totalProducts: productCount || 0,
          totalCategories: categoryCount || 0,
          totalFranchisees: franchiseeCount || 0,
          totalRevenue,
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }
}
