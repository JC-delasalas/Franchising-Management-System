// Franchise Management Components
export { BrandManagement } from './BrandManagement';
export { UserRoleManagement } from './UserRoleManagement';
export { AnalyticsDashboard } from './AnalyticsDashboard';
export { AuditLogViewer } from './AuditLogViewer';

// Re-export types for convenience
export type { 
  BrandManagementProps,
  UserRoleManagementProps,
  AnalyticsDashboardProps,
  AuditLogViewerProps
} from './types';

// Component metadata for dynamic loading
export const FranchiseComponents = {
  BrandManagement: {
    name: 'Brand Management',
    description: 'Manage franchise brands and their properties',
    category: 'Brand Management',
    permissions: ['brand:read', 'brand:write'],
    icon: 'Package'
  },
  UserRoleManagement: {
    name: 'User Role Management',
    description: 'Manage user roles and permissions',
    category: 'User Management',
    permissions: ['user:admin', 'role:admin'],
    icon: 'Users'
  },
  AnalyticsDashboard: {
    name: 'Analytics Dashboard',
    description: 'Performance insights and key metrics',
    category: 'Analytics',
    permissions: ['analytics:read'],
    icon: 'BarChart3'
  },
  AuditLogViewer: {
    name: 'Audit Log Viewer',
    description: 'Monitor system activities and security events',
    category: 'Security',
    permissions: ['audit:read'],
    icon: 'Shield'
  }
} as const;
