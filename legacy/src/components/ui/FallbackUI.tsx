
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface FallbackUIProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
}

const FallbackUI: React.FC<FallbackUIProps> = ({
  error,
  resetError,
  title = "Something went wrong",
  description = "We're sorry, but something unexpected happened. Please try again.",
  showDetails = false
}) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{description}</p>
          
          {showDetails && error && process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-gray-100 p-4 rounded-lg text-sm">
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                Error Details (Development Only)
              </summary>
              <div className="space-y-2">
                <div>
                  <strong>Error:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs mt-1 bg-white p-2 rounded border overflow-auto max-h-32">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {resetError && (
              <Button onClick={resetError} className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </Button>
            )}
            <Button onClick={handleReload} variant={resetError ? "outline" : "default"} className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Page</span>
            </Button>
            <Button variant="outline" onClick={handleGoHome} className="flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FallbackUI;
