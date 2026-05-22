import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth, signIn } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, XCircle, User } from 'lucide-react';

const AuthTest: React.FC = () => {
  const { toast } = useToast();
  const { user, session, isAuthenticated, isLoading, role } = useAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runAuthTest = async () => {
    setIsRunning(true);
    setTestResults(null);

    const results = {
      timestamp: new Date().toISOString(),
      supabaseConfig: null as any,
      authState: null as any,
      sessionTest: null as any,
      loginTest: null as any,
      errors: [] as string[]
    };

    try {
      // 1. Test Supabase Configuration
      console.log('🔐 Testing Supabase configuration...');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      results.supabaseConfig = {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        urlValid: supabaseUrl?.startsWith('https://'),
        keyValid: supabaseKey?.length > 50
      };

      if (!supabaseUrl || !supabaseKey) {
        results.errors.push('Missing Supabase environment variables');
      }

      // 2. Test Current Auth State
      console.log('🔐 Testing current auth state...');
      results.authState = {
        isAuthenticated,
        isLoading,
        hasUser: !!user,
        hasSession: !!session,
        role: role || 'none',
        userId: user?.id || 'none'
      };

      // 3. Test Session Retrieval
      console.log('🔐 Testing session retrieval...');
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        results.sessionTest = {
          success: !sessionError,
          hasSession: !!sessionData.session,
          error: sessionError?.message
        };
        
        if (sessionError) {
          results.errors.push(`Session error: ${sessionError.message}`);
        }
      } catch (error: any) {
        results.sessionTest = {
          success: false,
          error: error.message
        };
        results.errors.push(`Session test failed: ${error.message}`);
      }

      // 4. Test Demo Login (if not authenticated)
      if (!isAuthenticated) {
        console.log('🔐 Testing demo login...');
        try {
          const loginResult = await signIn('franchisee@demo.com', 'demo123');
          results.loginTest = {
            success: !!loginResult.user,
            hasUser: !!loginResult.user,
            hasSession: !!loginResult.session,
            error: null
          };
          
          if (loginResult.user) {
            toast({
              title: "Login Test Successful",
              description: "Demo login worked correctly",
              duration: 3000,
            });
          }
        } catch (error: any) {
          results.loginTest = {
            success: false,
            error: error.message
          };
          results.errors.push(`Login test failed: ${error.message}`);
        }
      } else {
        results.loginTest = {
          success: true,
          note: 'Already authenticated, skipping login test'
        };
      }

      setTestResults(results);
      
      toast({
        title: "Auth Test Complete",
        description: `Found ${results.errors.length} issues`,
        duration: 5000,
      });

    } catch (error: any) {
      console.error('Auth test failed:', error);
      results.errors.push(`Test failed: ${error.message}`);
      setTestResults(results);
      
      toast({
        title: "Auth Test Failed",
        description: "Check console for details",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const testLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout Successful",
        description: "User signed out",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-6 h-6" />
            Authentication System Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Test the authentication system to identify any issues with login functionality.
            </p>
            
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={runAuthTest} 
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {isRunning ? 'Testing...' : 'Run Auth Test'}
              </Button>
              
              {isAuthenticated && (
                <Button 
                  onClick={testLogout} 
                  variant="outline"
                >
                  Test Logout
                </Button>
              )}
            </div>

            {/* Current Auth State */}
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                <strong>Current State:</strong> {isAuthenticated ? 'Authenticated' : 'Not Authenticated'} 
                {isLoading && ' (Loading...)'}
                {user && ` | Role: ${role} | User: ${user.email}`}
              </AlertDescription>
            </Alert>

            {/* Test Results */}
            {testResults && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results</h3>
                
                {/* Supabase Config */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {getStatusIcon(testResults.supabaseConfig?.hasUrl && testResults.supabaseConfig?.hasKey)}
                      Supabase Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>Has URL: {testResults.supabaseConfig?.hasUrl ? '✅' : '❌'}</div>
                      <div>Has Key: {testResults.supabaseConfig?.hasKey ? '✅' : '❌'}</div>
                      <div>URL Valid: {testResults.supabaseConfig?.urlValid ? '✅' : '❌'}</div>
                      <div>Key Valid: {testResults.supabaseConfig?.keyValid ? '✅' : '❌'}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Auth State */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {getStatusIcon(testResults.authState?.isAuthenticated)}
                      Authentication State
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>Authenticated: {testResults.authState?.isAuthenticated ? '✅' : '❌'}</div>
                      <div>Loading: {testResults.authState?.isLoading ? '⏳' : '✅'}</div>
                      <div>Has User: {testResults.authState?.hasUser ? '✅' : '❌'}</div>
                      <div>Has Session: {testResults.authState?.hasSession ? '✅' : '❌'}</div>
                      <div>Role: {testResults.authState?.role}</div>
                      <div>User ID: {testResults.authState?.userId}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Session Test */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {getStatusIcon(testResults.sessionTest?.success)}
                      Session Test
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div>Success: {testResults.sessionTest?.success ? '✅' : '❌'}</div>
                    <div>Has Session: {testResults.sessionTest?.hasSession ? '✅' : '❌'}</div>
                    {testResults.sessionTest?.error && (
                      <div className="text-red-600">Error: {testResults.sessionTest.error}</div>
                    )}
                  </CardContent>
                </Card>

                {/* Login Test */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {getStatusIcon(testResults.loginTest?.success)}
                      Login Test
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div>Success: {testResults.loginTest?.success ? '✅' : '❌'}</div>
                    {testResults.loginTest?.note && (
                      <div className="text-blue-600">Note: {testResults.loginTest.note}</div>
                    )}
                    {testResults.loginTest?.error && (
                      <div className="text-red-600">Error: {testResults.loginTest.error}</div>
                    )}
                  </CardContent>
                </Card>

                {/* Errors */}
                {testResults.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Issues Found:</strong>
                      <ul className="list-disc list-inside mt-2">
                        {testResults.errors.map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthTest;
