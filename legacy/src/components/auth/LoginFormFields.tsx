
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormFieldsProps {
  formData: {
    email: string;
    password: string;
  };
  showPassword: boolean;
  isLoading: boolean;
  onInputChange: (field: string, value: string) => void;
  onTogglePassword: () => void;
}

export const LoginFormFields: React.FC<LoginFormFieldsProps> = ({
  formData,
  showPassword,
  isLoading,
  onInputChange,
  onTogglePassword
}) => {
  return (
    <>
      <div>
        <Label htmlFor="email">Username or Email</Label>
        <Input
          id="email"
          type="text"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          placeholder="Enter username or email"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={onTogglePassword}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
};
