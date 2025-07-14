import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { testRegistration, testDatabaseConnection, testUsers } from '@/utils/testRegistration';
import { CheckCircle, XCircle, Play, User } from 'lucide-react';

const TestRegistration = () => {
  const { toast } = useToast();
  const { user, login } = useSimpleAuth();
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isTestingReg, setIsTestingReg] = useState(false);
  const [dbResult, setDbResult] = useState<any>(null);
  const [regResult, setRegResult] = useState<any>(null);

  const handleTestDatabase = async () => {
    setIsTestingDb(true);
    setDbResult(null);
    
    const result = await testDatabaseConnection();
    setDbResult(result);
    
    if (result.success) {
      toast({
        title: "Database Test Successful",
        description: "Connection to Supabase is working correctly.",
      });
    } else {
      toast({
        title: "Database Test Failed",
        description: result.error,
        variant: "destructive"
      });
    }
    
    setIsTestingDb(false);
  };

  const handleTestRegistration = async () => {
    setIsTestingReg(true);
    setRegResult(null);
    
    const testUser = testUsers[0]; // Use first test user
    const result = await testRegistration(testUser);
    setRegResult(result);
    
    if (result.success) {
      // Login the test user
      login(result.user);
      
      toast({
        title: "Registration Test Successful",
        description: `User ${testUser.firstName} ${testUser.lastName} registered successfully!`,
      });
    } else {
      toast({
        title: "Registration Test Failed",
        description: result.error,
        variant: "destructive"
      });
    }
    
    setIsTestingReg(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Registration System Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Current User Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Current User Status
              </h3>
              {user ? (
                <div className="text-sm space-y-1">
                  <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Account Type:</strong> {user.account_type}</p>
                  <p><strong>Status:</strong> {user.status}</p>
                  <p><strong>User ID:</strong> {user.user_id}</p>
                </div>
              ) : (
                <p className="text-gray-600">No user logged in</p>
              )}
            </div>

            {/* Database Connection Test */}
            <div className="space-y-4">
              <h3 className="font-semibold">1. Database Connection Test</h3>
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={handleTestDatabase}
                  disabled={isTestingDb}
                  className="flex items-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isTestingDb ? 'Testing...' : 'Test Database Connection'}
                </Button>
                
                {dbResult && (
                  <div className="flex items-center space-x-2">
                    {dbResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={dbResult.success ? 'text-green-600' : 'text-red-600'}>
                      {dbResult.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                )}
              </div>
              
              {dbResult && !dbResult.success && (
                <div className="bg-red-50 p-3 rounded text-sm text-red-700">
                  <strong>Error:</strong> {dbResult.error}
                </div>
              )}
            </div>

            {/* Registration Test */}
            <div className="space-y-4">
              <h3 className="font-semibold">2. Registration Flow Test</h3>
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={handleTestRegistration}
                  disabled={isTestingReg}
                  className="flex items-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isTestingReg ? 'Testing...' : 'Test Registration'}
                </Button>
                
                {regResult && (
                  <div className="flex items-center space-x-2">
                    {regResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={regResult.success ? 'text-green-600' : 'text-red-600'}>
                      {regResult.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                )}
              </div>
              
              {regResult && !regResult.success && (
                <div className="bg-red-50 p-3 rounded text-sm text-red-700">
                  <strong>Error:</strong> {regResult.error}
                </div>
              )}
              
              {regResult && regResult.success && (
                <div className="bg-green-50 p-3 rounded text-sm text-green-700">
                  <strong>Success:</strong> User registered and logged in automatically!
                </div>
              )}
            </div>

            {/* Test Data Preview */}
            <div className="space-y-4">
              <h3 className="font-semibold">3. Test Data</h3>
              <div className="bg-gray-50 p-4 rounded text-sm">
                <p><strong>Test User:</strong> {testUsers[0].firstName} {testUsers[0].lastName}</p>
                <p><strong>Email:</strong> {testUsers[0].email}</p>
                <p><strong>Account Type:</strong> {testUsers[0].accountType}</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="pt-4 border-t space-x-4">
              <Button variant="outline" onClick={() => window.location.href = '/register'}>
                Go to Registration Page
              </Button>
              {user && (
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = user.account_type === 'franchisor' ? '/franchisor-dashboard' : '/franchisee-dashboard'}
                >
                  Go to Dashboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestRegistration;
