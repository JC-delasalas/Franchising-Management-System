import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Brand = Database['public']['Tables']['brand']['Row'];
type BrandInsert = Database['public']['Tables']['brand']['Insert'];
type BrandUpdate = Database['public']['Tables']['brand']['Update'];
type Product = Database['public']['Tables']['product']['Row'];
type ProductInsert = Database['public']['Tables']['product']['Insert'];
type ProductUpdate = Database['public']['Tables']['product']['Update'];
type ProductCategory = Database['public']['Tables']['product_category']['Row'];
type ProductCategoryInsert = Database['public']['Tables']['product_category']['Insert'];

export interface BrandCreateData {
  brand_nm: string;
  tagline?: string;
  details?: string;
  logo_url?: string;
  metadata?: Record<string, any>;
  marketing_data?: Record<string, any>;
}

export interface ProductCreateData {
  brand_id: string;
  category_id?: string;
  product_nm: string;
  details?: string;
  sku: string;
  unit_price: number;
  is_active?: boolean;
  metadata?: Record<string, any>;
  custom_attributes?: Record<string, any>;
}

export interface CategoryCreateData {
  brand_id: string;
  cat_nm: string;
  details?: string;
}

/**
 * Centralized Brand & Product Management Service
 * Supports Objective 1: Centralized Brand & Product Management
 */
export class BrandService {
  
  /**
   * Get all brands for the current franchisor
   */
  static async getBrands(franchisorId: string) {
    try {
      const { data, error } = await supabase
        .from('brand')
        .select(`
          *,
          product_count:product(count),
          franchisee_count:franchisee(count)
        `)
        .eq('franchisor_id', franchisorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching brands:', error);
      return { success: false, error };
    }
  }

  /**
   * Create a new brand
   */
  static async createBrand(franchisorId: string, brandData: BrandCreateData) {
    try {
      const insertData: BrandInsert = {
        franchisor_id: franchisorId,
        ...brandData,
        metadata: {
          created_by: 'system',
          creation_source: 'brand_management',
          ...brandData.metadata
        },
        marketing_data: {
          brand_colors: [],
          fonts: [],
          style_guide_url: null,
          ...brandData.marketing_data
        }
      };

      const { data, error } = await supabase
        .from('brand')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Create default product categories for the new brand
      await this.createDefaultCategories(data.brand_id);

      return { success: true, data };
    } catch (error) {
      console.error('Error creating brand:', error);
      return { success: false, error };
    }
  }

  /**
   * Update an existing brand
   */
  static async updateBrand(brandId: string, updates: BrandUpdate) {
    try {
      const { data, error } = await supabase
        .from('brand')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('brand_id', brandId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating brand:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete a brand (soft delete by setting inactive)
   */
  static async deleteBrand(brandId: string) {
    try {
      // Check if brand has active franchisees
      const { data: franchisees } = await supabase
        .from('franchisee')
        .select('franchisee_id')
        .eq('brand_id', brandId)
        .eq('status', 'active');

      if (franchisees && franchisees.length > 0) {
        return {
          success: false,
          error: 'Cannot delete brand with active franchisees'
        };
      }

      // Soft delete by updating metadata
      const { data, error } = await supabase
        .from('brand')
        .update({
          metadata: {
            deleted: true,
            deleted_at: new Date().toISOString()
          }
        })
        .eq('brand_id', brandId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error deleting brand:', error);
      return { success: false, error };
    }
  }

  /**
   * Get products for a specific brand
   */
  static async getProducts(brandId: string, includeInactive = false) {
    try {
      let query = supabase
        .from('product')
        .select(`
          *,
          product_category:category_id (
            cat_nm,
            details
          ),
          brand:brand_id (
            brand_nm,
            tagline
          )
        `)
        .eq('brand_id', brandId);

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query.order('product_nm');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, error };
    }
  }

  /**
   * Create a new product
   */
  static async createProduct(productData: ProductCreateData) {
    try {
      const insertData: ProductInsert = {
        ...productData,
        metadata: {
          created_by: 'system',
          creation_source: 'product_management',
          ...productData.metadata
        },
        custom_attributes: {
          allergens: [],
          certifications: [],
          ...productData.custom_attributes
        }
      };

      const { data, error } = await supabase
        .from('product')
        .insert(insertData)
        .select(`
          *,
          product_category:category_id (
            cat_nm,
            details
          ),
          brand:brand_id (
            brand_nm,
            tagline
          )
        `)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating product:', error);
      return { success: false, error };
    }
  }

  /**
   * Update an existing product
   */
  static async updateProduct(productId: string, updates: ProductUpdate) {
    try {
      const { data, error } = await supabase
        .from('product')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('product_id', productId)
        .select(`
          *,
          product_category:category_id (
            cat_nm,
            details
          ),
          brand:brand_id (
            brand_nm,
            tagline
          )
        `)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete a product (soft delete)
   */
  static async deleteProduct(productId: string) {
    try {
      const { data, error } = await supabase
        .from('product')
        .update({
          is_active: false,
          metadata: {
            deleted: true,
            deleted_at: new Date().toISOString()
          }
        })
        .eq('product_id', productId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error };
    }
  }

  /**
   * Get product categories for a brand
   */
  static async getCategories(brandId: string) {
    try {
      const { data, error } = await supabase
        .from('product_category')
        .select(`
          *,
          product_count:product(count)
        `)
        .eq('brand_id', brandId)
        .order('cat_nm');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { success: false, error };
    }
  }

  /**
   * Create a new product category
   */
  static async createCategory(categoryData: CategoryCreateData) {
    try {
      const { data, error } = await supabase
        .from('product_category')
        .insert(categoryData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating category:', error);
      return { success: false, error };
    }
  }

  /**
   * Update product category
   */
  static async updateCategory(categoryId: string, updates: Partial<ProductCategory>) {
    try {
      const { data, error } = await supabase
        .from('product_category')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('category_id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating category:', error);
      return { success: false, error };
    }
  }

  /**
   * Get brand analytics and metrics
   */
  static async getBrandAnalytics(brandId: string) {
    try {
      // Get basic brand metrics
      const [
        { data: products },
        { data: franchisees },
        { data: locations },
        { data: sales }
      ] = await Promise.all([
        supabase
          .from('product')
          .select('product_id, is_active')
          .eq('brand_id', brandId),
        
        supabase
          .from('franchisee')
          .select('franchisee_id, status')
          .eq('brand_id', brandId),
        
        supabase
          .from('location')
          .select(`
            location_id,
            status,
            franchisee:franchisee_id!inner (
              brand_id
            )
          `)
          .eq('franchisee.brand_id', brandId),
        
        supabase
          .from('sales_transaction')
          .select(`
            total_amt,
            txn_date,
            location:location_id!inner (
              franchisee:franchisee_id!inner (
                brand_id
              )
            )
          `)
          .eq('location.franchisee.brand_id', brandId)
          .gte('txn_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const analytics = {
        products: {
          total: products?.length || 0,
          active: products?.filter(p => p.is_active).length || 0
        },
        franchisees: {
          total: franchisees?.length || 0,
          active: franchisees?.filter(f => f.status === 'active').length || 0
        },
        locations: {
          total: locations?.length || 0,
          active: locations?.filter(l => l.status === 'active').length || 0
        },
        sales: {
          total_30_days: sales?.reduce((sum, s) => sum + (s.total_amt || 0), 0) || 0,
          transaction_count: sales?.length || 0
        }
      };

      return { success: true, data: analytics };
    } catch (error) {
      console.error('Error fetching brand analytics:', error);
      return { success: false, error };
    }
  }

  /**
   * Create default product categories for a new brand
   */
  private static async createDefaultCategories(brandId: string) {
    const defaultCategories = [
      { cat_nm: 'Beverages', details: 'Hot and cold drinks' },
      { cat_nm: 'Food', details: 'Food items and snacks' },
      { cat_nm: 'Merchandise', details: 'Branded merchandise and accessories' },
      { cat_nm: 'Supplies', details: 'Operational supplies and materials' }
    ];

    const categoryInserts: ProductCategoryInsert[] = defaultCategories.map(cat => ({
      brand_id: brandId,
      ...cat
    }));

    try {
      await supabase
        .from('product_category')
        .insert(categoryInserts);
    } catch (error) {
      console.error('Error creating default categories:', error);
    }
  }

  /**
   * Bulk import products from CSV or JSON
   */
  static async bulkImportProducts(brandId: string, products: ProductCreateData[]) {
    try {
      const insertData: ProductInsert[] = products.map(product => ({
        ...product,
        brand_id: brandId,
        metadata: {
          imported: true,
          import_date: new Date().toISOString(),
          ...product.metadata
        }
      }));

      const { data, error } = await supabase
        .from('product')
        .insert(insertData)
        .select();

      if (error) throw error;
      return { success: true, data, imported_count: data.length };
    } catch (error) {
      console.error('Error bulk importing products:', error);
      return { success: false, error };
    }
  }

  /**
   * Search products across all brands for a franchisor
   */
  static async searchProducts(franchisorId: string, searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from('product')
        .select(`
          *,
          brand:brand_id!inner (
            brand_nm,
            franchisor_id
          ),
          product_category:category_id (
            cat_nm
          )
        `)
        .eq('brand.franchisor_id', franchisorId)
        .or(`product_nm.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,details.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .order('product_nm');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error searching products:', error);
      return { success: false, error };
    }
  }
}

export default BrandService;
