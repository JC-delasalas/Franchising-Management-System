
import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

interface DemoAccountButtonsProps {
  onDemoLogin: (username: string, password: string) => void;
}

export const DemoAccountButtons: React.FC<DemoAccountButtonsProps> = ({ onDemoLogin }) => {
  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-sm font-medium text-blue-900 mb-3">Demo Accounts</h3>
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs"
          onClick={() => onDemoLogin('franchisor@demo.com', 'demo123')}
        >
          <User className="w-3 h-3 mr-2" />
          Franchisor Demo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs"
          onClick={() => onDemoLogin('franchisee@demo.com', 'demo123')}
        >
          <User className="w-3 h-3 mr-2" />
          Franchisee Demo
        </Button>
      </div>
      <p className="text-xs text-blue-700 mt-2">
        Click to auto-fill demo credentials, then click Login
      </p>
    </div>
  );
};
