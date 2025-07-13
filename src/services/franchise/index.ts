/**
 * Franchise Management System Services
 * 
 * This module exports all the core services that support the 10 primary objectives
 * of the franchise management system:
 * 
 * 1. Centralized Brand & Product Management
 * 2. Scalable Multi-Tenant Architecture
 * 3. Secure, Role-Based Access Control
 * 4. Efficient Inventory & Supply Chain Monitoring
 * 5. Data-Driven Performance Analytics
 * 6. Automated Financial Management & Billing
 * 7. Comprehensive Franchisee Lifecycle Management
 * 8. Standardized Training & Development
 * 9. Streamlined Customer Relationship Management (CRM)
 * 10. Robust Auditing & System Integrity
 */

// Core Authentication & Identity Management
export { default as FranchiseAuthService } from './authService';
export type { SignupData, LoginData, AuthResponse } from './authService';

// Brand & Product Management (Objective 1)
export { default as BrandService } from './brandService';
export type { 
  BrandCreateData, 
  ProductCreateData, 
  CategoryCreateData 
} from './brandService';

// Role-Based Access Control (Objective 3)
export { default as RBACService } from './rbacService';
export type { 
  RoleCreateData, 
  PermissionCreateData, 
  UserRoleAssignment 
} from './rbacService';

// Analytics & Performance Tracking (Objective 5)
export { default as AnalyticsService } from './analyticsService';
export type { 
  KPICreateData, 
  KPIDataCreateData, 
  AnalyticsFilter, 
  DashboardMetrics 
} from './analyticsService';

// Audit Logging & System Integrity (Objective 10)
export { default as AuditService } from './auditService';
export type { 
  AuditLogData, 
  AuditFilter 
} from './auditService';

/**
 * Service initialization and setup utilities
 */
export class FranchiseSystemInitializer {
  
  /**
   * Initialize the franchise management system for a new franchisor
   * This sets up default roles, permissions, and system configuration
   */
  static async initializeFranchisor(franchisorId: string) {
    try {
      console.log('Initializing franchise system for franchisor:', franchisorId);

      // Step 1: Initialize default permissions
      const permissionsResult = await RBACService.initializeDefaultPermissions();
      if (!permissionsResult.success) {
        console.error('Failed to initialize permissions:', permissionsResult.error);
      }

      // Step 2: Create default roles for the franchisor
      const rolesResult = await RBACService.createDefaultRoles(franchisorId);
      if (!rolesResult.success) {
        console.error('Failed to create default roles:', rolesResult.error);
      }

      // Step 3: Log the initialization
      await AuditService.logSystemEvent('franchisor_initialization', {
        franchisor_id: franchisorId,
        permissions_created: permissionsResult.success,
        roles_created: rolesResult.success,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Franchise system initialized successfully',
        data: {
          permissions: permissionsResult.data,
          roles: rolesResult.data
        }
      };

    } catch (error) {
      console.error('Error initializing franchise system:', error);
      
      await AuditService.logSystemEvent('franchisor_initialization_failed', {
        franchisor_id: franchisorId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        message: 'Failed to initialize franchise system',
        error
      };
    }
  }

  /**
   * Validate system health and configuration
   */
  static async validateSystemHealth() {
    try {
      const healthChecks = {
        permissions: false,
        database_connection: false,
        audit_logging: false
      };

      // Check permissions
      const permissionsResult = await RBACService.getPermissions();
      healthChecks.permissions = permissionsResult.success && (permissionsResult.data?.length || 0) > 0;

      // Check database connection by testing a simple query
      const { data, error } = await supabase.from('franchisor').select('franchisor_id').limit(1);
      healthChecks.database_connection = !error;

      // Check audit logging
      const auditResult = await AuditService.logSystemEvent('health_check', {
        timestamp: new Date().toISOString(),
        checks: healthChecks
      });
      healthChecks.audit_logging = auditResult.success;

      const allHealthy = Object.values(healthChecks).every(check => check);

      return {
        success: allHealthy,
        data: {
          overall_health: allHealthy ? 'healthy' : 'degraded',
          checks: healthChecks,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error validating system health:', error);
      return {
        success: false,
        error,
        data: {
          overall_health: 'unhealthy',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get system statistics and metrics
   */
  static async getSystemStatistics() {
    try {
      // Get basic system metrics
      const [
        franchisorsResult,
        brandsResult,
        franchiseesResult,
        locationsResult,
        usersResult
      ] = await Promise.all([
        supabase.from('franchisor').select('franchisor_id, status').eq('status', 'active'),
        supabase.from('brand').select('brand_id'),
        supabase.from('franchisee').select('franchisee_id, status').eq('status', 'active'),
        supabase.from('location').select('location_id, status').eq('status', 'active'),
        supabase.from('user_profiles').select('user_id, status').eq('status', 'active')
      ]);

      const statistics = {
        franchisors: {
          total: franchisorsResult.data?.length || 0,
          active: franchisorsResult.data?.filter(f => f.status === 'active').length || 0
        },
        brands: {
          total: brandsResult.data?.length || 0
        },
        franchisees: {
          total: franchiseesResult.data?.length || 0,
          active: franchiseesResult.data?.filter(f => f.status === 'active').length || 0
        },
        locations: {
          total: locationsResult.data?.length || 0,
          active: locationsResult.data?.filter(l => l.status === 'active').length || 0
        },
        users: {
          total: usersResult.data?.length || 0,
          active: usersResult.data?.filter(u => u.status === 'active').length || 0
        },
        timestamp: new Date().toISOString()
      };

      return {
        success: true,
        data: statistics
      };

    } catch (error) {
      console.error('Error fetching system statistics:', error);
      return {
        success: false,
        error
      };
    }
  }
}

/**
 * Utility functions for common franchise operations
 */
export class FranchiseUtils {
  
  /**
   * Generate a unique SKU for a product
   */
  static generateSKU(brandName: string, productName: string, categoryName?: string): string {
    const brandCode = brandName.substring(0, 3).toUpperCase();
    const categoryCode = categoryName ? categoryName.substring(0, 2).toUpperCase() : 'GN';
    const productCode = productName.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    
    return `${brandCode}-${categoryCode}-${productCode}-${timestamp}`;
  }

  /**
   * Calculate franchise performance score
   */
  static calculatePerformanceScore(metrics: {
    salesTarget: number;
    actualSales: number;
    customerSatisfaction: number;
    complianceScore: number;
  }): number {
    const salesPerformance = Math.min((metrics.actualSales / metrics.salesTarget) * 100, 100);
    const customerScore = metrics.customerSatisfaction;
    const complianceScore = metrics.complianceScore;
    
    // Weighted average: 40% sales, 30% customer satisfaction, 30% compliance
    return Math.round((salesPerformance * 0.4) + (customerScore * 0.3) + (complianceScore * 0.3));
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Calculate date ranges for analytics
   */
  static getDateRanges() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastQuarter = new Date(now);
    lastQuarter.setMonth(lastQuarter.getMonth() - 3);
    
    const lastYear = new Date(now);
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    return {
      today: { from: today, to: today },
      yesterday: { from: yesterday.toISOString().split('T')[0], to: yesterday.toISOString().split('T')[0] },
      last7Days: { from: lastWeek.toISOString().split('T')[0], to: today },
      last30Days: { from: lastMonth.toISOString().split('T')[0], to: today },
      last90Days: { from: lastQuarter.toISOString().split('T')[0], to: today },
      lastYear: { from: lastYear.toISOString().split('T')[0], to: today }
    };
  }

  /**
   * Validate business rules
   */
  static validateBusinessRules = {
    /**
     * Validate if a franchisee can be deleted
     */
    canDeleteFranchisee: async (franchiseeId: string): Promise<{ canDelete: boolean; reason?: string }> => {
      try {
        // Check for active locations
        const { data: locations } = await supabase
          .from('location')
          .select('location_id')
          .eq('franchisee_id', franchiseeId)
          .eq('status', 'active');

        if (locations && locations.length > 0) {
          return { canDelete: false, reason: 'Franchisee has active locations' };
        }

        // Check for recent transactions
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: recentSales } = await supabase
          .from('sales_transaction')
          .select('txn_id')
          .gte('txn_date', thirtyDaysAgo.toISOString())
          .limit(1);

        if (recentSales && recentSales.length > 0) {
          return { canDelete: false, reason: 'Franchisee has recent transactions' };
        }

        return { canDelete: true };
      } catch (error) {
        return { canDelete: false, reason: 'Error validating deletion rules' };
      }
    },

    /**
     * Validate product pricing
     */
    validateProductPrice: (price: number, brandId: string): { isValid: boolean; message?: string } => {
      if (price <= 0) {
        return { isValid: false, message: 'Price must be greater than zero' };
      }

      if (price > 10000) {
        return { isValid: false, message: 'Price seems unusually high, please verify' };
      }

      return { isValid: true };
    }
  };
}

// Import supabase client for utility functions
import { supabase } from '@/integrations/supabase/client';

export default {
  FranchiseAuthService,
  BrandService,
  RBACService,
  AnalyticsService,
  AuditService,
  FranchiseSystemInitializer,
  FranchiseUtils
};
