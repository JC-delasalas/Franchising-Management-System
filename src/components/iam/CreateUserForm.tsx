
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { IAMRole, CreateUserData } from '@/services/iam/iamTypes';

interface CreateUserFormProps {
  roles: IAMRole[];
  onSubmit: (userData: CreateUserData) => Promise<boolean>;
  onCancel: () => void;
  isLoading: boolean;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({
  roles,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    firstName: '',
    lastName: '',
    roleIds: []
  });

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId]
    }));
  };

  const handleSubmit = async () => {
    const success = await onSubmit(formData);
    if (success) {
      setFormData({ email: '', firstName: '', lastName: '', roleIds: [] });
      onCancel();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            placeholder="Enter first name"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            placeholder="Enter last name"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Enter email address"
        />
      </div>
      <div>
        <Label>Roles</Label>
        <div className="space-y-2 mt-2">
          {roles.map(role => (
            <div key={role.id} className="flex items-center space-x-2">
              <Checkbox
                id={`role-${role.id}`}
                checked={formData.roleIds.includes(role.id)}
                onCheckedChange={() => handleRoleToggle(role.id)}
              />
              <Label htmlFor={`role-${role.id}`} className="flex-1">
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
          {isLoading ? 'Creating...' : 'Create User'}
        </Button>
      </div>
    </div>
  );
};
