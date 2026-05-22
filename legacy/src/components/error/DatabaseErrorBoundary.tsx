import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ErrorPageLogo from './ErrorPageLogo';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class DatabaseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Database Error Boundary caught an error:', error, errorInfo);
    
    // Log specific database errors for monitoring
    if (error.message.includes('Could not find a relationship') ||
        error.message.includes('foreign key constraint') ||
        error.message.includes('403') ||
        error.message.includes('PGRST200')) {
      console.error('Critical database error detected:', {
        error: error.message,
        stack: error.stack,
        errorInfo,
        timestamp: new Date().toISOString()
      });
    }

    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Force a page refresh to reset all query states
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <DatabaseErrorFallback 
        error={this.state.error} 
        onRetry={this.handleRetry}
      />;
    }

    return this.props.children;
  }
}

interface FallbackProps {
  error: Error | null;
  onRetry: () => void;
}

const DatabaseErrorFallback: React.FC<FallbackProps> = ({ error, onRetry }) => {
  const navigate = useNavigate();

  const getErrorMessage = (error: Error | null) => {
    if (!error) return 'An unexpected error occurred';
    
    if (error.message.includes('Could not find a relationship')) {
      return 'Database schema error detected. Our team has been notified and is working on a fix.';
    }
    
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return 'Access denied. Please try logging out and logging back in.';
    }
    
    if (error.message.includes('foreign key constraint')) {
      return 'Data integrity error. Please refresh the page or contact support.';
    }
    
    return 'A database error occurred. Please try again or contact support if the problem persists.';
  };

  const getErrorType = (error: Error | null) => {
    if (!error) return 'Unknown Error';
    
    if (error.message.includes('Could not find a relationship') || error.message.includes('PGRST200')) {
      return 'Schema Error';
    }
    
    if (error.message.includes('403')) {
      return 'Permission Error';
    }
    
    if (error.message.includes('foreign key constraint')) {
      return 'Data Integrity Error';
    }
    
    return 'Database Error';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ErrorPageLogo size="sm" className="mb-4" />
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {getErrorType(error)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            {getErrorMessage(error)}
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4 p-3 bg-gray-100 rounded-md">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
                {error.message}
              </pre>
            </details>
          )}
          
          <div className="flex flex-col space-y-2">
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              If this problem persists, please contact{' '}
              <a 
                href="mailto:jcedrick.delasalas@gmail.com" 
                className="text-blue-600 hover:underline"
              >
                support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook for handling database errors in components
export const useDatabaseErrorHandler = () => {
  const handleError = React.useCallback((error: any) => {
    // Log the error for monitoring
    console.error('Database operation failed:', error);
    
    // Check if it's a critical database error
    if (error?.message?.includes('Could not find a relationship') ||
        error?.message?.includes('foreign key constraint') ||
        error?.code === 'PGRST200') {
      
      // Throw the error to be caught by the error boundary
      throw new Error(`Database Error: ${error.message || 'Unknown database error'}`);
    }
    
    // For other errors, just log them
    return error;
  }, []);
  
  return { handleError };
};

// Higher-order component for wrapping components with database error handling
export const withDatabaseErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <DatabaseErrorBoundary>
      <WrappedComponent {...props} ref={ref} />
    </DatabaseErrorBoundary>
  ));
};

export default DatabaseErrorBoundary;
