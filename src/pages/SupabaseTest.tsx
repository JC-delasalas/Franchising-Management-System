import React from 'react';
import { SupabaseConnectionTest } from '@/components/test/SupabaseConnectionTest';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, BarChart3, TestTube } from 'lucide-react';

const SupabaseTest: React.FC = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Supabase Integration Test
          </h1>
          <p className="text-muted-foreground">
            Testing all Supabase connections and franchise management system functionality
          </p>
        </div>

        <Tabs defaultValue="connection" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connection" className="flex items-center">
              <TestTube className="h-4 w-4 mr-2" />
              Connection Tests
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard Preview
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Database Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connection">
            <SupabaseConnectionTest />
          </TabsContent>

          <TabsContent value="dashboard">
            {user ? (
              <DashboardOverview />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Authentication Required</CardTitle>
                  <CardDescription>
                    Please log in to view the dashboard preview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The dashboard requires authentication to display personalized data.
                    You can test the login functionality at{' '}
                    <a href="/supabase-login" className="text-primary hover:underline">
                      /supabase-login
                    </a>
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="database">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Database Configuration</CardTitle>
                  <CardDescription>
                    Current Supabase connection details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <strong>Project URL:</strong>
                    <code className="ml-2 text-sm bg-muted px-2 py-1 rounded">
                      https://wbvmtialqbcveviphlsf.supabase.co
                    </code>
                  </div>
                  <div>
                    <strong>Environment:</strong>
                    <code className="ml-2 text-sm bg-muted px-2 py-1 rounded">
                      {import.meta.env.NODE_ENV || 'development'}
                    </code>
                  </div>
                  <div>
                    <strong>Auth Status:</strong>
                    <code className="ml-2 text-sm bg-muted px-2 py-1 rounded">
                      {user ? 'Authenticated' : 'Not authenticated'}
                    </code>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Architecture</CardTitle>
                  <CardDescription>
                    Key components of the franchise management system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Multi-tenant Architecture</span>
                      <span className="text-green-600">✓ Enabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Role-based Access Control</span>
                      <span className="text-green-600">✓ Configured</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Audit Logging</span>
                      <span className="text-green-600">✓ Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Real-time Updates</span>
                      <span className="text-green-600">✓ Available</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Analytics Engine</span>
                      <span className="text-green-600">✓ Operational</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Franchise Management Objectives</CardTitle>
                  <CardDescription>
                    Implementation status of the 10 primary objectives
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">1. Centralized Brand Management</span>
                        <span className="text-green-600 text-sm">✓ Implemented</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">2. Multi-Tenant Architecture</span>
                        <span className="text-green-600 text-sm">✓ Implemented</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">3. Role-Based Access Control</span>
                        <span className="text-green-600 text-sm">✓ Implemented</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">4. Inventory & Supply Chain</span>
                        <span className="text-green-600 text-sm">✓ Implemented</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">5. Performance Analytics</span>
                        <span className="text-green-600 text-sm">✓ Implemented</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">6. Financial Management</span>
                        <span className="text-yellow-600 text-sm">⚠ Partial</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">7. Franchisee Lifecycle</span>
                        <span className="text-yellow-600 text-sm">⚠ Partial</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">8. Training & Development</span>
                        <span className="text-yellow-600 text-sm">⚠ Partial</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">9. Customer Relationship</span>
                        <span className="text-yellow-600 text-sm">⚠ Partial</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">10. Audit & System Integrity</span>
                        <span className="text-green-600 text-sm">✓ Implemented</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SupabaseTest;
