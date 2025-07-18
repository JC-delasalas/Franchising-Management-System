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

export const CartAPI = {
  // Get cart items for current user with enhanced error handling
  async getCartItems(): Promise<CartItemWithProduct[]> {
    try {
      const { data: user, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('Authentication error in getCartItems:', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (!user.user) {
        console.warn('User not authenticated for cart items');
        throw new Error('User not authenticated');
      }

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
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching cart items:', error);
        throw new Error(`Failed to fetch cart items: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error in getCartItems:', error);
      throw error; // Re-throw to allow proper error handling
    }
  },

  // Add item to cart
  async addToCart(productId: string, quantity: number): Promise<CartItemWithProduct> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('shopping_cart')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Update quantity if item exists
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      // Create new cart item
      const { data, error } = await supabase
        .from('shopping_cart')
        .insert({
          user_id: user.user.id,
          product_id: productId,
          quantity,
        })
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
        console.error('Error adding to cart:', error);
        throw new Error(`Failed to add item to cart: ${error.message}`);
      }

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
      console.error('Error getting cart summary:', error);
      // Re-throw the error to allow proper error handling in the component
      throw error;
    }
  },

  // Get cart item count
  async getCartItemCount(): Promise<number> {
    try {
      const { data: user, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('Authentication error in getCartItemCount:', authError);
        return 0;
      }

      if (!user.user) return 0;

      const { data, error } = await supabase
        .from('shopping_cart')
        .select('quantity')
        .eq('user_id', user.user.id);

      if (error) {
        console.error('Error fetching cart count:', error);
        return 0;
      }

      return data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    } catch (error) {
      console.error('Unexpected error in getCartItemCount:', error);
      return 0;
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
