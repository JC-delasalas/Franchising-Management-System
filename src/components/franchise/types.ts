// Component prop types for franchise management components

export interface BrandManagementProps {
  franchisorId: string;
}

export interface UserRoleManagementProps {
  franchisorId: string;
}

export interface AnalyticsDashboardProps {
  franchisorId: string;
  brandId?: string;
  locationId?: string;
}

export interface AuditLogViewerProps {
  franchisorId: string;
}

// Common data types used across components
export interface Brand {
  brand_id: string;
  brand_nm: string;
  tagline?: string;
  details?: string;
  logo_url?: string;
  metadata?: Record<string, any>;
  marketing_data?: Record<string, any>;
  franchisor_id: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  role_id: string;
  role_nm: string;
  details?: string;
  franchisor_id: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  permission_id: string;
  permission_nm: string;
  details?: string;
  resource?: string;
  action?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  location_id: string;
  user?: {
    first_nm: string;
    last_nm: string;
    email: string;
  };
  role?: {
    role_nm: string;
    details?: string;
  };
  location?: {
    location_nm: string;
  };
}

export interface AuditLog {
  log_id: number;
  user_id?: string;
  entity_type: string;
  entity_id?: string;
  action_type: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp: string;
  user?: {
    first_nm: string;
    last_nm: string;
    email: string;
  };
}

export interface KPI {
  kpi_id: string;
  kpi_nm: string;
  target_value: number;
  unit_of_measure: string;
  brand_id: string;
  details?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  totalSales: number;
  totalTransactions: number;
  averageOrderValue: number;
  salesTrend: Array<{
    date: string;
    sales: number;
    transactions: number;
  }>;
  kpiPerformance: Array<{
    kpi_nm: string;
    target_value: number;
    actual_value: number;
    achievement_percentage: number;
  }>;
}

// Service response types
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

// Filter types
export interface AnalyticsFilter {
  brandId?: string;
  locationId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditLogFilter {
  entity_type?: string;
  action_type?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}
