import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Shield, MapPin, Plus, Trash2 } from 'lucide-react';
import { RBACService } from '@/services/franchise';
import { useToast } from '@/hooks/use-toast';

interface Role {
  role_id: string;
  role_nm: string;
  details?: string;
  franchisor_id: string;
  created_at: string;
}

interface Permission {
  permission_id: string;
  permission_nm: string;
  details?: string;
}

interface UserRole {
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

interface UserRoleManagementProps {
  franchisorId: string;
}

export function UserRoleManagement({ franchisorId }: UserRoleManagementProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showCreateRole, setShowCreateRole] = useState(false);
  const { toast } = useToast();

  const [newRole, setNewRole] = useState({
    role_nm: '',
    details: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, [franchisorId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [rolesResult, permissionsResult, userRolesResult] = await Promise.all([
        RBACService.getRoles(franchisorId),
        RBACService.getPermissions(),
        RBACService.getUsersWithRoles(franchisorId)
      ]);

      if (rolesResult.success) {
        setRoles(rolesResult.data || []);
      }

      if (permissionsResult.success) {
        setPermissions(permissionsResult.data || []);
      }

      if (userRolesResult.success) {
        setUserRoles(userRolesResult.data || []);
      }

    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load roles and permissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await RBACService.createRole(franchisorId, newRole);
      
      if (result.success) {
        toast({
          title: "Role created",
          description: `${newRole.role_nm} has been created successfully`
        });
        
        setNewRole({ role_nm: '', details: '', permissions: [] });
        setShowCreateRole(false);
        loadData();
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to create role",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      return;
    }

    try {
      const result = await RBACService.deleteRole(roleId);
      
      if (result.success) {
        toast({
          title: "Role deleted",
          description: `${roleName} has been deleted successfully`
        });
        loadData();
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to delete role",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleRemoveUserRole = async (userId: string, roleId: string, locationId: string) => {
    try {
      const result = await RBACService.removeUserRole(userId, roleId, locationId);
      
      if (result.success) {
        toast({
          title: "Role removed",
          description: "User role has been removed successfully"
        });
        loadData();
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to remove user role",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const togglePermission = (permissionId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading roles and permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Role Management</h2>
          <p className="text-muted-foreground">Manage user roles and permissions across your franchise</p>
        </div>
        <Button onClick={() => setShowCreateRole(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Role Creation Form */}
      {showCreateRole && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Role</CardTitle>
            <CardDescription>Define a new role with specific permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Role Name *</label>
                  <input
                    type="text"
                    value={newRole.role_nm}
                    onChange={(e) => setNewRole({ ...newRole, role_nm: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <input
                    type="text"
                    value={newRole.details}
                    onChange={(e) => setNewRole({ ...newRole, details: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="Role description"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Permissions</label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {permissions.map((permission) => (
                    <label key={permission.permission_id} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newRole.permissions.includes(permission.permission_id)}
                        onChange={() => togglePermission(permission.permission_id)}
                        className="rounded"
                      />
                      <span>{permission.permission_nm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Role</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateRole(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.role_id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {role.role_nm}
                  </CardTitle>
                  {role.details && (
                    <CardDescription className="mt-1">{role.details}</CardDescription>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteRole(role.role_id, role.role_nm)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Created {new Date(role.created_at).toLocaleDateString()}
                </div>
                <Badge variant="outline">
                  {userRoles.filter(ur => ur.role_id === role.role_id).length} users assigned
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Role Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Role Assignments
          </CardTitle>
          <CardDescription>Current role assignments across all locations</CardDescription>
        </CardHeader>
        <CardContent>
          {userRoles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles.map((userRole, index) => (
                  <TableRow key={`${userRole.user_id}-${userRole.role_id}-${userRole.location_id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {userRole.user?.first_nm} {userRole.user?.last_nm}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {userRole.user?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{userRole.role?.role_nm}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {userRole.location?.location_nm}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveUserRole(
                          userRole.user_id,
                          userRole.role_id,
                          userRole.location_id
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No role assignments</h3>
              <p className="text-muted-foreground">
                User roles will appear here once they are assigned
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Permissions</CardTitle>
          <CardDescription>Available permissions in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {permissions.map((permission) => (
              <Badge key={permission.permission_id} variant="outline" className="justify-start">
                {permission.permission_nm}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
