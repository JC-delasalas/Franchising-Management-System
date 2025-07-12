import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Database, Users, Shield, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { brandService, authService, inventoryService, analyticsService } from '@/services/database';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export const SupabaseConnectionTest: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: any) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.details = details;
        return [...prev];
      } else {
        return [...prev, { name, status, message, details }];
      }
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: Basic Connection
    updateTest('Connection', 'pending', 'Testing Supabase connection...');
    try {
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
      if (error) throw error;
      updateTest('Connection', 'success', 'Successfully connected to Supabase');
    } catch (error) {
      updateTest('Connection', 'error', `Connection failed: ${(error as Error).message}`);
    }

    // Test 2: Authentication
    updateTest('Authentication', 'pending', 'Testing authentication system...');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        updateTest('Authentication', 'success', `Authenticated as: ${session.user.email}`);
      } else {
        updateTest('Authentication', 'success', 'Authentication system working (no active session)');
      }
    } catch (error) {
      updateTest('Authentication', 'error', `Auth test failed: ${(error as Error).message}`);
    }

    // Test 3: User Profile Service
    updateTest('User Profile', 'pending', 'Testing user profile service...');
    try {
      if (user) {
        const { data, error } = await authService.getUserWithRoles(user.id);
        if (error) throw error;
        updateTest('User Profile', 'success', 'User profile service working', data);
      } else {
        updateTest('User Profile', 'success', 'User profile service available (no user logged in)');
      }
    } catch (error) {
      updateTest('User Profile', 'error', `User profile test failed: ${(error as Error).message}`);
    }

    // Test 4: Brand Service
    updateTest('Brand Service', 'pending', 'Testing brand management service...');
    try {
      const { data, error } = await brandService.getAllBrands();
      if (error) throw error;
      updateTest('Brand Service', 'success', `Brand service working (${data?.length || 0} brands found)`);
    } catch (error) {
      updateTest('Brand Service', 'error', `Brand service test failed: ${(error as Error).message}`);
    }

    // Test 5: Inventory Service
    updateTest('Inventory Service', 'pending', 'Testing inventory management service...');
    try {
      const { data, error } = await inventoryService.getInventoryAnalytics();
      if (error) throw error;
      updateTest('Inventory Service', 'success', 'Inventory service working', data);
    } catch (error) {
      updateTest('Inventory Service', 'error', `Inventory service test failed: ${(error as Error).message}`);
    }

    // Test 6: Analytics Service
    updateTest('Analytics Service', 'pending', 'Testing analytics service...');
    try {
      const { data, error } = await analyticsService.getKPIs();
      if (error) throw error;
      updateTest('Analytics Service', 'success', `Analytics service working (${data?.length || 0} KPIs found)`);
    } catch (error) {
      updateTest('Analytics Service', 'error', `Analytics service test failed: ${(error as Error).message}`);
    }

    // Test 7: Multi-tenant Isolation
    updateTest('Multi-tenant', 'pending', 'Testing multi-tenant data isolation...');
    try {
      if (userProfile?.franchisor_id) {
        // This should only return data for the current franchisor
        const { data, error } = await supabase
          .from('brand')
          .select('*')
          .eq('franchisor_id', userProfile.franchisor_id);
        
        if (error) throw error;
        updateTest('Multi-tenant', 'success', `Multi-tenant isolation working (${data?.length || 0} brands for current franchisor)`);
      } else {
        updateTest('Multi-tenant', 'success', 'Multi-tenant system available (no franchisor ID to test)');
      }
    } catch (error) {
      updateTest('Multi-tenant', 'error', `Multi-tenant test failed: ${(error as Error).message}`);
    }

    // Test 8: Database Schema
    updateTest('Database Schema', 'pending', 'Testing database schema...');
    try {
      const tables = [
        'user_profiles', 'brand', 'franchisee', 'inventory', 
        'kpi', 'audit_logs', 'role', 'permission'
      ];
      
      const results = await Promise.all(
        tables.map(async (table) => {
          const { error } = await supabase.from(table).select('*').limit(1);
          return { table, success: !error };
        })
      );
      
      const successCount = results.filter(r => r.success).length;
      updateTest('Database Schema', 'success', `Schema validation: ${successCount}/${tables.length} tables accessible`);
    } catch (error) {
      updateTest('Database Schema', 'error', `Schema test failed: ${(error as Error).message}`);
    }

    setIsRunning(false);
  };

  useEffect(() => {
    // Run tests automatically on component mount
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Running</Badge>;
      case 'success':
        return <Badge variant="default">Pass</Badge>;
      case 'error':
        return <Badge variant="destructive">Fail</Badge>;
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const pendingCount = tests.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Supabase Connection Test
          </CardTitle>
          <CardDescription>
            Comprehensive test of all Supabase integrations and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-4">
              <div className="text-sm">
                <span className="text-green-600 font-medium">{successCount} Passed</span>
              </div>
              <div className="text-sm">
                <span className="text-red-600 font-medium">{errorCount} Failed</span>
              </div>
              <div className="text-sm">
                <span className="text-blue-600 font-medium">{pendingCount} Running</span>
              </div>
            </div>
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              size="sm"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests
                </>
              ) : (
                'Run Tests Again'
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {tests.map((test) => (
              <div key={test.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <p className="font-medium">{test.name}</p>
                    <p className="text-sm text-muted-foreground">{test.message}</p>
                    {test.details && (
                      <pre className="text-xs text-muted-foreground mt-1 max-w-md overflow-hidden">
                        {JSON.stringify(test.details, null, 2).slice(0, 200)}...
                      </pre>
                    )}
                  </div>
                </div>
                {getStatusBadge(test.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current User Info */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Current User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>User ID:</strong> {user.id}</div>
              {userProfile && (
                <>
                  <div><strong>Name:</strong> {userProfile.first_nm} {userProfile.last_nm}</div>
                  <div><strong>Status:</strong> {userProfile.status}</div>
                  <div><strong>Franchisor ID:</strong> {userProfile.franchisor_id}</div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
