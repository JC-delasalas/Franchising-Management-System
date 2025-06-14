
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug,
  Wifi,
  Shield,
  Database
} from 'lucide-react';

interface ErrorDisplayProps {
  error: Error | string;
  onRetry?: () => void;
  onGoHome?: () => void;
  context?: string;
  showDetails?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onGoHome,
  context = 'application',
  showDetails = false
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const isNetworkError = errorMessage.toLowerCase().includes('network') || 
                         errorMessage.toLowerCase().includes('fetch') ||
                         errorMessage.toLowerCase().includes('connection');
  const isAuthError = errorMessage.toLowerCase().includes('unauthorized') ||
                      errorMessage.toLowerCase().includes('forbidden') ||
                      errorMessage.toLowerCase().includes('authentication');
  const isServerError = errorMessage.toLowerCase().includes('server') ||
                        errorMessage.toLowerCase().includes('500') ||
                        errorMessage.toLowerCase().includes('503');

  const getErrorIcon = () => {
    if (isNetworkError) return Wifi;
    if (isAuthError) return Shield;
    if (isServerError) return Database;
    return Bug;
  };

  const getErrorTitle = () => {
    if (isNetworkError) return 'Connection Error';
    if (isAuthError) return 'Access Denied';
    if (isServerError) return 'Server Error';
    return 'Something went wrong';
  };

  const getErrorDescription = () => {
    if (isNetworkError) {
      return 'Please check your internet connection and try again.';
    }
    if (isAuthError) {
      return 'You don\'t have permission to access this resource. Please contact your administrator.';
    }
    if (isServerError) {
      return 'Our servers are experiencing issues. Please try again in a few moments.';
    }
    return `An error occurred in the ${context}. Please try again or contact support if the problem persists.`;
  };

  const ErrorIcon = getErrorIcon();

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ErrorIcon className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">{getErrorTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {getErrorDescription()}
            </AlertDescription>
          </Alert>

          {showDetails && (
            <div className="text-left text-xs bg-gray-100 p-3 rounded font-mono overflow-auto max-h-32">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-2 justify-center">
            {onRetry && (
              <Button onClick={onRetry} className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </Button>
            )}
            {onGoHome && (
              <Button variant="outline" onClick={onGoHome} className="flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
