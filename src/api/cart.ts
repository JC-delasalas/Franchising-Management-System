import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type CartItem = Database['public']['Tables']['shopping_cart']['Row'];
type CartItemInsert = Database['public']['Tables']['shopping_cart']['Insert'];

export interface CartItemWithProduct extends CartItem {
  products: {
    id: string;
    name: string;
    sku: string;
    price: number;
    images: any[];
    description: string;
    unit_of_measure: string;
    minimum_order_qty: number;
    maximum_order_qty: number;
    active: boolean;
  };
}

export interface CartSummary {
  items: CartItemWithProduct[];
  itemCount: number;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
}

// Cache authentication check to prevent multiple simultaneous calls
let authCache: { user: any; timestamp: number } | null = null;
const AUTH_CACHE_DURATION = 5000; // 5 seconds

// Cache cart data to reduce database calls
let cartCache: { data: CartItemWithProduct[]; timestamp: number; userId: string } | null = null;
const CART_CACHE_DURATION = 10000; // 10 seconds

const getAuthenticatedUser = async () => {
  // Use cached auth if available and recent
  if (authCache && (Date.now() - authCache.timestamp) < AUTH_CACHE_DURATION) {
    return authCache.user;
  }

  const { data: user, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error('Authentication error:', authError);
    throw new Error(`Authentication failed: ${authError.message}`);
  }

  if (!user.user) {
    throw new Error('User not authenticated');
  }

  // Cache the result
  authCache = { user: user.user, timestamp: Date.now() };
  return user.user;
};

// Cache invalidation utilities
const invalidateCartCache = () => {
  cartCache = null;
  console.log('🗑️ Cart cache invalidated');
};

const invalidateAuthCache = () => {
  authCache = null;
  console.log('🗑️ Auth cache invalidated');
};

export const CartAPI = {
  // Get cart items for current user with enhanced error handling and performance optimization
  async getCartItems(): Promise<CartItemWithProduct[]> {
    try {
      const user = await getAuthenticatedUser();

      // Check cache first
      if (cartCache &&
          cartCache.userId === user.id &&
          (Date.now() - cartCache.timestamp) < CART_CACHE_DURATION) {
        console.log('🚀 Using cached cart data');
        return cartCache.data;
      }

      console.log('📡 Fetching fresh cart data from database for user:', user.id);

      // Optimized query with specific field selection and better join strategy
      const { data, error } = await supabase
        .from('shopping_cart')
        .select(`
          id,
          user_id,
          product_id,
          quantity,
          added_at,
          updated_at,
          products!inner (
            id,
            name,
            sku,
            price,
            images,
            description,
            unit_of_measure,
            minimum_order_qty,
            maximum_order_qty,
            active
          )
        `)
        .eq('user_id', user.id)
        .eq('products.active', true)
        .order('added_at', { ascending: false })
        .limit(50); // Reasonable limit to prevent excessive data loading

      console.log('📡 Cart query result:', { data, error, itemCount: data?.length || 0 });

      if (error) {
        console.error('❌ Error fetching cart items:', error);
        throw new Error(`Failed to fetch cart items: ${error.message}`);
      }

      const cartItems = data || [];
      console.log('📡 Final cart items:', cartItems);

      // Cache the result
      cartCache = {
        data: cartItems,
        timestamp: Date.now(),
        userId: user.id
      };

      return cartItems;
    } catch (error) {
      console.error('Unexpected error in getCartItems:', error);
      throw error; // Re-throw to allow proper error handling
    }
  },

  // Add item to cart
  async addToCart(productId: string, quantity: number): Promise<CartItemWithProduct> {
    console.log('🛒 ADD TO CART - Starting:', { productId, quantity });

    const { data: user } = await supabase.auth.getUser();
    console.log('🛒 ADD TO CART - User:', { userId: user.user?.id, authenticated: !!user.user });

    if (!user.user) throw new Error('User not authenticated');

    // Check if item already exists in cart
    console.log('🛒 ADD TO CART - Checking existing item...');
    const { data: existingItem } = await supabase
      .from('shopping_cart')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('product_id', productId)
      .single();

    console.log('🛒 ADD TO CART - Existing item check:', { existingItem });

    if (existingItem) {
      console.log('🛒 ADD TO CART - Updating existing item quantity');
      // Update quantity if item exists
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      console.log('🛒 ADD TO CART - Creating new cart item');
      // Create new cart item
      const insertData = {
        user_id: user.user.id,
        product_id: productId,
        quantity,
      };
      console.log('🛒 ADD TO CART - Insert data:', insertData);

      const { data, error } = await supabase
        .from('shopping_cart')
        .insert(insertData)
        .select(`
          *,
          products!inner (
            id,
            name,
            sku,
            price,
            images,
            description,
            unit_of_measure,
            minimum_order_qty,
            maximum_order_qty,
            active
          )
        `)
        .single();

      console.log('🛒 ADD TO CART - Insert result:', { data, error });

      if (error) {
        console.error('🛒 ADD TO CART - ERROR:', error);
        throw new Error(`Failed to add item to cart: ${error.message}`);
      }

      // Invalidate cache after successful mutation
      invalidateCartCache();
      console.log('🛒 ADD TO CART - SUCCESS:', data);

      return data;
    }
  },

  // Update cart item quantity
  async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartItemWithProduct> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    if (quantity <= 0) {
      await this.removeFromCart(cartItemId);
      throw new Error('Item removed from cart');
    }

    const { data, error } = await supabase
      .from('shopping_cart')
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cartItemId)
      .eq('user_id', user.user.id)
      .select(`
        *,
        products!inner (
          id,
          name,
          sku,
          price,
          images,
          description,
          unit_of_measure,
          minimum_order_qty,
          maximum_order_qty,
          active
        )
      `)
      .single();

    if (error) {
      console.error('Error updating cart item:', error);
      throw new Error(`Failed to update cart item: ${error.message}`);
    }

    // Invalidate cache after successful mutation
    invalidateCartCache();

    return data;
  },

  // Remove item from cart
  async removeFromCart(cartItemId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('shopping_cart')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', user.user.id);

    if (error) {
      console.error('Error removing from cart:', error);
      throw new Error(`Failed to remove item from cart: ${error.message}`);
    }

    // Invalidate cache after successful mutation
    invalidateCartCache();
  },

  // Clear entire cart
  async clearCart(): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('shopping_cart')
      .delete()
      .eq('user_id', user.user.id);

    if (error) {
      console.error('Error clearing cart:', error);
      throw new Error(`Failed to clear cart: ${error.message}`);
    }
  },

  // Get cart summary with calculations and error handling
  async getCartSummary(): Promise<CartSummary> {
    try {
      const items = await this.getCartItems();

      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.products.price), 0);
      const taxAmount = subtotal * 0.12; // 12% VAT
      const shippingCost = subtotal > 5000 ? 0 : 200; // Free shipping over ₱5,000
      const total = subtotal + taxAmount + shippingCost;

      return {
        items,
        itemCount,
        subtotal,
        taxAmount,
        shippingCost,
        total,
      };
    } catch (error) {
      console.error('Error in getCartSummary:', error);
      throw error; // Re-throw to allow proper error handling
    }
  },

  // Get cart item count - optimized to use cached authentication
  async getCartItemCount(): Promise<number> {
    try {
      const user = await getAuthenticatedUser();

      const { data, error } = await supabase
        .from('shopping_cart')
        .select('quantity')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart count:', error);
        throw new Error(`Failed to fetch cart count: ${error.message}`);
      }

      return data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    } catch (error) {
      console.error('Unexpected error in getCartItemCount:', error);
      throw error; // Re-throw to allow proper error handling
    }
  },

  // Check if product is in cart
  async isProductInCart(productId: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { data, error } = await supabase
      .from('shopping_cart')
      .select('id')
      .eq('user_id', user.user.id)
      .eq('product_id', productId)
      .single();

    return !error && !!data;
  },

  // Get cart item for specific product
  async getCartItemForProduct(productId: string): Promise<CartItemWithProduct | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data, error } = await supabase
      .from('shopping_cart')
      .select(`
        *,
        products!inner (
          id,
          name,
          sku,
          price,
          images,
          description,
          unit_of_measure,
          minimum_order_qty,
          maximum_order_qty,
          active
        )
      `)
      .eq('user_id', user.user.id)
      .eq('product_id', productId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching cart item:', error);
      return null;
    }

    return data;
  },

  // Validate cart before checkout
  async validateCart(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const items = await this.getCartItems();
      const errors: string[] = [];
      const warnings: string[] = [];

      if (items.length === 0) {
        return { isValid: true, errors: [], warnings: ['Cart is empty'] };
      }

      for (const item of items) {
        const product = item.products;

        // Skip validation if product data is missing
        if (!product) {
          errors.push(`Product data missing for cart item ${item.id}`);
          continue;
        }

        // Check if product is still active
        if (!product.active) {
          errors.push(`${product.name} is no longer available`);
          continue;
        }

        // Check minimum order quantity
        if (item.quantity < product.minimum_order_qty) {
          errors.push(`${product.name} requires a minimum order of ${product.minimum_order_qty} ${product.unit_of_measure}`);
        }

        // Check maximum order quantity
        if (product.maximum_order_qty && item.quantity > product.maximum_order_qty) {
          errors.push(`${product.name} has a maximum order limit of ${product.maximum_order_qty} ${product.unit_of_measure}`);
        }

        // Add warnings for large quantities
        if (product.maximum_order_qty && item.quantity > product.maximum_order_qty * 0.8) {
          warnings.push(`${product.name}: You're ordering close to the maximum limit`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      console.error('Error validating cart:', error);
      return {
        isValid: false,
        errors: ['Unable to validate cart. Please try again.'],
        warnings: [],
      };
    }
  },

  // Sync cart with product updates (remove inactive products, update prices)
  async syncCart(): Promise<{
    removedItems: string[];
    updatedItems: string[];
  }> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const items = await this.getCartItems();
    const removedItems: string[] = [];
    const updatedItems: string[] = [];

    for (const item of items) {
      const product = item.products;

      // Remove inactive products
      if (!product.active) {
        await this.removeFromCart(item.id);
        removedItems.push(product.name);
        continue;
      }

      // Note: In a real application, you might want to update prices here
      // if they've changed since the item was added to cart
    }

    return {
      removedItems,
      updatedItems,
    };
  },

  // Save cart as reorder template
  async saveAsReorderTemplate(name: string, description?: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const items = await this.getCartItems();
    
    if (items.length === 0) {
      throw new Error('Cannot save empty cart as template');
    }

    const templateData = items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }));

    const { error } = await supabase
      .from('reorder_templates')
      .insert({
        user_id: user.user.id,
        name,
        description,
        template_data: templateData,
      });

    if (error) {
      console.error('Error saving reorder template:', error);
      throw new Error(`Failed to save reorder template: ${error.message}`);
    }
  },
};
