
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

interface SessionTimeoutWarningProps {
  timeRemaining: string;
  onRefreshSession: () => void;
  onLogout: () => void;
  show: boolean;
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  timeRemaining,
  onRefreshSession,
  onLogout,
  show
}) => {
  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert variant="destructive" className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">Session Expiring Soon</AlertTitle>
        <AlertDescription className="text-orange-700 mt-2">
          Your session will expire in <strong>{timeRemaining}</strong>.
          <div className="flex space-x-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={onRefreshSession}
              className="bg-white hover:bg-orange-50 border-orange-300"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Extend Session
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onLogout}
              className="bg-white hover:bg-red-50 border-red-300 text-red-600"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
