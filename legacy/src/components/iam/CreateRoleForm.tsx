
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { IAMPermission } from '@/services/iam/iamTypes';

interface CreateRoleFormProps {
  permissions: IAMPermission[];
  onSubmit: (roleData: { name: string; description: string; permissions: IAMPermission[] }) => Promise<boolean>;
  onCancel: () => void;
  isLoading: boolean;
}

export const CreateRoleForm: React.FC<CreateRoleFormProps> = ({
  permissions,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as IAMPermission[]
  });

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
    const success = await onSubmit(formData);
    if (success) {
      setFormData({ name: '', description: '', permissions: [] });
      onCancel();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="roleName">Role Name</Label>
        <Input
          id="roleName"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter role name"
        />
      </div>
      <div>
        <Label htmlFor="roleDescription">Description</Label>
        <Textarea
          id="roleDescription"
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
                id={`perm-${permission.id}`}
                checked={formData.permissions.some(p => p.id === permission.id)}
                onCheckedChange={() => handlePermissionToggle(permission)}
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
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !formData.name || !formData.description || formData.permissions.length === 0}
        >
          {isLoading ? 'Creating...' : 'Create Role'}
        </Button>
      </div>
    </div>
  );
};
