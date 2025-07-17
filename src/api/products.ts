import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { BaseAPI } from './base';
import { handleAPIError, logError } from '@/lib/errors';

type Product = Database['public']['Tables']['products']['Row'];

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  active?: boolean;
  search?: string;
  min_price?: number;
  max_price?: number;
}

export interface ProductCatalogItem extends Product {
  in_cart?: boolean;
  cart_quantity?: number;
}

export class ProductsAPI extends BaseAPI {
  // Get all products with optional filters for catalog
  static async getCatalogProducts(filters?: ProductFilters): Promise<ProductCatalogItem[]> {
    try {
      const user = await this.getCurrentUser();

      return await this.handleResponseWithRetry(
        () => {
          let query = supabase.from('products').select(`
            *,
            shopping_cart!left (
              id,
              quantity
            )
          `);

          // Only show active products in catalog
          query = query.eq('active', true);

          if (filters?.category) {
            query = query.eq('category', filters.category);
          }

          if (filters?.subcategory) {
            query = query.eq('subcategory', filters.subcategory);
          }

          if (filters?.brand) {
            query = query.eq('brand', filters.brand);
          }

          if (filters?.search) {
            query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
          }

          return query;
        },
        'products/catalog',
        'GET'
      );
    } catch (error) {
      logError(error as Error, { context: 'getCatalogProducts', filters });
      throw error;
    }
  }

    if (filters?.min_price) {
      query = query.gte('price', filters.min_price);
    }

    if (filters?.max_price) {
      query = query.lte('price', filters.max_price);
    }

    // Join with cart data if user is authenticated
    if (user.user) {
      query = query.eq('shopping_cart.user_id', user.user.id);
    }

    query = query.order('name');

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching catalog products:', error);
      throw new Error(`Failed to fetch catalog products: ${error.message}`);
    }

    // Transform data to include cart information
    return (data || []).map(product => ({
      ...product,
      in_cart: product.shopping_cart && product.shopping_cart.length > 0,
      cart_quantity: product.shopping_cart?.[0]?.quantity || 0,
      shopping_cart: undefined, // Remove the join data
    }));
  },

  // Get all products with optional filters
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    let query = supabase.from('products').select('*');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.subcategory) {
      query = query.eq('subcategory', filters.subcategory);
    }

    if (filters?.brand) {
      query = query.eq('brand', filters.brand);
    }

    if (filters?.active !== undefined) {
      query = query.eq('active', filters.active);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }

    if (filters?.min_price) {
      query = query.gte('price', filters.min_price);
    }

    if (filters?.max_price) {
      query = query.lte('price', filters.max_price);
    }

    query = query.order('name');

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data || [];
  },

  // Get product by ID
  static async getProductById(id: string): Promise<Product | null> {
    try {
      return await this.readSingle<Product>('products', { id }, '*');
    } catch (error: any) {
      // Return null for not found errors, throw others
      if (error.code === 'RESOURCE_NOT_FOUND') {
        return null;
      }
      logError(error, { context: 'getProductById', productId: id });
      throw error;
    }
  }

  // Get product by SKU
  async getProductBySku(sku: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching product by SKU:', error);
      throw new Error(`Failed to fetch product by SKU: ${error.message}`);
    }

    return data;
  },

  // Get product categories
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)
      .eq('active', true)
      .order('category');

    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    const categories = [...new Set(data?.map(item => item.category).filter(Boolean))];
    return categories;
  },

  // Get subcategories for a category
  async getSubcategories(category: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('products')
      .select('subcategory')
      .eq('category', category)
      .not('subcategory', 'is', null)
      .eq('active', true)
      .order('subcategory');

    if (error) {
      console.error('Error fetching subcategories:', error);
      throw new Error(`Failed to fetch subcategories: ${error.message}`);
    }

    const subcategories = [...new Set(data?.map(item => item.subcategory).filter(Boolean))];
    return subcategories;
  },

  // Get product brands
  async getBrands(): Promise<string[]> {
    const { data, error } = await supabase
      .from('products')
      .select('brand')
      .not('brand', 'is', null)
      .eq('active', true)
      .order('brand');

    if (error) {
      console.error('Error fetching brands:', error);
      throw new Error(`Failed to fetch brands: ${error.message}`);
    }

    const brands = [...new Set(data?.map(item => item.brand).filter(Boolean))];
    return brands;
  },

  // Search products
  async searchProducts(searchTerm: string, limit: number = 20): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
      .eq('active', true)
      .order('name')
      .limit(limit);

    if (error) {
      console.error('Error searching products:', error);
      throw new Error(`Failed to search products: ${error.message}`);
    }

    return data || [];
  },

  // Get featured products (you can customize this logic)
  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured products:', error);
      throw new Error(`Failed to fetch featured products: ${error.message}`);
    }

    return data || [];
  },

  // Get products by category with pagination
  async getProductsByCategory(
    category: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{
    products: Product[];
    totalCount: number;
    hasMore: boolean;
  }> {
    const offset = (page - 1) * limit;

    // Get total count
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category', category)
      .eq('active', true);

    // Get products
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('active', true)
      .order('name')
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching products by category:', error);
      throw new Error(`Failed to fetch products by category: ${error.message}`);
    }

    return {
      products: data || [],
      totalCount: count || 0,
      hasMore: (count || 0) > offset + limit,
    };
  },

  // Get recently viewed products (would need to track this in localStorage or database)
  async getRecentlyViewedProducts(productIds: string[]): Promise<Product[]> {
    if (productIds.length === 0) return [];

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('active', true);

    if (error) {
      console.error('Error fetching recently viewed products:', error);
      throw new Error(`Failed to fetch recently viewed products: ${error.message}`);
    }

    // Maintain the order of productIds
    const productMap = new Map(data?.map(p => [p.id, p]) || []);
    return productIds.map(id => productMap.get(id)).filter(Boolean) as Product[];
  },

  // Get product recommendations (simple implementation based on category)
  async getRecommendedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    const product = await this.getProductById(productId);
    if (!product) return [];

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', product.category)
      .neq('id', productId)
      .eq('active', true)
      .order('name')
      .limit(limit);

    if (error) {
      console.error('Error fetching recommended products:', error);
      return [];
    }

    return data || [];
  },
};
