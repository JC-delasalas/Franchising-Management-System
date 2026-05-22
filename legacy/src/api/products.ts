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

          if (filters?.min_price) {
            query = query.gte('price', filters.min_price);
          }

          if (filters?.max_price) {
            query = query.lte('price', filters.max_price);
          }

          // Join with cart data if user is authenticated
          if (user?.id) {
            query = query.eq('shopping_cart.user_id', user.id);
          }

          return query.order('name');
        },
        'products/catalog',
        'GET'
      ).then(data => {
        // Transform data to include cart information
        return (data || []).map(product => ({
          ...product,
          in_cart: product.shopping_cart && product.shopping_cart.length > 0,
          cart_quantity: product.shopping_cart && product.shopping_cart[0] ? product.shopping_cart[0].quantity : 0,
          shopping_cart: undefined, // Remove the join data
        }));
      });
    } catch (error) {
      logError(error as Error, { context: 'getCatalogProducts', filters });
      throw error;
    }
  }

  // Get all products with optional filters
  static async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      return await this.handleResponseWithRetry(
        () => {
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

          return query.order('name');
        },
        'products/list',
        'GET'
      );
    } catch (error) {
      logError(error as Error, { context: 'getProducts', filters });
      throw error;
    }
  }

  // Get product by ID
  static async getProductById(id: string): Promise<Product | null> {
    try {
      return await this.readSingleWithRetry<Product>('products', { id }, '*');
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
  static async getProductBySku(sku: string): Promise<Product | null> {
    try {
      return await this.readSingleWithRetry<Product>('products', { sku }, '*');
    } catch (error: any) {
      // Return null for not found errors, throw others
      if (error.code === 'RESOURCE_NOT_FOUND') {
        return null;
      }
      logError(error, { context: 'getProductBySku', sku });
      throw error;
    }
  }

  // Get product categories
  static async getCategories(): Promise<string[]> {
    try {
      const data = await this.handleResponseWithRetry(
        () => supabase
          .from('products')
          .select('category')
          .not('category', 'is', null)
          .eq('active', true)
          .order('category'),
        'products/categories',
        'GET'
      );

      const categories = [...new Set(data?.map(item => item.category).filter(Boolean))];
      return categories;
    } catch (error) {
      logError(error as Error, { context: 'getCategories' });
      throw error;
    }
  }

  // Get subcategories for a category
  static async getSubcategories(category: string): Promise<string[]> {
    try {
      const data = await this.handleResponseWithRetry(
        () => supabase
          .from('products')
          .select('subcategory')
          .eq('category', category)
          .not('subcategory', 'is', null)
          .eq('active', true)
          .order('subcategory'),
        'products/subcategories',
        'GET'
      );

      const subcategories = [...new Set(data?.map(item => item.subcategory).filter(Boolean))];
      return subcategories;
    } catch (error) {
      logError(error as Error, { context: 'getSubcategories', category });
      throw error;
    }
  }

  // Get product brands
  static async getBrands(): Promise<string[]> {
    try {
      const data = await this.handleResponseWithRetry(
        () => supabase
          .from('products')
          .select('brand')
          .not('brand', 'is', null)
          .eq('active', true)
          .order('brand'),
        'products/brands',
        'GET'
      );

      const brands = [...new Set(data?.map(item => item.brand).filter(Boolean))];
      return brands;
    } catch (error) {
      logError(error as Error, { context: 'getBrands' });
      throw error;
    }
  }

  // Search products
  static async searchProducts(searchTerm: string, limit: number = 20): Promise<Product[]> {
    try {
      return await this.handleResponseWithRetry(
        () => supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
          .eq('active', true)
          .order('name')
          .limit(limit),
        'products/search',
        'GET'
      );
    } catch (error) {
      logError(error as Error, { context: 'searchProducts', searchTerm, limit });
      throw error;
    }
  }

  // Get featured products (you can customize this logic)
  static async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      return await this.handleResponseWithRetry(
        () => supabase
          .from('products')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(limit),
        'products/featured',
        'GET'
      );
    } catch (error) {
      logError(error as Error, { context: 'getFeaturedProducts', limit });
      throw error;
    }
  }

  // Get products by category with pagination
  static async getProductsByCategory(
    category: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    products: Product[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const offset = (page - 1) * limit;

      // Get total count and products in parallel
      const [countResult, productsResult] = await Promise.all([
        this.handleResponseWithRetry(
          () => supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category', category)
            .eq('active', true),
          'products/category/count',
          'GET'
        ),
        this.handleResponseWithRetry(
          () => supabase
            .from('products')
            .select('*')
            .eq('category', category)
            .eq('active', true)
            .order('name')
            .range(offset, offset + limit - 1),
          'products/category/list',
          'GET'
        )
      ]);

      return {
        products: productsResult || [],
        totalCount: countResult?.length || 0,
        hasMore: (countResult?.length || 0) > offset + limit,
      };
    } catch (error) {
      logError(error as Error, { context: 'getProductsByCategory', category, page, limit });
      throw error;
    }
  }

  // Get recently viewed products (would need to track this in localStorage or database)
  static async getRecentlyViewedProducts(productIds: string[]): Promise<Product[]> {
    if (productIds.length === 0) return [];

    try {
      const data = await this.handleResponseWithRetry(
        () => supabase
          .from('products')
          .select('*')
          .in('id', productIds)
          .eq('active', true),
        'products/recently-viewed',
        'GET'
      );

      // Maintain the order of productIds
      const productMap = new Map(data?.map(p => [p.id, p]) || []);
      return productIds.map(id => productMap.get(id)).filter(Boolean) as Product[];
    } catch (error) {
      logError(error as Error, { context: 'getRecentlyViewedProducts', productIds });
      throw error;
    }
  }

  // Get product recommendations (simple implementation based on category)
  static async getRecommendedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    try {
      const product = await this.getProductById(productId);
      if (!product) return [];

      return await this.handleResponseWithRetry(
        () => supabase
          .from('products')
          .select('*')
          .eq('category', product.category)
          .neq('id', productId)
          .eq('active', true)
          .order('name')
          .limit(limit),
        'products/recommendations',
        'GET'
      );
    } catch (error) {
      logError(error as Error, { context: 'getRecommendedProducts', productId, limit });
      return []; // Return empty array for recommendations on error
    }
  }
};
