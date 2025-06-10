
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { IAMRole, IAMPermission } from '@/services/iam/iamTypes';
import { 
  getIAMRoles, 
  getAllPermissions, 
  createCustomRole, 
  updateRole, 
  deleteRole 
} from '@/services/iam/iamService';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Shield, 
  Lock 
} from 'lucide-react';

export const IAMRoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<IAMRole[]>([]);
  const [permissions, setPermissions] = useState<IAMPermission[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<IAMRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    permissions: [] as IAMPermission[]
  });

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    permissions: [] as IAMPermission[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRoles(getIAMRoles());
    setPermissions(getAllPermissions());
  };

  const handleCreateRole = async () => {
    if (!createForm.name || !createForm.description || createForm.permissions.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select at least one permission.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createCustomRole(createForm);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setIsCreateDialogOpen(false);
        setCreateForm({ name: '', description: '', permissions: [] });
        loadData();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      const result = await updateRole(selectedRole.id, {
        name: editForm.name,
        description: editForm.description,
        permissions: editForm.permissions
      });
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setIsEditDialogOpen(false);
        setSelectedRole(null);
        loadData();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    setIsLoading(true);
    try {
      const result = await deleteRole(roleId);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        loadData();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (role: IAMRole) => {
    setSelectedRole(role);
    setEditForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (role: IAMRole) => {
    setSelectedRole(role);
    setIsViewDialogOpen(true);
  };

  const handlePermissionToggle = (permission: IAMPermission, isCreate: boolean = false) => {
    if (isCreate) {
      setCreateForm(prev => ({
        ...prev,
        permissions: prev.permissions.find(p => p.id === permission.id)
          ? prev.permissions.filter(p => p.id !== permission.id)
          : [...prev.permissions, permission]
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        permissions: prev.permissions.find(p => p.id === permission.id)
          ? prev.permissions.filter(p => p.id !== permission.id)
          : [...prev.permissions, permission]
      }));
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'write': return 'bg-green-100 text-green-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Role Management</span>
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input
                    id="roleName"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <Label htmlFor="roleDescription">Description</Label>
                  <Textarea
                    id="roleDescription"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter role description"
                  />
                </div>
                <div>
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-1 gap-3 mt-2 max-h-64 overflow-y-auto">
                    {permissions.map(permission => (
                      <div key={permission.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={`perm-${permission.id}`}
                          checked={createForm.permissions.some(p => p.id === permission.id)}
                          onCheckedChange={() => handlePermissionToggle(permission, true)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{permission.name}</span>
                            <Badge className={getActionColor(permission.action)}>
                              {permission.action}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{permission.description}</p>
                          <p className="text-xs text-gray-500">Resource: {permission.resource}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRole} disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Role'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <div>
                    <p className="font-medium flex items-center space-x-2">
                      <span>{role.name}</span>
                      {role.isSystemRole && <Lock className="w-4 h-4 text-gray-500" />}
                    </p>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map(permission => (
                      <Badge key={permission.id} variant="secondary" className="text-xs">
                        {permission.name}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{role.permissions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={role.isSystemRole ? "default" : "secondary"}>
                    {role.isSystemRole ? "System" : "Custom"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(role.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openViewDialog(role)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {!role.isSystemRole && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(role)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* View Role Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Role Details</DialogTitle>
            </DialogHeader>
            {selectedRole && (
              <div className="space-y-4">
                <div>
                  <Label>Role Name</Label>
                  <p className="font-medium">{selectedRole.name}</p>
                </div>
                <div>
                  <Label>Description</Label>
                  <p>{selectedRole.description}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <Badge variant={selectedRole.isSystemRole ? "default" : "secondary"}>
                    {selectedRole.isSystemRole ? "System Role" : "Custom Role"}
                  </Badge>
                </div>
                <div>
                  <Label>Permissions ({selectedRole.permissions.length})</Label>
                  <div className="space-y-2 mt-2">
                    {selectedRole.permissions.map(permission => (
                      <div key={permission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{permission.name}</span>
                          <p className="text-sm text-gray-600">{permission.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getActionColor(permission.action)}>
                            {permission.action}
                          </Badge>
                          <Badge variant="outline">
                            {permission.resource}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
            </DialogHeader>
            {selectedRole && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editRoleName">Role Name</Label>
                  <Input
                    id="editRoleName"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    disabled={selectedRole.isSystemRole}
                  />
                </div>
                <div>
                  <Label htmlFor="editRoleDescription">Description</Label>
                  <Textarea
                    id="editRoleDescription"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-1 gap-3 mt-2 max-h-64 overflow-y-auto">
                    {permissions.map(permission => (
                      <div key={permission.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={`edit-perm-${permission.id}`}
                          checked={editForm.permissions.some(p => p.id === permission.id)}
                          onCheckedChange={() => handlePermissionToggle(permission, false)}
                          disabled={selectedRole.isSystemRole}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{permission.name}</span>
                            <Badge className={getActionColor(permission.action)}>
                              {permission.action}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{permission.description}</p>
                          <p className="text-xs text-gray-500">Resource: {permission.resource}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditRole} disabled={isLoading || selectedRole.isSystemRole}>
                    {isLoading ? 'Updating...' : 'Update Role'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
