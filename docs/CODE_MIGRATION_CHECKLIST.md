# Code Migration Checklist: Mock to Real Integration

## 🎯 **Systematic Code Migration Plan**

This checklist provides specific file-by-file migration steps to replace mock implementations with real database integration.

## 📋 **Phase 1: Authentication System Migration**

### **✅ Step 1.1: Remove Mock Authentication**

#### **Files to DELETE**
```bash
# Remove all mock authentication files
rm src/services/authService.ts
rm src/services/auth/authTypes.ts
rm src/services/auth/authStorage.ts
rm src/services/auth/predefinedAccounts.ts
rm src/services/auth/emailVerification.ts
```

#### **Files to UPDATE**

**1. src/App.tsx**
```typescript
// BEFORE:
import { AuthProvider } from './contexts/AuthContext';

// AFTER:
import { SupabaseProvider } from './contexts/SupabaseContext';

// BEFORE:
<AuthProvider>
  <QueryClientProvider client={queryClient}>

// AFTER:
<SupabaseProvider>
  <QueryClientProvider client={queryClient}>
```

**2. src/components/auth/RequireAuth.tsx**
```typescript
// BEFORE:
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUser } from '@/services/authService';

// AFTER:
import { useAuth } from '@/hooks/useAuth';

// BEFORE:
const { isAuthenticated, user } = useAuth();

// AFTER:
const { isAuthenticated, user, isLoading } = useAuth();

// ADD loading state handling:
if (isLoading) return <LoadingSpinner />;
```

**3. src/pages/Login.tsx**
```typescript
// BEFORE:
import { loginUser } from '@/services/authService';

const handleLogin = async (data: LoginFormData) => {
  try {
    await loginUser(data);
    navigate('/dashboard');
  } catch (error) {
    setError(error.message);
  }
};

// AFTER:
import { supabase } from '@/lib/supabase';

const handleLogin = async (data: LoginFormData) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    
    if (error) throw error;
    
    // Navigation handled by auth state change
  } catch (error) {
    setError(error.message);
  }
};
```

### **✅ Step 1.2: Update All Component Imports**

**Search and Replace Pattern:**
```bash
# Find all files using mock auth
grep -r "getCurrentUser\|useAuth.*AuthContext\|authService" src/

# Replace imports in each file:
# BEFORE:
import { getCurrentUser } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

# AFTER:
import { useAuth } from '@/hooks/useAuth';
```

**Key Files to Update:**
- `src/components/navigation/useNavigationData.ts`
- `src/components/dashboard/DashboardHeader.tsx`
- `src/components/dashboard/KPICards.tsx`
- `src/pages/FranchiseeDashboard.tsx`
- `src/pages/FranchisorDashboard.tsx`

## 📋 **Phase 2: Database Service Migration**

### **✅ Step 2.1: Replace DatabaseService**

**1. src/services/DatabaseService.ts**
```typescript
// REPLACE entire file with:
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

export class DatabaseService {
  static async create<T>(
    table: keyof Database['public']['Tables'],
    data: any
  ): Promise<T> {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return result;
  }

  static async read<T>(
    table: keyof Database['public']['Tables'],
    filters?: Record<string, any>
  ): Promise<T[]> {
    let query = supabase.from(table).select('*');
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  static async update<T>(
    table: keyof Database['public']['Tables'],
    id: string,
    data: any
  ): Promise<T> {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return result;
  }

  static async delete(
    table: keyof Database['public']['Tables'],
    id: string
  ): Promise<void> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(error.message);
  }
}
```

### **✅ Step 2.2: Update Service Classes**

**1. src/services/FranchiseService.ts**
```typescript
// BEFORE:
export class FranchiseService extends DatabaseService {
  static async getFranchises(userId?: string) {
    const filters = userId ? { owner_id: userId } : {};
    return this.read<Franchise>('franchises', filters);
  }
}

// AFTER:
import { FranchiseAPI } from '@/api/franchises';

export class FranchiseService {
  static async getFranchises(userId?: string) {
    if (userId) {
      return FranchiseAPI.getFranchisesByOwner(userId);
    }
    return FranchiseAPI.getAllFranchises();
  }

  static async getFranchisePackages(franchiseId: string) {
    return FranchiseAPI.getFranchisePackages(franchiseId);
  }

  static async createApplication(applicationData: any) {
    return FranchiseAPI.createApplication(applicationData);
  }
}
```

## 📋 **Phase 3: Component Data Migration**

### **✅ Step 3.1: Dashboard Components**

**1. src/hooks/useAnalyticsData.ts**
```typescript
// REPLACE mock implementation with:
import { useQuery } from '@tanstack/react-query';
import { AnalyticsAPI } from '@/api/analytics';

export const useAnalyticsData = (userRole: string, locationId?: string) => {
  return useQuery({
    queryKey: ['analytics', userRole, locationId],
    queryFn: async () => {
      if (userRole === 'franchisee' && locationId) {
        return AnalyticsAPI.getLocationMetrics(locationId);
      } else if (userRole === 'franchisor') {
        return AnalyticsAPI.getFranchiseMetrics();
      }
      throw new Error('Invalid role or missing location');
    },
    enabled: !!userRole && (userRole !== 'franchisee' || !!locationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
};
```

**2. src/components/dashboard/tabs/InventoryTab.tsx**
```typescript
// BEFORE: Static mock data
const inventoryItems = [
  { name: 'Siomai (Pork)', stock: 150, unit: 'pcs', status: 'Good' },
  // ... more mock items
];

// AFTER: Real data with real-time updates
import { useRealtimeInventory } from '@/hooks/useRealtimeData';
import { useAuth } from '@/hooks/useAuth';

export const InventoryTab: React.FC = () => {
  const { user } = useAuth();
  const { data: inventory, isLoading } = useRealtimeInventory(user?.location_id);

  if (isLoading) return <InventoryTabSkeleton />;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventory?.map((item) => (
              <InventoryItem
                key={item.product_id}
                item={item}
                onReorder={(productId, quantity) => 
                  handleCreateOrder(productId, quantity)
                }
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

### **✅ Step 3.2: Analytics Components**

**1. src/components/analytics/FranchiseeAnalytics.tsx**
```typescript
// BEFORE:
import { useFranchiseeAnalytics } from '@/hooks/useAnalytics';

// AFTER:
import { useQuery } from '@tanstack/react-query';
import { AnalyticsAPI } from '@/api/analytics';
import { useAuth } from '@/hooks/useAuth';

const FranchiseeAnalytics: React.FC = () => {
  const { user } = useAuth();
  
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['franchisee-analytics', user?.location_id],
    queryFn: () => AnalyticsAPI.getFranchiseeAnalytics(user?.location_id!),
    enabled: !!user?.location_id,
  });

  const { data: kpiData } = useQuery({
    queryKey: ['kpi-data', user?.location_id],
    queryFn: () => AnalyticsAPI.getKPIData(user?.location_id!),
    enabled: !!user?.location_id,
  });

  if (isLoading) return <AnalyticsSkeleton />;

  return (
    <div className="space-y-6">
      <KPISummary data={kpiData} />
      <PerformanceCharts data={analytics} />
      <InsightCards insights={analytics?.insights} />
    </div>
  );
};
```

## 📋 **Phase 4: Form and Application Migration**

### **✅ Step 4.1: Application Form**

**1. src/pages/Apply.tsx**
```typescript
// BEFORE: Mock form submission
const handleSubmit = () => {
  console.log('Form submitted:', formData);
  setIsSubmitted(true);
};

// AFTER: Real API integration
import { useMutation } from '@tanstack/react-query';
import { FranchiseAPI } from '@/api/franchises';

const Apply: React.FC = () => {
  const submitApplicationMutation = useMutation({
    mutationFn: FranchiseAPI.createApplication,
    onSuccess: () => {
      setIsSubmitted(true);
      toast({ title: 'Application submitted successfully!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error submitting application', 
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const handleSubmit = () => {
    submitApplicationMutation.mutate({
      franchise_id: formData.selectedFranchise,
      package_id: formData.selectedPackage,
      application_data: {
        personal_info: formData.personalInfo,
        business_experience: formData.businessExperience,
        financial_info: formData.financialInfo,
      },
    });
  };

  // Add loading state to submit button
  const isSubmitting = submitApplicationMutation.isPending;
};
```

## 📋 **Phase 5: Real-time Features**

### **✅ Step 5.1: Add Real-time Subscriptions**

**1. CREATE: src/hooks/useRealtimeData.ts**
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useRealtimeInventory = (locationId: string) => {
  const queryClient = useQueryClient();
  
  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory', locationId],
    queryFn: () => InventoryAPI.getInventoryByLocation(locationId),
    enabled: !!locationId,
  });

  useEffect(() => {
    if (!locationId) return;

    const subscription = supabase
      .channel(`inventory:${locationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inventory_levels',
        filter: `warehouse_id=eq.${locationId}`
      }, () => {
        // Invalidate and refetch inventory data
        queryClient.invalidateQueries({ queryKey: ['inventory', locationId] });
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [locationId, queryClient]);

  return { data: inventory, isLoading };
};
```

## 📋 **Verification Checklist**

### **✅ Authentication Migration**
- [ ] All mock auth imports removed
- [ ] Supabase auth integrated in all components
- [ ] User roles properly mapped
- [ ] Protected routes working with real auth

### **✅ Database Integration**
- [ ] Enhanced schema deployed
- [ ] All 25 tables accessible via API
- [ ] RLS policies working correctly
- [ ] TypeScript types generated

### **✅ API Layer**
- [ ] Core APIs implemented (Franchise, Order, Inventory, Analytics)
- [ ] Error handling consistent across all endpoints
- [ ] Business logic properly encapsulated
- [ ] Real-time subscriptions working

### **✅ Frontend Integration**
- [ ] All components using real data
- [ ] Loading states implemented
- [ ] Error handling in place
- [ ] Real-time updates working

### **✅ Business Workflows**
- [ ] Franchise application process end-to-end
- [ ] Order creation and approval workflow
- [ ] Inventory management with real-time updates
- [ ] Analytics dashboard with live data

This checklist ensures systematic migration from mock implementations to real database integration, maintaining functionality while adding robust business logic and real-time capabilities.
