
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { IAMRole, IAMPermission } from '@/services/iam/iamTypes';

interface EditRoleFormProps {
  role: IAMRole;
  permissions: IAMPermission[];
  onSubmit: (roleId: string, roleData: Partial<IAMRole>) => Promise<boolean>;
  onCancel: () => void;
  isLoading: boolean;
}

export const EditRoleForm: React.FC<EditRoleFormProps> = ({
  role,
  permissions,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    name: role.name,
    description: role.description,
    permissions: role.permissions
  });

  useEffect(() => {
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
  }, [role]);

  const handlePermissionToggle = (permission: IAMPermission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.find(p => p.id === permission.id)
        ? prev.permissions.filter(p => p.id !== permission.id)
        : [...prev.permissions, permission]
    }));
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

  const handleSubmit = async () => {
    const success = await onSubmit(role.id, {
      name: formData.name,
      description: formData.description,
      permissions: formData.permissions
    });
    if (success) {
      onCancel();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="editRoleName">Role Name</Label>
        <Input
          id="editRoleName"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          disabled={role.isSystemRole}
          placeholder="Enter role name"
        />
        {role.isSystemRole && (
          <p className="text-sm text-gray-500 mt-1">System roles cannot be renamed</p>
        )}
      </div>
      <div>
        <Label htmlFor="editRoleDescription">Description</Label>
        <Textarea
          id="editRoleDescription"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter role description"
        />
      </div>
      <div>
        <Label>Permissions ({formData.permissions.length} selected)</Label>
        <div className="grid grid-cols-1 gap-3 mt-2 max-h-64 overflow-y-auto">
          {permissions.map(permission => (
            <div key={permission.id} className="flex items-center space-x-3 p-3 border rounded-lg">
              <Checkbox
                id={`edit-perm-${permission.id}`}
                checked={formData.permissions.some(p => p.id === permission.id)}
                onCheckedChange={() => handlePermissionToggle(permission)}
                disabled={role.isSystemRole}
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
        {role.isSystemRole && (
          <p className="text-sm text-gray-500 mt-2">System role permissions cannot be modified</p>
        )}
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || role.isSystemRole || !formData.name || !formData.description}
        >
          {isLoading ? 'Updating...' : 'Update Role'}
        </Button>
      </div>
    </div>
  );
};
