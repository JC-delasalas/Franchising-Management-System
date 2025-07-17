import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, LogIn, Home } from 'lucide-react';
import { signOut } from '@/hooks/useAuth';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  isAuthError: boolean;
}

class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      isAuthError: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Determine if this is an authentication-related error
    const isAuthError = error.message.includes('auth') || 
                       error.message.includes('profile') ||
                       error.message.includes('permission') ||
                       error.message.includes('unauthorized') ||
                       error.message.includes('sign in') ||
                       error.message.includes('token');

    return { 
      hasError: true, 
      error,
      isAuthError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log authentication errors with additional context
    console.error('AuthErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      isAuthError: this.state.isAuthError
    });
    
    this.setState({
      error,
      errorInfo
    });

    // If it's an auth error, automatically sign out for security
    if (this.state.isAuthError) {
      signOut().catch(console.error);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force redirect even if sign out fails
      window.location.href = '/login';
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                {this.state.isAuthError ? 'Authentication Error' : 'Something went wrong'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {this.state.isAuthError ? (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    There was a problem with your authentication. For your security, you have been signed out.
                  </p>
                  <p className="text-sm text-gray-500">
                    Please sign in again to continue using the application.
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">
                  We're sorry, but something unexpected happened. Please try refreshing the page.
                </p>
              )}
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-gray-100 p-4 rounded-lg text-sm">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Type:</strong> {this.state.isAuthError ? 'Authentication Error' : 'Application Error'}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1 bg-white p-2 rounded border overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {this.state.isAuthError ? (
                  <>
                    <Button onClick={this.handleSignOut} className="flex items-center space-x-2">
                      <LogIn className="w-4 h-4" />
                      <span>Sign In Again</span>
                    </Button>
                    <Button variant="outline" onClick={this.handleGoHome} className="flex items-center space-x-2">
                      <Home className="w-4 h-4" />
                      <span>Go Home</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={this.handleRetry} className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4" />
                      <span>Try Again</span>
                    </Button>
                    <Button variant="outline" onClick={this.handleGoHome} className="flex items-center space-x-2">
                      <Home className="w-4 h-4" />
                      <span>Go Home</span>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;
