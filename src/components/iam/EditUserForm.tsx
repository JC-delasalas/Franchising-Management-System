
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IAMRole, IAMUser, UpdateUserData } from '@/services/iam/iamTypes';

interface EditUserFormProps {
  user: IAMUser;
  roles: IAMRole[];
  onSubmit: (userId: string, updateData: UpdateUserData) => Promise<boolean>;
  onCancel: () => void;
  isLoading: boolean;
}

export const EditUserForm: React.FC<EditUserFormProps> = ({
  user,
  roles,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState<UpdateUserData>({
    firstName: user.firstName,
    lastName: user.lastName,
    roleIds: user.roles.map(role => role.id),
    status: user.status
  });

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds?.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...(prev.roleIds || []), roleId]
    }));
  };

  const handleSubmit = async () => {
    const success = await onSubmit(user.id, formData);
    if (success) {
      onCancel();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="editFirstName">First Name</Label>
          <Input
            id="editFirstName"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="editLastName">Last Name</Label>
          <Input
            id="editLastName"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="editStatus">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Roles</Label>
        <div className="space-y-2 mt-2">
          {roles.map(role => (
            <div key={role.id} className="flex items-center space-x-2">
              <Checkbox
                id={`edit-role-${role.id}`}
                checked={formData.roleIds?.includes(role.id) || false}
                onCheckedChange={() => handleRoleToggle(role.id)}
              />
              <Label htmlFor={`edit-role-${role.id}`} className="flex-1">
                <div>
                  <span className="font-medium">{role.name}</span>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update User'}
        </Button>
      </div>
    </div>
  );
};
