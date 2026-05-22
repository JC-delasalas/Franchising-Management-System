import { supabase } from '@/lib/supabase';
import { OrderItem } from './OrderManagementService';

export interface PricingResult {
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  grand_total: number;
  currency: string;
  pricing_breakdown: PricingBreakdown[];
}

export interface PricingBreakdown {
  product_id: string;
  product_name: string;
  quantity: number;
  base_price: number;
  franchise_price: number;
  discount_applied: number;
  line_total: number;
}

export interface FranchisePricing {
  id: string;
  franchise_id: string;
  product_id: string;
  base_price: number;
  franchise_discount: number;
  volume_discount_tiers: VolumeDiscountTier[];
  effective_from: string;
  effective_until?: string;
}

export interface VolumeDiscountTier {
  min_quantity: number;
  discount_percentage: number;
}

export interface TaxConfiguration {
  location_id: string;
  tax_rate: number;
  tax_type: 'percentage' | 'fixed';
  tax_name: string;
  applies_to_shipping: boolean;
}

export interface ShippingConfiguration {
  location_id: string;
  base_shipping_rate: number;
  free_shipping_threshold: number;
  express_shipping_rate: number;
  shipping_zones: ShippingZone[];
}

export interface ShippingZone {
  zone_name: string;
  rate_multiplier: number;
  delivery_days: number;
}

export class PricingService {
  // Calculate comprehensive order pricing with franchise-specific rates
  static async calculateOrderPricing(items: OrderItem[], locationId: string): Promise<PricingResult> {
    try {
      // Get franchise information
      const { data: location } = await supabase
        .from('franchise_locations')
        .select('franchise_id, currency, shipping_zone')
        .eq('id', locationId)
        .single();

      if (!location) throw new Error('Location not found');

      // Get franchise pricing for all products
      const productIds = items.map(item => item.product_id);
      const { data: franchisePricing } = await supabase
        .from('franchise_pricing')
        .select(`
          *,
          products (name, base_price, category)
        `)
        .eq('franchise_id', location.franchise_id)
        .in('product_id', productIds)
        .or(`effective_until.is.null,effective_until.gt.${new Date().toISOString()}`);

      // Calculate pricing for each item
      const pricingBreakdown: PricingBreakdown[] = [];
      let subtotal = 0;

      for (const item of items) {
        const pricing = franchisePricing?.find(p => p.product_id === item.product_id);
        const basePrice = pricing?.products.base_price || item.unit_price;
        
        // Apply franchise discount
        const franchiseDiscount = pricing?.franchise_discount || 0;
        let franchisePrice = basePrice * (1 - franchiseDiscount / 100);

        // Apply volume discounts
        const volumeDiscount = this.calculateVolumeDiscount(
          item.quantity, 
          pricing?.volume_discount_tiers || []
        );
        
        const finalPrice = franchisePrice * (1 - volumeDiscount / 100);
        const lineTotal = finalPrice * item.quantity;
        const totalDiscount = franchiseDiscount + volumeDiscount;

        pricingBreakdown.push({
          product_id: item.product_id,
          product_name: pricing?.products.name || item.product_name || 'Unknown Product',
          quantity: item.quantity,
          base_price: basePrice,
          franchise_price: finalPrice,
          discount_applied: totalDiscount,
          line_total: lineTotal
        });

        subtotal += lineTotal;
      }

      // Calculate tax
      const taxAmount = await this.calculateTax(subtotal, locationId);

      // Calculate shipping
      const shippingAmount = await this.calculateShipping(subtotal, items, locationId);

      // Apply any order-level discounts
      const discountAmount = await this.calculateOrderDiscounts(subtotal, location.franchise_id);

      const grandTotal = subtotal + taxAmount + shippingAmount - discountAmount;

      return {
        subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        discount_amount: discountAmount,
        grand_total: grandTotal,
        currency: location.currency || 'PHP',
        pricing_breakdown: pricingBreakdown
      };
    } catch (error) {
      console.error('Error calculating pricing:', error);
      throw error;
    }
  }

  // Calculate volume discounts based on quantity tiers
  private static calculateVolumeDiscount(quantity: number, tiers: VolumeDiscountTier[]): number {
    if (!tiers || tiers.length === 0) return 0;

    // Sort tiers by minimum quantity (descending)
    const sortedTiers = tiers.sort((a, b) => b.min_quantity - a.min_quantity);

    // Find the highest tier that applies
    for (const tier of sortedTiers) {
      if (quantity >= tier.min_quantity) {
        return tier.discount_percentage;
      }
    }

    return 0;
  }

  // Calculate tax based on location configuration
  private static async calculateTax(subtotal: number, locationId: string): Promise<number> {
    try {
      const { data: taxConfig } = await supabase
        .from('tax_configurations')
        .select('*')
        .eq('location_id', locationId)
        .single();

      if (!taxConfig) {
        // Default tax rate if no configuration found
        return subtotal * 0.12; // 12% VAT for Philippines
      }

      if (taxConfig.tax_type === 'percentage') {
        return subtotal * (taxConfig.tax_rate / 100);
      } else {
        return taxConfig.tax_rate; // Fixed tax amount
      }
    } catch (error) {
      console.error('Error calculating tax:', error);
      // Return default tax calculation
      return subtotal * 0.12;
    }
  }

  // Calculate shipping costs
  private static async calculateShipping(subtotal: number, items: OrderItem[], locationId: string): Promise<number> {
    try {
      const { data: shippingConfig } = await supabase
        .from('shipping_configurations')
        .select('*')
        .eq('location_id', locationId)
        .single();

      if (!shippingConfig) {
        // Default shipping calculation
        return subtotal >= 5000 ? 0 : 200; // Free shipping over ₱5,000
      }

      // Check for free shipping threshold
      if (subtotal >= shippingConfig.free_shipping_threshold) {
        return 0;
      }

      // Calculate weight-based or value-based shipping
      const totalWeight = this.calculateTotalWeight(items);
      const baseShipping = shippingConfig.base_shipping_rate;

      // Apply zone multiplier if configured
      const { data: location } = await supabase
        .from('franchise_locations')
        .select('shipping_zone')
        .eq('id', locationId)
        .single();

      const zoneMultiplier = this.getZoneMultiplier(
        location?.shipping_zone, 
        shippingConfig.shipping_zones
      );

      return baseShipping * zoneMultiplier;
    } catch (error) {
      console.error('Error calculating shipping:', error);
      return 200; // Default shipping cost
    }
  }

  // Calculate order-level discounts
  private static async calculateOrderDiscounts(subtotal: number, franchiseId: string): Promise<number> {
    try {
      const { data: discounts } = await supabase
        .from('franchise_discounts')
        .select('*')
        .eq('franchise_id', franchiseId)
        .eq('is_active', true)
        .lte('valid_from', new Date().toISOString())
        .or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`);

      if (!discounts || discounts.length === 0) return 0;

      let totalDiscount = 0;

      for (const discount of discounts) {
        if (subtotal >= discount.minimum_order_amount) {
          if (discount.discount_type === 'percentage') {
            totalDiscount += subtotal * (discount.discount_value / 100);
          } else {
            totalDiscount += discount.discount_value;
          }
        }
      }

      return Math.min(totalDiscount, subtotal * 0.5); // Cap at 50% of subtotal
    } catch (error) {
      console.error('Error calculating order discounts:', error);
      return 0;
    }
  }

  // Helper methods
  private static calculateTotalWeight(items: OrderItem[]): number {
    // This would typically fetch product weights from database
    // For now, estimate based on quantity
    return items.reduce((total, item) => total + (item.quantity * 0.5), 0); // 0.5kg per item average
  }

  private static getZoneMultiplier(shippingZone: string | undefined, zones: ShippingZone[]): number {
    if (!shippingZone || !zones) return 1;

    const zone = zones.find(z => z.zone_name === shippingZone);
    return zone?.rate_multiplier || 1;
  }

  // Get pricing preview for UI
  static async getPricingPreview(items: OrderItem[], locationId: string): Promise<PricingResult> {
    return this.calculateOrderPricing(items, locationId);
  }

  // Update franchise pricing
  static async updateFranchisePricing(
    franchiseId: string, 
    productId: string, 
    pricing: Partial<FranchisePricing>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('franchise_pricing')
        .upsert({
          franchise_id: franchiseId,
          product_id: productId,
          ...pricing,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating franchise pricing:', error);
      throw error;
    }
  }

  // Get pricing history for analytics
  static async getPricingHistory(franchiseId: string, productId?: string): Promise<FranchisePricing[]> {
    try {
      let query = supabase
        .from('franchise_pricing')
        .select(`
          *,
          products (name, sku, category)
        `)
        .eq('franchise_id', franchiseId)
        .order('effective_from', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching pricing history:', error);
      throw error;
    }
  }

  // Calculate profit margins
  static async calculateProfitMargins(items: OrderItem[], locationId: string): Promise<{
    totalCost: number;
    totalRevenue: number;
    grossProfit: number;
    profitMargin: number;
  }> {
    try {
      const pricingResult = await this.calculateOrderPricing(items, locationId);
      
      // Get product costs
      const productIds = items.map(item => item.product_id);
      const { data: products } = await supabase
        .from('products')
        .select('id, cost_price')
        .in('id', productIds);

      const totalCost = items.reduce((sum, item) => {
        const product = products?.find(p => p.id === item.product_id);
        const costPrice = product?.cost_price || 0;
        return sum + (costPrice * item.quantity);
      }, 0);

      const totalRevenue = pricingResult.subtotal;
      const grossProfit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      return {
        totalCost,
        totalRevenue,
        grossProfit,
        profitMargin
      };
    } catch (error) {
      console.error('Error calculating profit margins:', error);
      throw error;
    }
  }
}
