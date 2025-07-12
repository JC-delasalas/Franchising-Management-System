import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  brandService,
  authService,
  inventoryService,
  analyticsService,
  auditService,
  financialService,
  franchiseeService,
  trainingService,
  crmService,
  productService
} from '@/services/database';

// Brand hooks
export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => brandService.getAllBrands(),
  });
};

export const useBrand = (brandId: string) => {
  return useQuery({
    queryKey: ['brand', brandId],
    queryFn: () => brandService.getBrandWithProducts(brandId),
    enabled: !!brandId,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: brandService.createBrand.bind(brandService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ brandId, updates }: { brandId: string; updates: any }) =>
      brandService.updateBrand(brandId, updates),
    onSuccess: (_, { brandId }) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brand', brandId] });
    },
  });
};

// Inventory hooks
export const useInventory = (locationId?: string) => {
  return useQuery({
    queryKey: ['inventory', locationId],
    queryFn: () => locationId 
      ? inventoryService.getInventoryByLocation(locationId)
      : inventoryService.getAll(),
  });
};

export const useLowStockItems = () => {
  return useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: () => inventoryService.getLowStockItems(),
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ inventoryId, quantity, type }: { 
      inventoryId: string; 
      quantity: number; 
      type: 'add' | 'subtract' | 'set' 
    }) => inventoryService.updateStock(inventoryId, quantity, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const usePurchaseOrders = (status?: string) => {
  return useQuery({
    queryKey: ['purchase-orders', status],
    queryFn: () => inventoryService.getPurchaseOrders(status),
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: inventoryService.createPurchaseOrder.bind(inventoryService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

// Analytics hooks
export const useKPIs = () => {
  return useQuery({
    queryKey: ['kpis'],
    queryFn: () => analyticsService.getKPIs(),
  });
};

export const useKPIData = (kpiId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['kpi-data', kpiId, startDate, endDate],
    queryFn: () => analyticsService.getKPIData(kpiId, startDate, endDate),
    enabled: !!kpiId,
  });
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => analyticsService.getDashboardSummary(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useRevenueTrends = (period: 'daily' | 'weekly' | 'monthly' = 'monthly', months: number = 12) => {
  return useQuery({
    queryKey: ['revenue-trends', period, months],
    queryFn: () => analyticsService.getRevenueTrends(period, months),
  });
};

export const useCreateKPI = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: analyticsService.createKPI.bind(analyticsService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });
};

export const useRecordKPIData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ kpiId, value, period, locationId }: {
      kpiId: string;
      value: number;
      period: string;
      locationId?: string;
    }) => analyticsService.recordKPIData(kpiId, value, period, locationId),
    onSuccess: (_, { kpiId }) => {
      queryClient.invalidateQueries({ queryKey: ['kpi-data', kpiId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
};

// Auth hooks
export const useUserRoles = (userId: string) => {
  return useQuery({
    queryKey: ['user-roles', userId],
    queryFn: () => authService.getUserWithRoles(userId),
    enabled: !!userId,
  });
};

export const useRoles = (franchisorId: string) => {
  return useQuery({
    queryKey: ['roles', franchisorId],
    queryFn: () => authService.getRoles(franchisorId),
    enabled: !!franchisorId,
  });
};

export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => authService.getPermissions(),
  });
};

export const useAssignRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      authService.assignRole(userId, roleId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-roles', userId] });
    },
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.createRole.bind(authService),
    onSuccess: (_, { franchisor_id }) => {
      queryClient.invalidateQueries({ queryKey: ['roles', franchisor_id] });
    },
  });
};

// Audit hooks
export const useAuditLogs = (filters: any = {}) => {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditService.getAuditLogs(filters),
  });
};

export const useAuditSummary = (days: number = 30) => {
  return useQuery({
    queryKey: ['audit-summary', days],
    queryFn: () => auditService.getAuditSummary(days),
  });
};

export const useRecordAuditTrail = (tableName: string, recordId: string) => {
  return useQuery({
    queryKey: ['audit-trail', tableName, recordId],
    queryFn: () => auditService.getRecordAuditTrail(tableName, recordId),
    enabled: !!tableName && !!recordId,
  });
};

export const useLogAuditEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: auditService.logEvent.bind(auditService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['audit-summary'] });
    },
  });
};

// Inventory Analytics
export const useInventoryAnalytics = () => {
  return useQuery({
    queryKey: ['inventory-analytics'],
    queryFn: () => inventoryService.getInventoryAnalytics(),
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

// Brand Analytics
export const useBrandAnalytics = (brandId: string) => {
  return useQuery({
    queryKey: ['brand-analytics', brandId],
    queryFn: () => brandService.getBrandAnalytics(brandId),
    enabled: !!brandId,
  });
};

// Product Management Hooks
export const useProducts = (brandId?: string) => {
  return useQuery({
    queryKey: ['products', brandId],
    queryFn: () => brandId ? productService.getProductsByBrand(brandId) : productService.getAll(),
    enabled: !!brandId,
  });
};

export const useProductCategories = (brandId: string) => {
  return useQuery({
    queryKey: ['product-categories', brandId],
    queryFn: () => productService.getCategoriesByBrand(brandId),
    enabled: !!brandId,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productService.createProduct.bind(productService),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.brand_id] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, updates }: { productId: string; updates: any }) =>
      productService.updateProduct(productId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useProductAnalytics = (brandId?: string) => {
  return useQuery({
    queryKey: ['product-analytics', brandId],
    queryFn: () => productService.getProductAnalytics(brandId),
  });
};

// Financial Management Hooks
export const useFinancialDashboard = () => {
  return useQuery({
    queryKey: ['financial-dashboard'],
    queryFn: () => financialService.getFinancialDashboard(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const usePlans = (brandId?: string) => {
  return useQuery({
    queryKey: ['plans', brandId],
    queryFn: () => brandId ? financialService.getPlansByBrand(brandId) : financialService.getAll(),
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: financialService.createPlan.bind(financialService),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans', variables.brand_id] });
    },
  });
};

export const useOverdueInvoices = () => {
  return useQuery({
    queryKey: ['overdue-invoices'],
    queryFn: () => financialService.getOverdueInvoices(),
  });
};

// Franchisee Management Hooks
export const useFranchiseePipeline = () => {
  return useQuery({
    queryKey: ['franchisee-pipeline'],
    queryFn: () => franchiseeService.getFranchiseePipeline(),
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

export const useCreateFranchiseeApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: franchiseeService.createFranchiseeApplication.bind(franchiseeService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchisee-pipeline'] });
    },
  });
};

export const useUpdateOnboardingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ franchiseeId, status }: { franchiseeId: string; status: any }) =>
      franchiseeService.updateOnboardingStatus(franchiseeId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchisee-pipeline'] });
    },
  });
};

// Training Management Hooks
export const useTrainingModules = () => {
  return useQuery({
    queryKey: ['training-modules'],
    queryFn: () => trainingService.getAll(),
  });
};

export const useUserTrainingProgress = (userId: string) => {
  return useQuery({
    queryKey: ['user-training-progress', userId],
    queryFn: () => trainingService.getUserTrainingProgress(userId),
    enabled: !!userId,
  });
};

export const useTrainingAnalytics = () => {
  return useQuery({
    queryKey: ['training-analytics'],
    queryFn: () => trainingService.getTrainingAnalytics(),
  });
};

export const useCreateTrainingModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trainingService.createTrainingModule.bind(trainingService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-modules'] });
    },
  });
};

// CRM Hooks
export const useCustomerSegmentation = () => {
  return useQuery({
    queryKey: ['customer-segmentation'],
    queryFn: () => crmService.getCustomerSegmentation(),
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });
};

export const useCustomerPurchaseHistory = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-purchase-history', customerId],
    queryFn: () => crmService.getCustomerPurchaseHistory(customerId),
    enabled: !!customerId,
  });
};

export const useCustomerInsights = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-insights', customerId],
    queryFn: () => crmService.getCustomerInsights(customerId),
    enabled: !!customerId,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crmService.createCustomer.bind(crmService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-segmentation'] });
    },
  });
};
