import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type ReorderTemplate = Database['public']['Tables']['reorder_templates']['Row'];
type ReorderTemplateInsert = Database['public']['Tables']['reorder_templates']['Insert'];

export interface ReorderTemplateWithProducts extends ReorderTemplate {
  products: {
    id: string;
    name: string;
    sku: string;
    price: number;
    images: any[];
    active: boolean;
    unit_of_measure: string;
  }[];
}

export interface CreateReorderTemplateData {
  name: string;
  description?: string;
  template_data: {
    product_id: string;
    quantity: number;
  }[];
  is_favorite?: boolean;
}

export const ReorderTemplatesAPI = {
  // Get all reorder templates for current user
  async getReorderTemplates(): Promise<ReorderTemplateWithProducts[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reorder_templates')
      .select('*')
      .eq('user_id', user.user.id)
      .order('is_favorite', { ascending: false })
      .order('last_used_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reorder templates:', error);
      throw new Error(`Failed to fetch reorder templates: ${error.message}`);
    }

    // Fetch product details for each template
    const templatesWithProducts = await Promise.all(
      (data || []).map(async (template) => {
        const productIds = template.template_data.map((item: any) => item.product_id);
        
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name, sku, price, images, active, unit_of_measure')
          .in('id', productIds);

        if (productsError) {
          console.error('Error fetching products for template:', productsError);
          return { ...template, products: [] };
        }

        // Map products with quantities from template data
        const productsWithQuantities = (products || []).map(product => {
          const templateItem = template.template_data.find((item: any) => item.product_id === product.id);
          return {
            ...product,
            template_quantity: templateItem?.quantity || 0,
          };
        });

        return {
          ...template,
          products: productsWithQuantities,
        };
      })
    );

    return templatesWithProducts;
  },

  // Get single reorder template
  async getReorderTemplate(id: string): Promise<ReorderTemplateWithProducts | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reorder_templates')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching reorder template:', error);
      throw new Error(`Failed to fetch reorder template: ${error.message}`);
    }

    // Fetch product details
    const productIds = data.template_data.map((item: any) => item.product_id);
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, sku, price, images, active, unit_of_measure')
      .in('id', productIds);

    if (productsError) {
      console.error('Error fetching products for template:', productsError);
      return { ...data, products: [] };
    }

    // Map products with quantities from template data
    const productsWithQuantities = (products || []).map(product => {
      const templateItem = data.template_data.find((item: any) => item.product_id === product.id);
      return {
        ...product,
        template_quantity: templateItem?.quantity || 0,
      };
    });

    return {
      ...data,
      products: productsWithQuantities,
    };
  },

  // Create new reorder template
  async createReorderTemplate(templateData: CreateReorderTemplateData): Promise<ReorderTemplate> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reorder_templates')
      .insert({
        user_id: user.user.id,
        ...templateData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating reorder template:', error);
      throw new Error(`Failed to create reorder template: ${error.message}`);
    }

    return data;
  },

  // Update reorder template
  async updateReorderTemplate(id: string, updates: Partial<CreateReorderTemplateData>): Promise<ReorderTemplate> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reorder_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating reorder template:', error);
      throw new Error(`Failed to update reorder template: ${error.message}`);
    }

    return data;
  },

  // Delete reorder template
  async deleteReorderTemplate(id: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('reorder_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id);

    if (error) {
      console.error('Error deleting reorder template:', error);
      throw new Error(`Failed to delete reorder template: ${error.message}`);
    }
  },

  // Mark template as favorite
  async toggleFavorite(id: string): Promise<ReorderTemplate> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Get current template
    const template = await this.getReorderTemplate(id);
    if (!template) throw new Error('Template not found');

    const { data, error } = await supabase
      .from('reorder_templates')
      .update({
        is_favorite: !template.is_favorite,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling favorite:', error);
      throw new Error(`Failed to toggle favorite: ${error.message}`);
    }

    return data;
  },

  // Use template (mark as last used and return items for cart)
  async useTemplate(id: string): Promise<{
    template: ReorderTemplate;
    items: {
      product_id: string;
      quantity: number;
    }[];
  }> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Update last used timestamp
    const { data, error } = await supabase
      .from('reorder_templates')
      .update({
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error using template:', error);
      throw new Error(`Failed to use template: ${error.message}`);
    }

    return {
      template: data,
      items: data.template_data as {
        product_id: string;
        quantity: number;
      }[],
    };
  },

  // Get favorite templates
  async getFavoriteTemplates(): Promise<ReorderTemplateWithProducts[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reorder_templates')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('is_favorite', true)
      .order('name');

    if (error) {
      console.error('Error fetching favorite templates:', error);
      throw new Error(`Failed to fetch favorite templates: ${error.message}`);
    }

    // Fetch product details for each template
    const templatesWithProducts = await Promise.all(
      (data || []).map(async (template) => {
        const productIds = template.template_data.map((item: any) => item.product_id);
        
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name, sku, price, images, active, unit_of_measure')
          .in('id', productIds);

        if (productsError) {
          console.error('Error fetching products for template:', productsError);
          return { ...template, products: [] };
        }

        return {
          ...template,
          products: products || [],
        };
      })
    );

    return templatesWithProducts;
  },

  // Create template from recent order
  async createTemplateFromOrder(orderId: string, name: string, description?: string): Promise<ReorderTemplate> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Get order items
    const { data: orderItems, error: orderError } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);

    if (orderError) {
      console.error('Error fetching order items:', orderError);
      throw new Error(`Failed to fetch order items: ${orderError.message}`);
    }

    if (!orderItems || orderItems.length === 0) {
      throw new Error('No items found in order');
    }

    // Create template
    return this.createReorderTemplate({
      name,
      description,
      template_data: orderItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    });
  },

  // Validate template (check if all products are still active)
  async validateTemplate(id: string): Promise<{
    isValid: boolean;
    inactiveProducts: string[];
    missingProducts: string[];
  }> {
    const template = await this.getReorderTemplate(id);
    if (!template) {
      return {
        isValid: false,
        inactiveProducts: [],
        missingProducts: ['Template not found'],
      };
    }

    const productIds = template.template_data.map((item: any) => item.product_id);
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, active')
      .in('id', productIds);

    if (error) {
      console.error('Error validating template:', error);
      return {
        isValid: false,
        inactiveProducts: [],
        missingProducts: ['Error validating products'],
      };
    }

    const foundProductIds = new Set(products?.map(p => p.id) || []);
    const missingProducts = productIds.filter(id => !foundProductIds.has(id));
    const inactiveProducts = products?.filter(p => !p.active).map(p => p.name) || [];

    return {
      isValid: missingProducts.length === 0 && inactiveProducts.length === 0,
      inactiveProducts,
      missingProducts,
    };
  },
};
