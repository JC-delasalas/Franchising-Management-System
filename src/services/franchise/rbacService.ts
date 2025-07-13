import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Role = Database['public']['Tables']['role']['Row'];
type RoleInsert = Database['public']['Tables']['role']['Insert'];
type Permission = Database['public']['Tables']['permission']['Row'];
type PermissionInsert = Database['public']['Tables']['permission']['Insert'];
type UserRole = Database['public']['Tables']['user_role']['Row'];
type UserRoleInsert = Database['public']['Tables']['user_role']['Insert'];

export interface RoleCreateData {
  role_nm: string;
  details?: string;
  permissions: string[]; // Array of permission IDs
}

export interface PermissionCreateData {
  permission_nm: string;
  details?: string;
  resource: string;
  action: string;
}

export interface UserRoleAssignment {
  user_id: string;
  role_id: string;
  location_id: string;
}

/**
 * Enhanced Role-Based Access Control (RBAC) Service
 * Supports Objective 3: Secure, Role-Based Access Control
 */
export class RBACService {

  /**
   * Initialize default permissions for the system
   */
  static async initializeDefaultPermissions() {
    const defaultPermissions: PermissionInsert[] = [
      // Brand Management
      { permission_nm: 'View Brands', resource: 'brand', action: 'read', details: 'View brand information' },
      { permission_nm: 'Create Brands', resource: 'brand', action: 'write', details: 'Create new brands' },
      { permission_nm: 'Update Brands', resource: 'brand', action: 'write', details: 'Update brand information' },
      { permission_nm: 'Delete Brands', resource: 'brand', action: 'delete', details: 'Delete brands' },
      
      // Product Management
      { permission_nm: 'View Products', resource: 'product', action: 'read', details: 'View product catalog' },
      { permission_nm: 'Create Products', resource: 'product', action: 'write', details: 'Add new products' },
      { permission_nm: 'Update Products', resource: 'product', action: 'write', details: 'Update product information' },
      { permission_nm: 'Delete Products', resource: 'product', action: 'delete', details: 'Remove products' },
      
      // Franchisee Management
      { permission_nm: 'View Franchisees', resource: 'franchisee', action: 'read', details: 'View franchisee information' },
      { permission_nm: 'Create Franchisees', resource: 'franchisee', action: 'write', details: 'Add new franchisees' },
      { permission_nm: 'Update Franchisees', resource: 'franchisee', action: 'write', details: 'Update franchisee information' },
      { permission_nm: 'Delete Franchisees', resource: 'franchisee', action: 'delete', details: 'Remove franchisees' },
      
      // Location Management
      { permission_nm: 'View Locations', resource: 'location', action: 'read', details: 'View location information' },
      { permission_nm: 'Create Locations', resource: 'location', action: 'write', details: 'Add new locations' },
      { permission_nm: 'Update Locations', resource: 'location', action: 'write', details: 'Update location information' },
      { permission_nm: 'Delete Locations', resource: 'location', action: 'delete', details: 'Remove locations' },
      
      // Sales Management
      { permission_nm: 'View Sales', resource: 'sales', action: 'read', details: 'View sales data' },
      { permission_nm: 'Create Sales', resource: 'sales', action: 'write', details: 'Record sales transactions' },
      { permission_nm: 'Update Sales', resource: 'sales', action: 'write', details: 'Update sales records' },
      { permission_nm: 'Delete Sales', resource: 'sales', action: 'delete', details: 'Delete sales records' },
      
      // Inventory Management
      { permission_nm: 'View Inventory', resource: 'inventory', action: 'read', details: 'View inventory levels' },
      { permission_nm: 'Update Inventory', resource: 'inventory', action: 'write', details: 'Update inventory levels' },
      { permission_nm: 'Manage Orders', resource: 'inventory', action: 'write', details: 'Create and manage orders' },
      
      // User Management
      { permission_nm: 'View Users', resource: 'user', action: 'read', details: 'View user information' },
      { permission_nm: 'Create Users', resource: 'user', action: 'write', details: 'Add new users' },
      { permission_nm: 'Update Users', resource: 'user', action: 'write', details: 'Update user information' },
      { permission_nm: 'Delete Users', resource: 'user', action: 'delete', details: 'Remove users' },
      
      // Role Management
      { permission_nm: 'View Roles', resource: 'role', action: 'read', details: 'View role information' },
      { permission_nm: 'Create Roles', resource: 'role', action: 'write', details: 'Create new roles' },
      { permission_nm: 'Update Roles', resource: 'role', action: 'write', details: 'Update role information' },
      { permission_nm: 'Delete Roles', resource: 'role', action: 'delete', details: 'Delete roles' },
      
      // Analytics & Reporting
      { permission_nm: 'View Analytics', resource: 'analytics', action: 'read', details: 'View analytics dashboards' },
      { permission_nm: 'Generate Reports', resource: 'reports', action: 'write', details: 'Generate and download reports' },
      { permission_nm: 'View Financial Data', resource: 'financial', action: 'read', details: 'View financial information' },
      
      // Training Management
      { permission_nm: 'View Training', resource: 'training', action: 'read', details: 'View training modules' },
      { permission_nm: 'Create Training', resource: 'training', action: 'write', details: 'Create training content' },
      { permission_nm: 'Update Training', resource: 'training', action: 'write', details: 'Update training content' },
      { permission_nm: 'Delete Training', resource: 'training', action: 'delete', details: 'Remove training content' },
      
      // System Administration
      { permission_nm: 'System Admin', resource: 'system', action: 'admin', details: 'Full system administration access' },
      { permission_nm: 'Audit Logs', resource: 'audit', action: 'read', details: 'View audit logs' },
      { permission_nm: 'File Management', resource: 'files', action: 'write', details: 'Manage file uploads and storage' }
    ];

    try {
      // Use upsert to avoid conflicts
      const { data, error } = await supabase
        .from('permission')
        .upsert(defaultPermissions, { 
          onConflict: 'resource,action',
          ignoreDuplicates: true 
        })
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error initializing permissions:', error);
      return { success: false, error };
    }
  }

  /**
   * Get all permissions
   */
  static async getPermissions() {
    try {
      const { data, error } = await supabase
        .from('permission')
        .select('*')
        .order('resource', { ascending: true })
        .order('action', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return { success: false, error };
    }
  }

  /**
   * Get roles for a specific franchisor
   */
  static async getRoles(franchisorId: string) {
    try {
      const { data, error } = await supabase
        .from('role')
        .select(`
          *,
          permissions:role_permission(
            permission:permission_id(*)
          ),
          user_count:user_role(count)
        `)
        .eq('franchisor_id', franchisorId)
        .order('role_nm');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching roles:', error);
      return { success: false, error };
    }
  }

  /**
   * Create a new role
   */
  static async createRole(franchisorId: string, roleData: RoleCreateData) {
    try {
      // Create the role
      const { data: role, error: roleError } = await supabase
        .from('role')
        .insert({
          franchisor_id: franchisorId,
          role_nm: roleData.role_nm,
          details: roleData.details
        })
        .select()
        .single();

      if (roleError) throw roleError;

      // Assign permissions to the role
      if (roleData.permissions.length > 0) {
        const rolePermissions = roleData.permissions.map(permissionId => ({
          role_id: role.role_id,
          permission_id: permissionId
        }));

        const { error: permissionError } = await supabase
          .from('role_permission')
          .insert(rolePermissions);

        if (permissionError) throw permissionError;
      }

      return { success: true, data: role };
    } catch (error) {
      console.error('Error creating role:', error);
      return { success: false, error };
    }
  }

  /**
   * Update a role and its permissions
   */
  static async updateRole(roleId: string, updates: Partial<Role>, permissions?: string[]) {
    try {
      // Update role information
      const { data: role, error: roleError } = await supabase
        .from('role')
        .update(updates)
        .eq('role_id', roleId)
        .select()
        .single();

      if (roleError) throw roleError;

      // Update permissions if provided
      if (permissions !== undefined) {
        // Remove existing permissions
        await supabase
          .from('role_permission')
          .delete()
          .eq('role_id', roleId);

        // Add new permissions
        if (permissions.length > 0) {
          const rolePermissions = permissions.map(permissionId => ({
            role_id: roleId,
            permission_id: permissionId
          }));

          const { error: permissionError } = await supabase
            .from('role_permission')
            .insert(rolePermissions);

          if (permissionError) throw permissionError;
        }
      }

      return { success: true, data: role };
    } catch (error) {
      console.error('Error updating role:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete a role
   */
  static async deleteRole(roleId: string) {
    try {
      // Check if role is assigned to any users
      const { data: userRoles } = await supabase
        .from('user_role')
        .select('user_id')
        .eq('role_id', roleId);

      if (userRoles && userRoles.length > 0) {
        return {
          success: false,
          error: 'Cannot delete role that is assigned to users'
        };
      }

      // Delete role permissions first
      await supabase
        .from('role_permission')
        .delete()
        .eq('role_id', roleId);

      // Delete the role
      const { data, error } = await supabase
        .from('role')
        .delete()
        .eq('role_id', roleId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error deleting role:', error);
      return { success: false, error };
    }
  }

  /**
   * Assign role to user for a specific location
   */
  static async assignUserRole(assignment: UserRoleAssignment) {
    try {
      const { data, error } = await supabase
        .from('user_role')
        .insert(assignment)
        .select(`
          *,
          user:user_id(first_nm, last_nm, email),
          role:role_id(role_nm, details),
          location:location_id(location_nm)
        `)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error assigning user role:', error);
      return { success: false, error };
    }
  }

  /**
   * Remove role from user
   */
  static async removeUserRole(userId: string, roleId: string, locationId: string) {
    try {
      const { data, error } = await supabase
        .from('user_role')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleId)
        .eq('location_id', locationId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error removing user role:', error);
      return { success: false, error };
    }
  }

  /**
   * Get user permissions for a specific location
   */
  static async getUserPermissions(userId: string, locationId?: string) {
    try {
      let query = supabase
        .from('user_role')
        .select(`
          role:role_id(
            role_nm,
            role_permission(
              permission:permission_id(*)
            )
          ),
          location:location_id(location_nm)
        `)
        .eq('user_id', userId);

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Flatten permissions and remove duplicates
      const permissions = new Map();
      data?.forEach(userRole => {
        userRole.role?.role_permission?.forEach((rp: any) => {
          if (rp.permission) {
            permissions.set(rp.permission.permission_id, rp.permission);
          }
        });
      });

      return { 
        success: true, 
        data: {
          permissions: Array.from(permissions.values()),
          roles: data
        }
      };
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return { success: false, error };
    }
  }

  /**
   * Check if user has specific permission
   */
  static async hasPermission(userId: string, resource: string, action: string, locationId?: string) {
    try {
      const result = await this.getUserPermissions(userId, locationId);
      
      if (!result.success || !result.data) {
        return false;
      }

      return result.data.permissions.some((permission: Permission) => 
        permission.resource === resource && permission.action === action
      );
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Get users with their roles for a franchisor
   */
  static async getUsersWithRoles(franchisorId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles:user_role(
            role:role_id(
              role_nm,
              details
            ),
            location:location_id(
              location_nm
            )
          )
        `)
        .eq('franchisor_id', franchisorId)
        .order('first_nm');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching users with roles:', error);
      return { success: false, error };
    }
  }

  /**
   * Create default roles for a new franchisor
   */
  static async createDefaultRoles(franchisorId: string) {
    try {
      // Get all permissions first
      const permissionsResult = await this.getPermissions();
      if (!permissionsResult.success || !permissionsResult.data) {
        throw new Error('Failed to fetch permissions');
      }

      const permissions = permissionsResult.data;

      // Define default roles with their permissions
      const defaultRoles = [
        {
          role_nm: 'System Administrator',
          details: 'Full system access and administration',
          permissions: permissions.map(p => p.permission_id) // All permissions
        },
        {
          role_nm: 'Franchisor Manager',
          details: 'Manage franchise operations and oversight',
          permissions: permissions
            .filter(p => !['system', 'audit'].includes(p.resource))
            .map(p => p.permission_id)
        },
        {
          role_nm: 'Franchisee Owner',
          details: 'Manage own franchise locations',
          permissions: permissions
            .filter(p => ['location', 'sales', 'inventory', 'training', 'analytics'].includes(p.resource))
            .map(p => p.permission_id)
        },
        {
          role_nm: 'Store Manager',
          details: 'Manage daily store operations',
          permissions: permissions
            .filter(p => ['sales', 'inventory', 'training'].includes(p.resource) && p.action !== 'delete')
            .map(p => p.permission_id)
        },
        {
          role_nm: 'Cashier',
          details: 'Process sales transactions',
          permissions: permissions
            .filter(p => p.resource === 'sales' && ['read', 'write'].includes(p.action))
            .map(p => p.permission_id)
        }
      ];

      const results = [];
      for (const roleData of defaultRoles) {
        const result = await this.createRole(franchisorId, roleData);
        results.push(result);
      }

      return { success: true, data: results };
    } catch (error) {
      console.error('Error creating default roles:', error);
      return { success: false, error };
    }
  }
}

export default RBACService;
