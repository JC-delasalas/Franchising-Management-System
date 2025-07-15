# Integration Implementation Roadmap

## 🎯 **Systematic Frontend-Backend-Database Integration Plan**

### **Executive Summary**
This roadmap provides specific, actionable steps to integrate the enhanced 25-table database schema with the frontend and backend systems, eliminating current gaps and achieving seamless system coherence.

## 📋 **Phase 1: Critical Infrastructure (Weeks 1-2)**

### **Step 1.1: Authentication System Overhaul**

#### **Remove Mock Authentication**
```bash
# Files to DELETE
rm src/services/authService.ts
rm src/services/auth/authTypes.ts
rm src/services/auth/authStorage.ts
rm src/services/auth/predefinedAccounts.ts
rm src/services/auth/emailVerification.ts
```

#### **Implement Proper Supabase Auth**
```typescript
// CREATE: src/hooks/useAuth.ts
import { useSupabaseAuth } from './useSupabase';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/api/auth';

export const useAuth = () => {
  const { user, session, loading } = useSupabaseAuth();
  
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getUserProfile(user?.id!),
    enabled: !!user?.id,
  });

  return {
    user: profile,
    session,
    isAuthenticated: !!session,
    isLoading: loading || profileLoading,
    role: profile?.role,
    permissions: profile?.metadata?.permissions || {},
  };
};
```

#### **Update All Components**
```typescript
// UPDATE: Replace all instances of getCurrentUser() with useAuth()
// BEFORE:
import { getCurrentUser } from '@/services/authService';
const user = getCurrentUser();

// AFTER:
import { useAuth } from '@/hooks/useAuth';
const { user, role, isAuthenticated } = useAuth();
```

### **Step 1.2: Database Schema Deployment**

#### **Deploy Enhanced Schema**
```bash
# Deploy the enhanced schema
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > src/types/database.ts

# Verify deployment
supabase db diff
```

#### **Create Database Types**
```typescript
// CREATE: src/types/enhanced-schema.ts
export interface FranchisePackage {
  id: string;
  franchise_id: string;
  name: 'Starter' | 'Standard' | 'Premium';
  description: string;
  initial_fee: number;
  monthly_royalty_rate: number;
  marketing_fee_rate: number;
  included_products: string[];
  max_locations: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  franchise_location_id: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';
  order_date: string;
  order_type: 'inventory' | 'equipment' | 'marketing' | 'supplies';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryLevel {
  warehouse_id: string;
  product_id: string;
  quantity_on_hand: number;
  reserved_quantity: number;
  available_quantity: number;
  reorder_level: number;
  max_stock_level: number;
  last_counted_at?: string;
  last_restocked_at?: string;
  cost_per_unit?: number;
  expiry_date?: string;
}
```

### **Step 1.3: API Layer Implementation**

#### **Create API Structure**
```typescript
// CREATE: src/api/base.ts
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

export class BaseAPI {
  protected static async handleResponse<T>(
    promise: Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    const { data, error } = await promise;
    
    if (error) {
      console.error('API Error:', error);
      throw new Error(error.message || 'An error occurred');
    }
    
    if (!data) {
      throw new Error('No data returned');
    }
    
    return data;
  }

  protected static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    return user;
  }
}
```

#### **Implement Core APIs**
```typescript
// CREATE: src/api/franchises.ts
import { BaseAPI } from './base';
import { supabase } from '@/lib/supabase';
import { FranchisePackage } from '@/types/enhanced-schema';

export class FranchiseAPI extends BaseAPI {
  static async getFranchisePackages(franchiseId: string): Promise<FranchisePackage[]> {
    return this.handleResponse(
      supabase
        .from('franchise_packages')
        .select('*')
        .eq('franchise_id', franchiseId)
        .eq('active', true)
        .order('sort_order')
    );
  }

  static async createApplication(applicationData: {
    franchise_id: string;
    package_id: string;
    application_data: Record<string, any>;
  }) {
    const user = await this.getCurrentUser();
    
    return this.handleResponse(
      supabase
        .from('franchise_applications')
        .insert({
          ...applicationData,
          applicant_id: user.id,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single()
    );
  }
}
```

```typescript
// CREATE: src/api/orders.ts
import { BaseAPI } from './base';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types/enhanced-schema';

export class OrderAPI extends BaseAPI {
  static async createOrder(orderData: {
    franchise_location_id: string;
    order_type: string;
    items: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
    }>;
  }): Promise<Order> {
    const user = await this.getCurrentUser();
    
    // Generate order number
    const orderNumber = await this.generateOrderNumber();
    
    // Calculate totals
    const subtotal = orderData.items.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price), 0
    );
    
    // Create order
    const order = await this.handleResponse(
      supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          franchise_location_id: orderData.franchise_location_id,
          order_type: orderData.order_type,
          status: 'Pending',
          subtotal,
          total_amount: subtotal, // Add tax/shipping later
          created_by: user.id,
          order_date: new Date().toISOString(),
        })
        .select()
        .single()
    );

    // Create order items
    await Promise.all(
      orderData.items.map(item =>
        supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.quantity * item.unit_price,
          })
      )
    );

    return order;
  }

  static async getOrdersByLocation(locationId: string): Promise<Order[]> {
    return this.handleResponse(
      supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, sku)
          )
        `)
        .eq('franchise_location_id', locationId)
        .order('created_at', { ascending: false })
    );
  }

  private static async generateOrderNumber(): Promise<string> {
    const { data } = await supabase.rpc('generate_order_number');
    return data || `ORD-${Date.now()}`;
  }
}
```

```typescript
// CREATE: src/api/inventory.ts
import { BaseAPI } from './base';
import { supabase } from '@/lib/supabase';
import { InventoryLevel } from '@/types/enhanced-schema';

export class InventoryAPI extends BaseAPI {
  static async getInventoryByLocation(locationId: string): Promise<InventoryLevel[]> {
    // Use the inventory_status view for comprehensive data
    return this.handleResponse(
      supabase
        .from('inventory_status')
        .select('*')
        .eq('warehouse_id', locationId) // Assuming location maps to warehouse
    );
  }

  static async updateStock(updates: Array<{
    warehouse_id: string;
    product_id: string;
    quantity_change: number;
    movement_type: 'in' | 'out' | 'adjustment';
    reference_type?: string;
    reference_id?: string;
  }>) {
    const user = await this.getCurrentUser();
    
    // Create stock movements
    const movements = updates.map(update => ({
      warehouse_id: update.warehouse_id,
      product_id: update.product_id,
      movement_type: update.movement_type,
      quantity: Math.abs(update.quantity_change),
      reference_type: update.reference_type,
      reference_id: update.reference_id,
      performed_by: user.id,
    }));

    return this.handleResponse(
      supabase
        .from('stock_movements')
        .insert(movements)
    );
  }

  static async getLowStockAlerts(warehouseId: string) {
    return this.handleResponse(
      supabase
        .from('low_stock_alerts')
        .select('*')
        .eq('warehouse_id', warehouseId)
        .order('priority_order')
    );
  }
}
```

## 📋 **Phase 2: Business Logic Integration (Weeks 3-4)**

### **Step 2.1: Service Layer Implementation**

```typescript
// CREATE: src/services/OrderService.ts
import { OrderAPI } from '@/api/orders';
import { InventoryAPI } from '@/api/inventory';
import { NotificationService } from './NotificationService';

export class OrderService {
  static async createOrderWithValidation(orderData: any) {
    // 1. Validate inventory availability
    const inventory = await InventoryAPI.getInventoryByLocation(
      orderData.franchise_location_id
    );
    
    for (const item of orderData.items) {
      const stockItem = inventory.find(inv => inv.product_id === item.product_id);
      if (!stockItem || stockItem.available_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id}`);
      }
    }

    // 2. Create order
    const order = await OrderAPI.createOrder(orderData);

    // 3. Reserve inventory
    const reservations = orderData.items.map(item => ({
      warehouse_id: orderData.franchise_location_id,
      product_id: item.product_id,
      quantity_change: -item.quantity,
      movement_type: 'out' as const,
      reference_type: 'order_reservation',
      reference_id: order.id,
    }));

    await InventoryAPI.updateStock(reservations);

    // 4. Trigger notifications
    await NotificationService.notifyOrderCreated(order);

    return order;
  }

  static async approveOrder(orderId: string) {
    // Implementation for order approval workflow
    // Update order status, trigger shipment creation, etc.
  }
}
```

### **Step 2.2: Real-time Features**

```typescript
// CREATE: src/hooks/useRealtimeData.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useRealtimeInventory = (locationId: string) => {
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    // Initial load
    InventoryAPI.getInventoryByLocation(locationId)
      .then(setInventory)
      .catch(console.error);

    // Real-time subscription
    const subscription = supabase
      .channel(`inventory:${locationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inventory_levels',
        filter: `warehouse_id=eq.${locationId}`
      }, (payload) => {
        setInventory(prev => {
          const updated = [...prev];
          const index = updated.findIndex(
            item => item.product_id === payload.new.product_id
          );
          
          if (index >= 0) {
            updated[index] = { ...updated[index], ...payload.new };
          }
          
          return updated;
        });
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [locationId]);

  return inventory;
};
```

## 📋 **Phase 3: Frontend Integration (Weeks 5-6)**

### **Step 3.1: Update Dashboard Components**

```typescript
// UPDATE: src/components/dashboard/KPICards.tsx
import { useQuery } from '@tanstack/react-query';
import { AnalyticsAPI } from '@/api/analytics';
import { useAuth } from '@/hooks/useAuth';

export const KPICards: React.FC = () => {
  const { user } = useAuth();
  
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['kpi-metrics', user?.id],
    queryFn: () => AnalyticsAPI.getKPIMetrics(user?.id!),
    enabled: !!user?.id,
  });

  if (isLoading) return <KPICardsSkeleton />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KPICard
        title="Today's Sales"
        value={metrics?.todaySales || 0}
        change={metrics?.salesChange || 0}
        icon={DollarSign}
      />
      {/* More KPI cards with real data */}
    </div>
  );
};
```

### **Step 3.2: Update Inventory Components**

```typescript
// UPDATE: src/components/dashboard/tabs/InventoryTab.tsx
import { useRealtimeInventory } from '@/hooks/useRealtimeData';
import { OrderService } from '@/services/OrderService';

export const InventoryTab: React.FC = () => {
  const { user } = useAuth();
  const inventory = useRealtimeInventory(user?.location_id!);
  
  const createOrderMutation = useMutation({
    mutationFn: OrderService.createOrderWithValidation,
    onSuccess: () => {
      toast({ title: 'Order created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating order', description: error.message });
    },
  });

  const handleQuickOrder = (productId: string, quantity: number) => {
    createOrderMutation.mutate({
      franchise_location_id: user?.location_id,
      order_type: 'inventory',
      items: [{ product_id: productId, quantity, unit_price: 0 }], // Price from product
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {inventory.map((item) => (
            <InventoryItem
              key={item.product_id}
              item={item}
              onReorder={handleQuickOrder}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
```

## 🎯 **Success Metrics**

### **Technical Metrics**
- **Authentication:** 100% Supabase Auth integration
- **Database:** All 25 tables actively used
- **API Coverage:** 95% of frontend needs met
- **Real-time:** Live updates for inventory and orders

### **Business Metrics**
- **Order Processing:** End-to-end workflow functional
- **Inventory Management:** Real-time stock tracking
- **Analytics:** Live business intelligence
- **User Experience:** Seamless, responsive interface

### **Performance Targets**
- **Page Load:** < 2 seconds
- **API Response:** < 500ms
- **Real-time Updates:** < 100ms latency
- **Error Rate:** < 1%

This roadmap provides a systematic approach to achieving complete frontend-backend-database integration, eliminating current gaps and delivering a production-ready franchise management system.
