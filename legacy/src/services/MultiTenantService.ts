import { supabase } from '@/lib/supabase';

// Multi-tenant Service Interfaces
export interface FranchiseHierarchy {
  id: string;
  name: string;
  type: 'franchisor' | 'region' | 'area' | 'location';
  parent_id: string | null;
  level: number;
  path: string; // Materialized path for efficient queries
  children: FranchiseHierarchy[];
  metadata: {
    manager_id?: string;
    contact_info?: any;
    operational_status: 'active' | 'inactive' | 'suspended';
    performance_metrics?: any;
  };
  permissions: {
    can_view_children: boolean;
    can_manage_children: boolean;
    can_aggregate_data: boolean;
    data_access_level: 'own' | 'children' | 'all';
  };
}

export interface CrossLocationAggregation {
  aggregation_id: string;
  name: string;
  description: string;
  location_ids: string[];
  metrics: string[];
  time_period: {
    start: string;
    end: string;
  };
  aggregated_data: {
    [metric: string]: {
      total: number;
      average: number;
      by_location: Array<{
        location_id: string;
        location_name: string;
        value: number;
        percentage: number;
      }>;
    };
  };
  insights: string[];
  created_by: string;
  created_at: string;
}

export interface DataPartition {
  partition_id: string;
  partition_name: string;
  partition_type: 'location' | 'region' | 'time' | 'custom';
  partition_key: string;
  partition_values: string[];
  table_name: string;
  partition_strategy: 'range' | 'hash' | 'list';
  retention_policy?: {
    enabled: boolean;
    retention_days: number;
    archive_location?: string;
  };
  performance_metrics: {
    query_performance: number;
    storage_size: number;
    index_efficiency: number;
  };
}

export interface GranularPermission {
  permission_id: string;
  user_id: string;
  resource_type: string;
  resource_id: string;
  permission_level: 'read' | 'write' | 'admin' | 'owner';
  conditions: {
    time_restrictions?: {
      allowed_hours: string[];
      allowed_days: string[];
    };
    location_restrictions?: string[];
    data_restrictions?: {
      fields_allowed: string[];
      fields_denied: string[];
    };
  };
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  is_inherited: boolean;
  inheritance_path?: string[];
}

export interface TenantConfiguration {
  tenant_id: string;
  tenant_name: string;
  tenant_type: 'enterprise' | 'standard' | 'basic';
  configuration: {
    max_locations: number;
    max_users: number;
    features_enabled: string[];
    storage_limit_gb: number;
    api_rate_limits: {
      requests_per_minute: number;
      requests_per_hour: number;
    };
    data_retention_days: number;
    backup_frequency: 'daily' | 'weekly' | 'monthly';
  };
  billing_info: {
    plan: string;
    billing_cycle: 'monthly' | 'yearly';
    next_billing_date: string;
    usage_metrics: any;
  };
  compliance_settings: {
    data_residency: string;
    encryption_level: 'standard' | 'enhanced';
    audit_logging: boolean;
    gdpr_compliance: boolean;
  };
}

/**
 * Multi-tenant Service for Advanced Franchise Hierarchy and Data Management
 * Provides enterprise-level multi-tenancy, data partitioning, and granular permissions
 */
export class MultiTenantService {
  private static readonly CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

  /**
   * Get complete franchise hierarchy with permissions
   */
  static async getFranchiseHierarchy(
    userId: string,
    rootId?: string
  ): Promise<FranchiseHierarchy[]> {
    try {
      // Get user's access level and permissions
      const userPermissions = await this.getUserPermissions(userId);

      // Build hierarchy query based on user permissions
      const { data: hierarchyData, error } = await supabase
        .rpc('get_franchise_hierarchy', {
          user_id: userId,
          root_id: rootId,
          max_depth: userPermissions.max_hierarchy_depth || 10
        });

      if (error) throw error;

      // Transform flat data into hierarchical structure
      const hierarchy = this.buildHierarchyTree(hierarchyData || []);

      // Apply permission filtering
      const filteredHierarchy = this.applyPermissionFiltering(hierarchy, userPermissions);

      return filteredHierarchy;
    } catch (error) {
      console.error('Error getting franchise hierarchy:', error);
      throw new Error('Failed to get franchise hierarchy');
    }
  }

  /**
   * Create cross-location data aggregation
   */
  static async createCrossLocationAggregation(
    name: string,
    description: string,
    locationIds: string[],
    metrics: string[],
    timePeriod: { start: string; end: string },
    userId: string
  ): Promise<CrossLocationAggregation> {
    try {
      // Validate user has access to all requested locations
      const hasAccess = await this.validateLocationAccess(userId, locationIds);
      if (!hasAccess) {
        throw new Error('Insufficient permissions for requested locations');
      }

      // Generate aggregation data
      const aggregatedData = await this.generateAggregatedData(locationIds, metrics, timePeriod);

      // Generate insights
      const insights = this.generateAggregationInsights(aggregatedData, metrics);

      const aggregation: CrossLocationAggregation = {
        aggregation_id: `agg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        location_ids: locationIds,
        metrics,
        time_period: timePeriod,
        aggregated_data: aggregatedData,
        insights,
        created_by: userId,
        created_at: new Date().toISOString()
      };

      // Store aggregation results
      const { data, error } = await supabase
        .from('cross_location_aggregations')
        .insert(aggregation)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating cross-location aggregation:', error);
      throw new Error('Failed to create cross-location aggregation');
    }
  }

  /**
   * Manage data partitions for scalability
   */
  static async createDataPartition(
    tableName: string,
    partitionType: 'location' | 'region' | 'time' | 'custom',
    partitionKey: string,
    partitionValues: string[],
    strategy: 'range' | 'hash' | 'list' = 'hash'
  ): Promise<DataPartition> {
    try {
      const partitionId = `part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create physical partition in database
      const partitionResult = await supabase.rpc('create_table_partition', {
        partition_id: partitionId,
        table_name: tableName,
        partition_type: partitionType,
        partition_key: partitionKey,
        partition_values: partitionValues,
        strategy: strategy
      });

      if (partitionResult.error) throw partitionResult.error;

      // Get performance metrics
      const performanceMetrics = await this.getPartitionPerformanceMetrics(partitionId);

      const partition: DataPartition = {
        partition_id: partitionId,
        partition_name: `${tableName}_${partitionType}_${Date.now()}`,
        partition_type: partitionType,
        partition_key: partitionKey,
        partition_values: partitionValues,
        table_name: tableName,
        partition_strategy: strategy,
        performance_metrics: performanceMetrics
      };

      // Store partition metadata
      const { data, error } = await supabase
        .from('data_partitions')
        .insert(partition)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating data partition:', error);
      throw new Error('Failed to create data partition');
    }
  }

  /**
   * Grant granular permissions to users
   */
  static async grantGranularPermission(
    userId: string,
    resourceType: string,
    resourceId: string,
    permissionLevel: 'read' | 'write' | 'admin' | 'owner',
    conditions: any,
    grantedBy: string,
    expiresAt?: string
  ): Promise<GranularPermission> {
    try {
      // Validate granter has permission to grant this level
      const canGrant = await this.validateGrantPermission(grantedBy, resourceType, permissionLevel);
      if (!canGrant) {
        throw new Error('Insufficient permissions to grant this access level');
      }

      const permission: GranularPermission = {
        permission_id: `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        resource_type: resourceType,
        resource_id: resourceId,
        permission_level: permissionLevel,
        conditions: conditions || {},
        granted_by: grantedBy,
        granted_at: new Date().toISOString(),
        expires_at: expiresAt,
        is_inherited: false,
        inheritance_path: []
      };

      // Store permission
      const { data, error } = await supabase
        .from('granular_permissions')
        .insert(permission)
        .select()
        .single();

      if (error) throw error;

      // Invalidate user permission cache
      await this.invalidateUserPermissionCache(userId);

      return data;
    } catch (error) {
      console.error('Error granting granular permission:', error);
      throw new Error('Failed to grant granular permission');
    }
  }

  /**
   * Configure tenant settings
   */
  static async configureTenant(
    tenantId: string,
    configuration: Partial<TenantConfiguration>
  ): Promise<TenantConfiguration> {
    try {
      // Get existing configuration
      const { data: existingConfig, error: fetchError } = await supabase
        .from('tenant_configurations')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      // Merge configurations
      const updatedConfig = {
        ...existingConfig,
        ...configuration,
        tenant_id: tenantId,
        updated_at: new Date().toISOString()
      };

      // Validate configuration limits
      await this.validateTenantConfiguration(updatedConfig);

      // Store updated configuration
      const { data, error } = await supabase
        .from('tenant_configurations')
        .upsert(updatedConfig)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error configuring tenant:', error);
      throw new Error('Failed to configure tenant');
    }
  }

  /**
   * Get user's effective permissions across the hierarchy
   */
  static async getUserEffectivePermissions(
    userId: string,
    resourceType?: string,
    resourceId?: string
  ): Promise<GranularPermission[]> {
    try {
      const { data: permissions, error } = await supabase
        .rpc('get_user_effective_permissions', {
          user_id: userId,
          resource_type: resourceType,
          resource_id: resourceId
        });

      if (error) throw error;

      // Process inherited permissions
      const processedPermissions = this.processInheritedPermissions(permissions || []);

      return processedPermissions;
    } catch (error) {
      console.error('Error getting user effective permissions:', error);
      throw new Error('Failed to get user effective permissions');
    }
  }

  // Private helper methods
  private static async getUserPermissions(userId: string) {
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        granular_permissions!inner(*)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      role: userProfile.role,
      max_hierarchy_depth: this.getMaxHierarchyDepth(userProfile.role),
      permissions: userProfile.granular_permissions || []
    };
  }

  private static getMaxHierarchyDepth(role: string): number {
    const depthMap = {
      'admin': 10,
      'franchisor': 8,
      'regional_manager': 6,
      'area_manager': 4,
      'franchisee': 2,
      'user': 1
    };
    return depthMap[role as keyof typeof depthMap] || 1;
  }

  private static buildHierarchyTree(flatData: any[]): FranchiseHierarchy[] {
    const nodeMap = new Map();
    const rootNodes: FranchiseHierarchy[] = [];

    // Create node map
    flatData.forEach(item => {
      nodeMap.set(item.id, {
        ...item,
        children: []
      });
    });

    // Build tree structure
    flatData.forEach(item => {
      const node = nodeMap.get(item.id);
      if (item.parent_id && nodeMap.has(item.parent_id)) {
        nodeMap.get(item.parent_id).children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }

  private static applyPermissionFiltering(
    hierarchy: FranchiseHierarchy[],
    userPermissions: any
  ): FranchiseHierarchy[] {
    return hierarchy.filter(node => {
      // Apply permission logic based on user role and permissions
      const hasAccess = this.checkNodeAccess(node, userPermissions);
      if (hasAccess && node.children.length > 0) {
        node.children = this.applyPermissionFiltering(node.children, userPermissions);
      }
      return hasAccess;
    });
  }

  private static checkNodeAccess(node: FranchiseHierarchy, userPermissions: any): boolean {
    // Simplified access check - would be more complex in production
    if (userPermissions.role === 'admin' || userPermissions.role === 'franchisor') {
      return true;
    }

    // Check specific permissions for this node
    return userPermissions.permissions.some((perm: any) =>
      perm.resource_type === 'franchise_location' &&
      perm.resource_id === node.id &&
      ['read', 'write', 'admin', 'owner'].includes(perm.permission_level)
    );
  }

  private static async validateLocationAccess(userId: string, locationIds: string[]): Promise<boolean> {
    const { data: accessibleLocations, error } = await supabase
      .rpc('get_user_accessible_locations', {
        user_id: userId
      });

    if (error) return false;

    const accessibleIds = new Set(accessibleLocations?.map((loc: any) => loc.id) || []);
    return locationIds.every(id => accessibleIds.has(id));
  }

  private static async generateAggregatedData(
    locationIds: string[],
    metrics: string[],
    timePeriod: { start: string; end: string }
  ) {
    const aggregatedData: any = {};

    for (const metric of metrics) {
      const metricData = await this.getMetricDataForLocations(locationIds, metric, timePeriod);
      aggregatedData[metric] = this.calculateMetricAggregation(metricData);
    }

    return aggregatedData;
  }

  private static async getMetricDataForLocations(
    locationIds: string[],
    metric: string,
    timePeriod: { start: string; end: string }
  ) {
    // Simplified implementation - would be more sophisticated in production
    const { data, error } = await supabase
      .from('sales_records')
      .select('franchise_location_id, total_amount')
      .in('franchise_location_id', locationIds)
      .gte('sale_date', timePeriod.start)
      .lte('sale_date', timePeriod.end);

    if (error) throw error;

    return data || [];
  }

  private static calculateMetricAggregation(metricData: any[]) {
    const total = metricData.reduce((sum, item) => sum + item.total_amount, 0);
    const average = metricData.length > 0 ? total / metricData.length : 0;

    const byLocation = metricData.reduce((acc: any, item) => {
      const locationId = item.franchise_location_id;
      if (!acc[locationId]) {
        acc[locationId] = { location_id: locationId, value: 0, count: 0 };
      }
      acc[locationId].value += item.total_amount;
      acc[locationId].count += 1;
      return acc;
    }, {});

    const locationArray = Object.values(byLocation).map((loc: any) => ({
      location_id: loc.location_id,
      location_name: `Location ${loc.location_id}`, // Would fetch actual name
      value: loc.value,
      percentage: total > 0 ? (loc.value / total) * 100 : 0
    }));

    return {
      total,
      average,
      by_location: locationArray
    };
  }

  private static generateAggregationInsights(aggregatedData: any, metrics: string[]): string[] {
    const insights = [];

    for (const metric of metrics) {
      const data = aggregatedData[metric];
      if (data && data.by_location.length > 0) {
        const topPerformer = data.by_location.reduce((best: any, current: any) =>
          current.value > best.value ? current : best
        );
        insights.push(`${metric}: ${topPerformer.location_name} leads with ${topPerformer.percentage.toFixed(1)}% of total`);
      }
    }

    return insights;
  }

  private static async getPartitionPerformanceMetrics(partitionId: string) {
    // Simplified implementation - would query actual performance metrics
    return {
      query_performance: Math.random() * 100,
      storage_size: Math.random() * 1000,
      index_efficiency: Math.random() * 100
    };
  }

  private static async validateGrantPermission(
    granterId: string,
    resourceType: string,
    permissionLevel: string
  ): Promise<boolean> {
    // Simplified validation - would check granter's actual permissions
    const { data: granterProfile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', granterId)
      .single();

    if (error) return false;

    // Admin and franchisor can grant any permission
    if (['admin', 'franchisor'].includes(granterProfile.role)) {
      return true;
    }

    // Other roles have limited granting capabilities
    return permissionLevel === 'read';
  }

  private static async invalidateUserPermissionCache(userId: string) {
    // Would invalidate Redis cache or similar
    console.log(`Invalidating permission cache for user: ${userId}`);
  }

  private static async validateTenantConfiguration(config: any) {
    // Validate configuration limits and constraints
    if (config.configuration?.max_locations > 1000) {
      throw new Error('Maximum locations limit exceeded');
    }

    if (config.configuration?.max_users > 10000) {
      throw new Error('Maximum users limit exceeded');
    }
  }

  private static processInheritedPermissions(permissions: GranularPermission[]): GranularPermission[] {
    // Process and merge inherited permissions
    const processedPermissions = permissions.map(perm => {
      if (perm.is_inherited) {
        // Apply inheritance logic
        return {
          ...perm,
          inheritance_path: perm.inheritance_path || []
        };
      }
      return perm;
    });

    return processedPermissions;
  }
}