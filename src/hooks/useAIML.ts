import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  AIMLService,
  SalesForecast,
  InventoryOptimization,
  AnomalyDetection,
  SmartApprovalRouting,
  PredictiveAnalytics
} from '@/services/AIMLService';

/**
 * React Query hooks for AI/ML features
 * Provides predictive analytics, optimization recommendations, and anomaly detection
 */

export function useAIML(franchiseLocationId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Sales Forecasting
  const {
    data: salesForecasts,
    isLoading: isLoadingSalesForecasts,
    error: salesForecastsError,
    refetch: refetchSalesForecasts
  } = useQuery({
    queryKey: ['sales-forecasts', franchiseLocationId],
    queryFn: () => AIMLService.generateSalesForecast(franchiseLocationId!, '1_month'),
    enabled: !!franchiseLocationId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
    onError: (error: any) => {
      toast({
        title: "Sales Forecast Error",
        description: error.message || "Failed to generate sales forecast",
        variant: "destructive",
      });
    }
  });

  // Inventory Optimization
  const {
    data: inventoryOptimizations,
    isLoading: isLoadingInventoryOptimizations,
    error: inventoryOptimizationsError,
    refetch: refetchInventoryOptimizations
  } = useQuery({
    queryKey: ['inventory-optimizations', franchiseLocationId],
    queryFn: () => AIMLService.generateInventoryOptimization(franchiseLocationId!),
    enabled: !!franchiseLocationId,
    staleTime: 1000 * 60 * 15, // 15 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    onError: (error: any) => {
      toast({
        title: "Inventory Optimization Error",
        description: error.message || "Failed to generate inventory optimization",
        variant: "destructive",
      });
    }
  });

  // Anomaly Detection
  const {
    data: anomalies,
    isLoading: isLoadingAnomalies,
    error: anomaliesError,
    refetch: refetchAnomalies
  } = useQuery({
    queryKey: ['anomalies', franchiseLocationId],
    queryFn: () => AIMLService.detectAnomalies(franchiseLocationId!, ['financial', 'sales', 'inventory']),
    enabled: !!franchiseLocationId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 20, // 20 minutes
    retry: 2,
    onError: (error: any) => {
      toast({
        title: "Anomaly Detection Error",
        description: error.message || "Failed to detect anomalies",
        variant: "destructive",
      });
    }
  });

  // Generate Sales Forecast Mutation
  const generateSalesForecastMutation = useMutation({
    mutationFn: ({ locationId, timeHorizon }: {
      locationId: string;
      timeHorizon: '1_week' | '1_month' | '3_months' | '6_months' | '1_year'
    }) => AIMLService.generateSalesForecast(locationId, timeHorizon),
    onSuccess: (data) => {
      queryClient.setQueryData(['sales-forecasts', franchiseLocationId], data);
      toast({
        title: "Sales Forecast Generated",
        description: `Generated forecast for ${data.length} periods`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Forecast Generation Failed",
        description: error.message || "Failed to generate sales forecast",
        variant: "destructive",
      });
    }
  });

  // Generate Inventory Optimization Mutation
  const generateInventoryOptimizationMutation = useMutation({
    mutationFn: (locationId: string) => AIMLService.generateInventoryOptimization(locationId),
    onSuccess: (data) => {
      queryClient.setQueryData(['inventory-optimizations', franchiseLocationId], data);
      toast({
        title: "Inventory Optimization Generated",
        description: `Generated optimization for ${data.length} products`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Optimization Generation Failed",
        description: error.message || "Failed to generate inventory optimization",
        variant: "destructive",
      });
    }
  });

  // Run Anomaly Detection Mutation
  const runAnomalyDetectionMutation = useMutation({
    mutationFn: ({ locationId, analysisTypes }: {
      locationId: string;
      analysisTypes: Array<'financial' | 'inventory' | 'sales' | 'operational'>
    }) => AIMLService.detectAnomalies(locationId, analysisTypes),
    onSuccess: (data) => {
      queryClient.setQueryData(['anomalies', franchiseLocationId], data);
      const criticalAnomalies = data.filter(a => a.severity === 'critical').length;
      toast({
        title: "Anomaly Detection Complete",
        description: `Found ${data.length} anomalies${criticalAnomalies > 0 ? `, ${criticalAnomalies} critical` : ''}`,
        variant: criticalAnomalies > 0 ? "destructive" : "default",
        duration: 8000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Anomaly Detection Failed",
        description: error.message || "Failed to detect anomalies",
        variant: "destructive",
      });
    }
  });

  // Generate Smart Approval Routing Mutation
  const generateSmartRoutingMutation = useMutation({
    mutationFn: (orderId: string) => AIMLService.generateSmartApprovalRouting(orderId),
    onSuccess: (data) => {
      toast({
        title: "Smart Routing Generated",
        description: `Recommended approver: ${data.recommended_approver} (${(data.approval_probability * 100).toFixed(0)}% probability)`,
        duration: 6000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Smart Routing Failed",
        description: error.message || "Failed to generate smart approval routing",
        variant: "destructive",
      });
    }
  });

  // Generate Predictive Analytics Mutation
  const generatePredictiveAnalyticsMutation = useMutation({
    mutationFn: ({ locationId, analysisType, timeHorizon }: {
      locationId: string;
      analysisType: 'sales' | 'inventory' | 'financial' | 'operational';
      timeHorizon: '1_week' | '1_month' | '3_months' | '6_months' | '1_year';
    }) => AIMLService.generatePredictiveAnalytics(locationId, analysisType, timeHorizon),
    onSuccess: (data) => {
      queryClient.setQueryData(['predictive-analytics', franchiseLocationId, data.analysis_type], data);
      toast({
        title: "Predictive Analytics Generated",
        description: `Generated ${data.analysis_type} analytics with ${data.predictions.length} predictions`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analytics Generation Failed",
        description: error.message || "Failed to generate predictive analytics",
        variant: "destructive",
      });
    }
  });

  return {
    // Data
    salesForecasts,
    inventoryOptimizations,
    anomalies,

    // Loading states
    isLoadingSalesForecasts,
    isLoadingInventoryOptimizations,
    isLoadingAnomalies,

    // Errors
    salesForecastsError,
    inventoryOptimizationsError,
    anomaliesError,

    // Refetch functions
    refetchSalesForecasts,
    refetchInventoryOptimizations,
    refetchAnomalies,

    // Mutations
    generateSalesForecast: generateSalesForecastMutation.mutate,
    generateInventoryOptimization: generateInventoryOptimizationMutation.mutate,
    runAnomalyDetection: runAnomalyDetectionMutation.mutate,
    generateSmartRouting: generateSmartRoutingMutation.mutate,
    generatePredictiveAnalytics: generatePredictiveAnalyticsMutation.mutate,

    // Mutation states
    isGeneratingSalesForecast: generateSalesForecastMutation.isLoading,
    isGeneratingInventoryOptimization: generateInventoryOptimizationMutation.isLoading,
    isRunningAnomalyDetection: runAnomalyDetectionMutation.isLoading,
    isGeneratingSmartRouting: generateSmartRoutingMutation.isLoading,
    isGeneratingPredictiveAnalytics: generatePredictiveAnalyticsMutation.isLoading,

    // Utility functions
    refreshAllAIML: () => {
      refetchSalesForecasts();
      refetchInventoryOptimizations();
      refetchAnomalies();
    }
  };
}