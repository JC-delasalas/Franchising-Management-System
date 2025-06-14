
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useIAMRoles } from '@/hooks/useIAMRoles';
import { CreateRoleForm } from './CreateRoleForm';
import { EditRoleForm } from './EditRoleForm';
import { IAMRole } from '@/services/iam/iamTypes';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Shield, 
  Lock 
} from 'lucide-react';

export const IAMRoleManagement: React.FC = () => {
  const {
    roles,
    permissions,
    isLoading,
    handleCreateRole,
    handleUpdateRole,
    handleDeleteRole
  } = useIAMRoles();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<IAMRole | null>(null);

  const openEditDialog = (role: IAMRole) => {
    setSelectedRole(role);
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (role: IAMRole) => {
    setSelectedRole(role);
    setIsViewDialogOpen(true);
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
              <CreateRoleForm
                permissions={permissions}
                onSubmit={handleCreateRole}
                onCancel={() => setIsCreateDialogOpen(false)}
                isLoading={isLoading}
              />
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
                  <label className="text-sm font-medium">Role Name</label>
                  <p className="font-medium">{selectedRole.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p>{selectedRole.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Badge variant={selectedRole.isSystemRole ? "default" : "secondary"}>
                    {selectedRole.isSystemRole ? "System Role" : "Custom Role"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Permissions ({selectedRole.permissions.length})</label>
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
              <EditRoleForm
                role={selectedRole}
                permissions={permissions}
                onSubmit={handleUpdateRole}
                onCancel={() => setIsEditDialogOpen(false)}
                isLoading={isLoading}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
