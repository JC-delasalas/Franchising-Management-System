import { BaseService } from './base.service';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['product']['Row'];
type ProductCategory = Database['public']['Tables']['product_category']['Row'];

/**
 * Enhanced Product Management Service
 * Allows franchisors to manage products across multiple brands
 */
export class ProductService extends BaseService<'product'> {
  constructor() {
    super('product');
  }

  /**
   * Create a new product for a specific brand
   */
  async createProduct(productData: {
    brand_id: string;
    category_id?: string;
    product_nm: string;
    description?: string;
    unit_price: number;
    cost_price?: number;
    sku?: string;
    barcode?: string;
    specifications?: Record<string, any>;
    images?: string[];
    is_active?: boolean;
    metadata?: Record<string, any>;
  }): Promise<{
    data: Product | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    if (!franchisorId) {
      return { data: null, error: new Error('No franchisor ID found') };
    }

    // Validate brand belongs to franchisor
    const { data: brand, error: brandError } = await supabase
      .from('brand')
      .select('brand_id')
      .eq('brand_id', productData.brand_id)
      .eq('franchisor_id', franchisorId)
      .single();

    if (brandError || !brand) {
      return { data: null, error: new Error('Brand not found or access denied') };
    }

    // Generate SKU if not provided
    const sku = productData.sku || await this.generateSKU(productData.brand_id, productData.product_nm);

    const { data, error } = await supabase
      .from('product')
      .insert({
        ...productData,
        sku,
        franchisor_id: franchisorId,
        is_active: productData.is_active ?? true,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Create product category
   */
  async createCategory(categoryData: {
    brand_id: string;
    category_nm: string;
    description?: string;
    parent_category_id?: string;
    sort_order?: number;
    metadata?: Record<string, any>;
  }): Promise<{
    data: ProductCategory | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    if (!franchisorId) {
      return { data: null, error: new Error('No franchisor ID found') };
    }

    const { data, error } = await supabase
      .from('product_category')
      .insert({
        ...categoryData,
        franchisor_id: franchisorId,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get products by brand with categories
   */
  async getProductsByBrand(brandId: string): Promise<{
    data: (Product & { category: ProductCategory | null })[] | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data, error } = await supabase
      .from('product')
      .select(`
        *,
        category:product_category(*)
      `)
      .eq('brand_id', brandId)
      .eq('franchisor_id', franchisorId)
      .order('product_nm');

    return { data, error };
  }

  /**
   * Get categories by brand
   */
  async getCategoriesByBrand(brandId: string): Promise<{
    data: ProductCategory[] | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data, error } = await supabase
      .from('product_category')
      .select('*')
      .eq('brand_id', brandId)
      .eq('franchisor_id', franchisorId)
      .order('sort_order', { ascending: true });

    return { data, error };
  }

  /**
   * Update product
   */
  async updateProduct(
    productId: string,
    updates: Partial<Product>
  ): Promise<{
    data: Product | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    const { data, error } = await supabase
      .from('product')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('product_id', productId)
      .eq('franchisor_id', franchisorId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Bulk update product prices
   */
  async bulkUpdatePrices(updates: Array<{
    product_id: string;
    unit_price: number;
    cost_price?: number;
  }>): Promise<{
    data: { updated: number; errors: any[] };
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    const results = { updated: 0, errors: [] as any[] };

    for (const update of updates) {
      try {
        const { error } = await supabase
          .from('product')
          .update({
            unit_price: update.unit_price,
            cost_price: update.cost_price,
            updated_at: new Date().toISOString(),
          })
          .eq('product_id', update.product_id)
          .eq('franchisor_id', franchisorId);

        if (error) {
          results.errors.push({ product_id: update.product_id, error: error.message });
        } else {
          results.updated++;
        }
      } catch (error) {
        results.errors.push({ product_id: update.product_id, error: (error as Error).message });
      }
    }

    return { data: results, error: null };
  }

  /**
   * Clone product to another brand
   */
  async cloneProductToBrand(
    productId: string,
    targetBrandId: string,
    modifications?: Partial<Product>
  ): Promise<{
    data: Product | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    // Get original product
    const { data: originalProduct, error: fetchError } = await supabase
      .from('product')
      .select('*')
      .eq('product_id', productId)
      .eq('franchisor_id', franchisorId)
      .single();

    if (fetchError) return { data: null, error: fetchError };

    // Create new product with modifications
    const newProductData = {
      ...originalProduct,
      ...modifications,
      brand_id: targetBrandId,
      product_id: undefined, // Let database generate new ID
      sku: undefined, // Generate new SKU
      created_at: undefined,
      updated_at: undefined,
    };

    return this.createProduct(newProductData);
  }

  /**
   * Get product analytics
   */
  async getProductAnalytics(brandId?: string): Promise<{
    data: {
      total_products: number;
      active_products: number;
      categories_count: number;
      average_price: number;
      price_range: { min: number; max: number };
      top_selling_products: any[];
      low_stock_products: any[];
      profit_margins: any[];
    } | null;
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    
    try {
      let query = supabase
        .from('product')
        .select('*')
        .eq('franchisor_id', franchisorId);

      if (brandId) {
        query = query.eq('brand_id', brandId);
      }

      const { data: products } = await query;

      const total_products = products?.length || 0;
      const active_products = products?.filter(p => p.is_active).length || 0;

      // Get categories count
      let categoryQuery = supabase
        .from('product_category')
        .select('*', { count: 'exact', head: true })
        .eq('franchisor_id', franchisorId);

      if (brandId) {
        categoryQuery = categoryQuery.eq('brand_id', brandId);
      }

      const { count: categories_count } = await categoryQuery;

      // Calculate price statistics
      const prices = products?.map(p => p.unit_price || 0) || [];
      const average_price = prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : 0;
      const price_range = {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0,
      };

      // Get sales data for top selling products
      const { data: salesData } = await supabase
        .from('sales_transaction_item')
        .select(`
          product_id,
          quantity,
          total_price,
          product:product(product_nm)
        `)
        .eq('franchisor_id', franchisorId);

      const productSales = salesData?.reduce((acc: any, item) => {
        const productId = item.product_id;
        if (!acc[productId]) {
          acc[productId] = {
            product_id: productId,
            product_name: (item.product as any)?.product_nm || 'Unknown',
            total_quantity: 0,
            total_revenue: 0,
          };
        }
        acc[productId].total_quantity += item.quantity || 0;
        acc[productId].total_revenue += item.total_price || 0;
        return acc;
      }, {});

      const top_selling_products = Object.values(productSales || {})
        .sort((a: any, b: any) => b.total_quantity - a.total_quantity)
        .slice(0, 10);

      // Get inventory data for low stock
      const { data: inventoryData } = await supabase
        .from('inventory')
        .select(`
          product_id,
          current_stock,
          min_stock_level,
          product:product(product_nm)
        `)
        .eq('franchisor_id', franchisorId)
        .filter('current_stock', 'lte', 'min_stock_level');

      const low_stock_products = inventoryData?.map(inv => ({
        product_id: inv.product_id,
        product_name: (inv.product as any)?.product_nm || 'Unknown',
        current_stock: inv.current_stock,
        min_stock_level: inv.min_stock_level,
      })) || [];

      // Calculate profit margins
      const profit_margins = products?.map(product => ({
        product_id: product.product_id,
        product_name: product.product_nm,
        unit_price: product.unit_price || 0,
        cost_price: product.cost_price || 0,
        profit_margin: product.unit_price && product.cost_price 
          ? ((product.unit_price - product.cost_price) / product.unit_price) * 100 
          : 0,
      })).filter(p => p.cost_price > 0) || [];

      return {
        data: {
          total_products,
          active_products,
          categories_count: categories_count || 0,
          average_price,
          price_range,
          top_selling_products,
          low_stock_products,
          profit_margins,
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Generate SKU for product
   */
  private async generateSKU(brandId: string, productName: string): Promise<string> {
    // Get brand code
    const { data: brand } = await supabase
      .from('brand')
      .select('brand_nm')
      .eq('brand_id', brandId)
      .single();

    const brandCode = brand?.brand_nm?.substring(0, 3).toUpperCase() || 'BRD';
    const productCode = productName.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    
    return `${brandCode}-${productCode}-${timestamp}`;
  }

  /**
   * Import products from CSV/Excel data
   */
  async importProducts(
    brandId: string,
    productsData: Array<{
      product_nm: string;
      description?: string;
      unit_price: number;
      cost_price?: number;
      category_name?: string;
      sku?: string;
      specifications?: Record<string, any>;
    }>
  ): Promise<{
    data: { imported: number; errors: any[] };
    error: any;
  }> {
    const franchisorId = await this.getCurrentFranchisorId();
    const results = { imported: 0, errors: [] as any[] };

    // Get existing categories for the brand
    const { data: categories } = await this.getCategoriesByBrand(brandId);
    const categoryMap = new Map(categories?.map(c => [c.category_nm, c.category_id]) || []);

    for (const productData of productsData) {
      try {
        let categoryId = undefined;

        // Find or create category
        if (productData.category_name) {
          categoryId = categoryMap.get(productData.category_name);
          
          if (!categoryId) {
            const { data: newCategory } = await this.createCategory({
              brand_id: brandId,
              category_nm: productData.category_name,
            });
            if (newCategory) {
              categoryId = newCategory.category_id;
              categoryMap.set(productData.category_name, categoryId);
            }
          }
        }

        // Create product
        const { error } = await this.createProduct({
          brand_id: brandId,
          category_id: categoryId,
          product_nm: productData.product_nm,
          description: productData.description,
          unit_price: productData.unit_price,
          cost_price: productData.cost_price,
          sku: productData.sku,
          specifications: productData.specifications,
        });

        if (error) {
          results.errors.push({ product: productData.product_nm, error: error.message });
        } else {
          results.imported++;
        }
      } catch (error) {
        results.errors.push({ product: productData.product_nm, error: (error as Error).message });
      }
    }

    return { data: results, error: null };
  }
}
