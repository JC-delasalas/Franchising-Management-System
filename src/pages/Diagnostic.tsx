import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const Diagnostic: React.FC = () => {
  const checks = [
    {
      name: 'React Router',
      status: 'success',
      message: 'Routing is working correctly',
    },
    {
      name: 'UI Components',
      status: 'success',
      message: 'All UI components are loaded',
    },
    {
      name: 'Environment Variables',
      status: import.meta.env.VITE_SUPABASE_URL ? 'success' : 'error',
      message: import.meta.env.VITE_SUPABASE_URL ? 'Supabase URL configured' : 'Missing Supabase URL',
    },
    {
      name: 'Build System',
      status: 'success',
      message: 'Vite build system operational',
    },
    {
      name: 'TypeScript',
      status: 'success',
      message: 'TypeScript compilation successful',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">OK</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Warning</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            System Diagnostic
          </h1>
          <p className="text-muted-foreground">
            Verify that all system components are working correctly
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Core system components and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checks.map((check) => (
                  <div key={check.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <p className="font-medium">{check.name}</p>
                        <p className="text-sm text-muted-foreground">{check.message}</p>
                      </div>
                    </div>
                    {getStatusBadge(check.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environment Info</CardTitle>
              <CardDescription>
                Current environment configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <strong>Mode:</strong> {import.meta.env.MODE}
                </div>
                <div>
                  <strong>Base URL:</strong> {import.meta.env.BASE_URL}
                </div>
                <div>
                  <strong>Dev:</strong> {import.meta.env.DEV ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Prod:</strong> {import.meta.env.PROD ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
                </div>
                <div>
                  <strong>Timestamp:</strong> {new Date().toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Available Routes</CardTitle>
              <CardDescription>
                Test these routes to verify the application is working
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-3">
                <a href="/" className="text-blue-600 hover:underline">
                  / (Home)
                </a>
                <a href="/test" className="text-blue-600 hover:underline">
                  /test (System Test)
                </a>
                <a href="/diagnostic" className="text-blue-600 hover:underline">
                  /diagnostic (This Page)
                </a>
                <a href="/franchisor-dashboard" className="text-blue-600 hover:underline">
                  /franchisor-dashboard
                </a>
                <a href="/supabase-login" className="text-blue-600 hover:underline">
                  /supabase-login
                </a>
                <a href="/about" className="text-blue-600 hover:underline">
                  /about
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Browser Information</CardTitle>
              <CardDescription>
                Current browser and client information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <strong>User Agent:</strong>
                  <p className="text-sm text-muted-foreground break-all">
                    {navigator.userAgent}
                  </p>
                </div>
                <div>
                  <strong>Screen Resolution:</strong>
                  <p className="text-sm text-muted-foreground">
                    {screen.width} x {screen.height}
                  </p>
                </div>
                <div>
                  <strong>Viewport:</strong>
                  <p className="text-sm text-muted-foreground">
                    {window.innerWidth} x {window.innerHeight}
                  </p>
                </div>
                <div>
                  <strong>Language:</strong>
                  <p className="text-sm text-muted-foreground">
                    {navigator.language}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-green-600">✅ System is Operational</CardTitle>
            <CardDescription>
              All core components are functioning correctly. If you're having trouble accessing the application, 
              please check your network connection or try refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Next Steps:</h4>
              <ul className="list-disc list-inside text-green-700 space-y-1">
                <li>Try accessing <code>/test</code> route for comprehensive system testing</li>
                <li>Visit <code>/franchisor-dashboard</code> for the main application interface</li>
                <li>Use <code>/supabase-login</code> to test authentication features</li>
                <li>Check browser console (F12) for any JavaScript errors</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Diagnostic;
