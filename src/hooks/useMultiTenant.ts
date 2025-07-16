import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import {
  MultiTenantService,
  FranchiseHierarchy,
  CrossLocationAggregation,
  DataPartition,
  GranularPermission,
  TenantConfiguration
} from '@/services/MultiTenantService';

/**
 * React Query hooks for Multi-tenant features
 * Provides franchise hierarchy, cross-location aggregation, and granular permissions
 */

export function useMultiTenant() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Franchise Hierarchy
  const {
    data: franchiseHierarchy,
    isLoading: isLoadingHierarchy,
    error: hierarchyError,
    refetch: refetchHierarchy
  } = useQuery({
    queryKey: ['franchise-hierarchy', user?.id],
    queryFn: () => MultiTenantService.getFranchiseHierarchy(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 20, // 20 minutes
    retry: 2,
    onError: (error: any) => {
      toast({
        title: "Hierarchy Loading Error",
        description: error.message || "Failed to load franchise hierarchy",
        variant: "destructive",
      });
    }
  });

  // User's Cross-location Aggregations
  const {
    data: crossLocationAggregations,
    isLoading: isLoadingAggregations,
    error: aggregationsError,
    refetch: refetchAggregations
  } = useQuery({
    queryKey: ['cross-location-aggregations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cross_location_aggregations')
        .select('*')
        .eq('created_by', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 15, // 15 minutes
    onError: (error: any) => {
      toast({
        title: "Aggregations Loading Error",
        description: error.message || "Failed to load cross-location aggregations",
        variant: "destructive",
      });
    }
  });

  // User's Effective Permissions
  const {
    data: userPermissions,
    isLoading: isLoadingPermissions,
    error: permissionsError,
    refetch: refetchPermissions
  } = useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: () => MultiTenantService.getUserEffectivePermissions(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (error: any) => {
      toast({
        title: "Permissions Loading Error",
        description: error.message || "Failed to load user permissions",
        variant: "destructive",
      });
    }
  });

  // Data Partitions (admin only)
  const {
    data: dataPartitions,
    isLoading: isLoadingPartitions,
    error: partitionsError,
    refetch: refetchPartitions
  } = useQuery({
    queryKey: ['data-partitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_partitions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && ['admin', 'franchisor'].includes(user?.role || ''),
    staleTime: 1000 * 60 * 15, // 15 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    onError: (error: any) => {
      toast({
        title: "Partitions Loading Error",
        description: error.message || "Failed to load data partitions",
        variant: "destructive",
      });
    }
  });

  // Create Cross-location Aggregation Mutation
  const createAggregationMutation = useMutation({
    mutationFn: ({ name, description, locationIds, metrics, timePeriod }: {
      name: string;
      description: string;
      locationIds: string[];
      metrics: string[];
      timePeriod: { start: string; end: string };
    }) => MultiTenantService.createCrossLocationAggregation(
      name, description, locationIds, metrics, timePeriod, user!.id
    ),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['cross-location-aggregations', user?.id]);
      toast({
        title: "Aggregation Created",
        description: `Successfully created aggregation: ${data.name}`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Aggregation Creation Failed",
        description: error.message || "Failed to create cross-location aggregation",
        variant: "destructive",
      });
    }
  });

  // Create Data Partition Mutation
  const createPartitionMutation = useMutation({
    mutationFn: ({ tableName, partitionType, partitionKey, partitionValues, strategy }: {
      tableName: string;
      partitionType: 'location' | 'region' | 'time' | 'custom';
      partitionKey: string;
      partitionValues: string[];
      strategy?: 'range' | 'hash' | 'list';
    }) => MultiTenantService.createDataPartition(
      tableName, partitionType, partitionKey, partitionValues, strategy
    ),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['data-partitions']);
      toast({
        title: "Partition Created",
        description: `Successfully created partition: ${data.partition_name}`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Partition Creation Failed",
        description: error.message || "Failed to create data partition",
        variant: "destructive",
      });
    }
  });

  // Grant Permission Mutation
  const grantPermissionMutation = useMutation({
    mutationFn: ({ userId, resourceType, resourceId, permissionLevel, conditions, expiresAt }: {
      userId: string;
      resourceType: string;
      resourceId: string;
      permissionLevel: 'read' | 'write' | 'admin' | 'owner';
      conditions: any;
      expiresAt?: string;
    }) => MultiTenantService.grantGranularPermission(
      userId, resourceType, resourceId, permissionLevel, conditions, user!.id, expiresAt
    ),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['user-permissions']);
      toast({
        title: "Permission Granted",
        description: `Successfully granted ${data.permission_level} permission`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Permission Grant Failed",
        description: error.message || "Failed to grant permission",
        variant: "destructive",
      });
    }
  });

  // Configure Tenant Mutation
  const configureTenantMutation = useMutation({
    mutationFn: ({ tenantId, configuration }: {
      tenantId: string;
      configuration: Partial<TenantConfiguration>;
    }) => MultiTenantService.configureTenant(tenantId, configuration),
    onSuccess: (data) => {
      toast({
        title: "Tenant Configured",
        description: `Successfully configured tenant: ${data.tenant_name}`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Tenant Configuration Failed",
        description: error.message || "Failed to configure tenant",
        variant: "destructive",
      });
    }
  });

  return {
    // Data
    franchiseHierarchy,
    crossLocationAggregations,
    userPermissions,
    dataPartitions,

    // Loading states
    isLoadingHierarchy,
    isLoadingAggregations,
    isLoadingPermissions,
    isLoadingPartitions,

    // Errors
    hierarchyError,
    aggregationsError,
    permissionsError,
    partitionsError,

    // Refetch functions
    refetchHierarchy,
    refetchAggregations,
    refetchPermissions,
    refetchPartitions,

    // Mutations
    createAggregation: createAggregationMutation.mutate,
    createPartition: createPartitionMutation.mutate,
    grantPermission: grantPermissionMutation.mutate,
    configureTenant: configureTenantMutation.mutate,

    // Mutation states
    isCreatingAggregation: createAggregationMutation.isLoading,
    isCreatingPartition: createPartitionMutation.isLoading,
    isGrantingPermission: grantPermissionMutation.isLoading,
    isConfiguringTenant: configureTenantMutation.isLoading,

    // Utility functions
    refreshAllMultiTenant: () => {
      refetchHierarchy();
      refetchAggregations();
      refetchPermissions();
      refetchPartitions();
    },

    // Helper functions
    hasPermission: (resourceType: string, resourceId: string, level: string) => {
      return userPermissions?.some(perm =>
        perm.resource_type === resourceType &&
        perm.resource_id === resourceId &&
        ['read', 'write', 'admin', 'owner'].indexOf(perm.permission_level) >=
        ['read', 'write', 'admin', 'owner'].indexOf(level)
      ) || false;
    },

    getAccessibleLocations: () => {
      if (!franchiseHierarchy) return [];

      const accessibleLocations: string[] = [];

      const traverseHierarchy = (nodes: FranchiseHierarchy[]) => {
        nodes.forEach(node => {
          if (node.type === 'location' && node.permissions.can_view_children) {
            accessibleLocations.push(node.id);
          }
          if (node.children.length > 0) {
            traverseHierarchy(node.children);
          }
        });
      };

      traverseHierarchy(franchiseHierarchy);
      return accessibleLocations;
    }
  };
}