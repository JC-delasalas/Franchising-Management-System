import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type Role = Database['public']['Tables']['role']['Row'];
type Permission = Database['public']['Tables']['permission']['Row'];

/**
 * Authentication and Authorization Service
 * Objective 3: Secure, Role-Based Access Control
 */
export class AuthService {
  /**
   * Get user profile with roles and permissions
   */
  async getUserWithRoles(userId: string): Promise<{
    data: (UserProfile & {
      roles: (Role & { permissions: Permission[] })[];
    }) | null;
    error: any;
  }> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_roles:user_role(
          role:role(
            *,
            role_permissions:role_permission(
              permission:permission(*)
            )
          )
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) return { data: null, error };

    // Transform the data structure
    const userWithRoles = {
      ...data,
      roles: data.user_roles?.map((ur: any) => ({
        ...ur.role,
        permissions: ur.role.role_permissions?.map((rp: any) => rp.permission) || []
      })) || []
    };

    return { data: userWithRoles, error: null };
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const { data } = await supabase
      .from('user_profiles')
      .select(`
        user_roles:user_role(
          role:role(
            role_permissions:role_permission(
              permission:permission(permission_nm)
            )
          )
        )
      `)
      .eq('user_id', userId)
      .single();

    if (!data) return false;

    const permissions = data.user_roles?.flatMap((ur: any) =>
      ur.role.role_permissions?.map((rp: any) => rp.permission.permission_nm) || []
    ) || [];

    return permissions.includes(permissionName);
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string): Promise<{ error: any }> {
    // Check if user already has this role
    const { data: existing } = await supabase
      .from('user_role')
      .select('*')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .single();

    if (existing) {
      return { error: new Error('User already has this role') };
    }

    const { error } = await supabase
      .from('user_role')
      .insert({
        user_id: userId,
        role_id: roleId,
      });

    return { error };
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, roleId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('user_role')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);

    return { error };
  }

  /**
   * Get all available roles for a franchisor
   */
  async getRoles(franchisorId: string): Promise<{
    data: Role[] | null;
    error: any;
  }> {
    const { data, error } = await supabase
      .from('role')
      .select('*')
      .eq('franchisor_id', franchisorId)
      .order('role_nm');

    return { data, error };
  }

  /**
   * Create a new role
   */
  async createRole(roleData: {
    role_nm: string;
    description?: string;
    franchisor_id: string;
    permissions: string[];
  }): Promise<{
    data: Role | null;
    error: any;
  }> {
    // Create the role
    const { data: role, error: roleError } = await supabase
      .from('role')
      .insert({
        role_nm: roleData.role_nm,
        description: roleData.description,
        franchisor_id: roleData.franchisor_id,
      })
      .select()
      .single();

    if (roleError) return { data: null, error: roleError };

    // Assign permissions to the role
    if (roleData.permissions.length > 0) {
      const rolePermissions = roleData.permissions.map(permissionId => ({
        role_id: role.role_id,
        permission_id: permissionId,
      }));

      const { error: permissionError } = await supabase
        .from('role_permission')
        .insert(rolePermissions);

      if (permissionError) {
        // Rollback role creation
        await supabase.from('role').delete().eq('role_id', role.role_id);
        return { data: null, error: permissionError };
      }
    }

    return { data: role, error: null };
  }

  /**
   * Get all available permissions
   */
  async getPermissions(): Promise<{
    data: Permission[] | null;
    error: any;
  }> {
    const { data, error } = await supabase
      .from('permission')
      .select('*')
      .order('permission_nm');

    return { data, error };
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{
    data: UserProfile | null;
    error: any;
  }> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get users by franchisor with their roles
   */
  async getUsersByFranchisor(franchisorId: string): Promise<{
    data: (UserProfile & { roles: Role[] })[] | null;
    error: any;
  }> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_roles:user_role(
          role:role(*)
        )
      `)
      .eq('franchisor_id', franchisorId);

    if (error) return { data: null, error };

    // Transform the data structure
    const usersWithRoles = data?.map((user: any) => ({
      ...user,
      roles: user.user_roles?.map((ur: any) => ur.role) || []
    })) || [];

    return { data: usersWithRoles, error: null };
  }
}
