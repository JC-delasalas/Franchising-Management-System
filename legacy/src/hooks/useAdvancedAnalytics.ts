import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import {
  AdvancedAnalyticsService,
  BusinessIntelligenceData,
  KPIDashboard,
  ComparativeAnalytics,
  InteractiveChart,
  MultiDimensionalData
} from '@/services/AdvancedAnalyticsService';

/**
 * React Query hooks for Advanced Analytics features
 * Provides business intelligence, customizable dashboards, and comparative analysis
 */

export function useAdvancedAnalytics(franchiseLocationId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Business Intelligence Data
  const {
    data: businessIntelligence,
    isLoading: isLoadingBI,
    error: biError,
    refetch: refetchBI
  } = useQuery({
    queryKey: ['business-intelligence', franchiseLocationId],
    queryFn: () => {
      const timePeriod = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      };
      return AdvancedAnalyticsService.generateBusinessIntelligence(franchiseLocationId!, timePeriod);
    },
    enabled: !!franchiseLocationId,
    staleTime: 1000 * 60 * 15, // 15 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    onError: (error: any) => {
      toast({
        title: "Business Intelligence Error",
        description: error.message || "Failed to load business intelligence data",
        variant: "destructive",
      });
    }
  });

  // User's KPI Dashboards
  const {
    data: kpiDashboards,
    isLoading: isLoadingDashboards,
    error: dashboardsError,
    refetch: refetchDashboards
  } = useQuery({
    queryKey: ['kpi-dashboards', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kpi_dashboards')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 20, // 20 minutes
    onError: (error: any) => {
      toast({
        title: "Dashboard Loading Error",
        description: error.message || "Failed to load KPI dashboards",
        variant: "destructive",
      });
    }
  });

  // Interactive Charts
  const {
    data: interactiveCharts,
    isLoading: isLoadingCharts,
    error: chartsError,
    refetch: refetchCharts
  } = useQuery({
    queryKey: ['interactive-charts', franchiseLocationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interactive_charts')
        .select('*')
        .eq('franchise_location_id', franchiseLocationId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!franchiseLocationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 15, // 15 minutes
    onError: (error: any) => {
      toast({
        title: "Charts Loading Error",
        description: error.message || "Failed to load interactive charts",
        variant: "destructive",
      });
    }
  });

  // Generate Business Intelligence Mutation
  const generateBIMutation = useMutation({
    mutationFn: ({ locationId, timePeriod }: {
      locationId: string;
      timePeriod: { start: string; end: string };
    }) => AdvancedAnalyticsService.generateBusinessIntelligence(locationId, timePeriod),
    onSuccess: (data) => {
      queryClient.setQueryData(['business-intelligence', franchiseLocationId], data);
      toast({
        title: "Business Intelligence Generated",
        description: "Successfully generated comprehensive business intelligence report",
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "BI Generation Failed",
        description: error.message || "Failed to generate business intelligence",
        variant: "destructive",
      });
    }
  });

  // Create KPI Dashboard Mutation
  const createDashboardMutation = useMutation({
    mutationFn: (dashboardConfig: Omit<KPIDashboard, 'user_id' | 'last_updated'>) =>
      AdvancedAnalyticsService.createKPIDashboard(user!.id, dashboardConfig),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['kpi-dashboards', user?.id]);
      toast({
        title: "Dashboard Created",
        description: `Successfully created dashboard: ${data.dashboard_name}`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Dashboard Creation Failed",
        description: error.message || "Failed to create KPI dashboard",
        variant: "destructive",
      });
    }
  });

  // Generate Comparative Analytics Mutation
  const generateComparativeAnalyticsMutation = useMutation({
    mutationFn: ({ comparisonType, baseEntity, comparisonEntities, metrics }: {
      comparisonType: 'location' | 'time_period' | 'category';
      baseEntity: string;
      comparisonEntities: string[];
      metrics: string[];
    }) => AdvancedAnalyticsService.generateComparativeAnalytics(
      comparisonType, baseEntity, comparisonEntities, metrics
    ),
    onSuccess: (data) => {
      toast({
        title: "Comparative Analysis Complete",
        description: `Generated comparison across ${data.comparison_entities.length} entities`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Comparative Analysis Failed",
        description: error.message || "Failed to generate comparative analytics",
        variant: "destructive",
      });
    }
  });

  // Create Interactive Chart Mutation
  const createChartMutation = useMutation({
    mutationFn: (chartConfig: Omit<InteractiveChart, 'chart_id' | 'last_updated'>) =>
      AdvancedAnalyticsService.createInteractiveChart(chartConfig),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['interactive-charts', franchiseLocationId]);
      toast({
        title: "Chart Created",
        description: `Successfully created ${data.chart_type} chart: ${data.title}`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chart Creation Failed",
        description: error.message || "Failed to create interactive chart",
        variant: "destructive",
      });
    }
  });

  // Generate Multi-dimensional Analysis Mutation
  const generateMultiDimensionalMutation = useMutation({
    mutationFn: ({ locationId, dimensions, measures, filters }: {
      locationId: string;
      dimensions: string[];
      measures: string[];
      filters?: any;
    }) => AdvancedAnalyticsService.generateMultiDimensionalAnalysis(
      locationId, dimensions, measures, filters
    ),
    onSuccess: (data) => {
      toast({
        title: "Multi-dimensional Analysis Complete",
        description: `Analyzed ${data.dimensions.length} dimensions with ${data.measures.length} measures`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Multi-dimensional Analysis Failed",
        description: error.message || "Failed to generate multi-dimensional analysis",
        variant: "destructive",
      });
    }
  });

  return {
    // Data
    businessIntelligence,
    kpiDashboards,
    interactiveCharts,

    // Loading states
    isLoadingBI,
    isLoadingDashboards,
    isLoadingCharts,

    // Errors
    biError,
    dashboardsError,
    chartsError,

    // Refetch functions
    refetchBI,
    refetchDashboards,
    refetchCharts,

    // Mutations
    generateBI: generateBIMutation.mutate,
    createDashboard: createDashboardMutation.mutate,
    generateComparativeAnalytics: generateComparativeAnalyticsMutation.mutate,
    createChart: createChartMutation.mutate,
    generateMultiDimensional: generateMultiDimensionalMutation.mutate,

    // Mutation states
    isGeneratingBI: generateBIMutation.isLoading,
    isCreatingDashboard: createDashboardMutation.isLoading,
    isGeneratingComparative: generateComparativeAnalyticsMutation.isLoading,
    isCreatingChart: createChartMutation.isLoading,
    isGeneratingMultiDimensional: generateMultiDimensionalMutation.isLoading,

    // Utility functions
    refreshAllAnalytics: () => {
      refetchBI();
      refetchDashboards();
      refetchCharts();
    }
  };
}