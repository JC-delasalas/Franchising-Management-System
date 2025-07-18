import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, Bug, Play, RotateCcw, Wrench } from 'lucide-react';
import { systemBugTracker, SystemBug } from '@/utils/systemBugTracker';
import { useAuth } from '@/hooks/useAuth';

const SystemBugTracker: React.FC = () => {
  const [bugs, setBugs] = useState<SystemBug[]>([]);
  const [isRunningDetection, setIsRunningDetection] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setBugs(systemBugTracker.getAllBugs());
  }, []);

  const runBugDetection = async () => {
    setIsRunningDetection(true);
    try {
      const detectedBugs = await systemBugTracker.runBugDetection();
      setBugs([...systemBugTracker.getAllBugs(), ...detectedBugs]);
    } catch (error) {
      console.error('Error running bug detection:', error);
    } finally {
      setIsRunningDetection(false);
    }
  };

  const getSeverityIcon = (severity: SystemBug['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Bug className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityBadge = (severity: SystemBug['severity']) => {
    const variants = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return (
      <Badge className={`${variants[severity]} border`}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: SystemBug['status']) => {
    const variants = {
      detected: 'bg-red-100 text-red-800',
      fixing: 'bg-yellow-100 text-yellow-800',
      testing: 'bg-blue-100 text-blue-800',
      fixed: 'bg-green-100 text-green-800',
      verified: 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryBadge = (category: SystemBug['category']) => {
    const variants = {
      order_lifecycle: 'bg-purple-100 text-purple-800',
      dashboard: 'bg-orange-100 text-orange-800',
      api: 'bg-blue-100 text-blue-800',
      auth: 'bg-red-100 text-red-800',
      ui: 'bg-green-100 text-green-800',
      performance: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={variants[category]}>
        {category.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const summary = systemBugTracker.getSummary();
  const criticalBugs = systemBugTracker.getCriticalBugs();

  const filteredBugs = selectedCategory === 'all' 
    ? bugs 
    : bugs.filter(bug => bug.category === selectedCategory);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="w-6 h-6 text-red-600" />
              System Bug Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-gray-600 mb-4">
                Please log in to access the system bug tracker.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="w-6 h-6 text-red-600" />
              System Bug Tracker & Fixer
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={runBugDetection} 
                disabled={isRunningDetection}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isRunningDetection ? 'Detecting...' : 'Run Bug Detection'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Critical Bugs Alert */}
          {criticalBugs.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">🚨 Critical Bugs Detected ({criticalBugs.length})</h3>
              <div className="space-y-1">
                {criticalBugs.map((bug, index) => (
                  <div key={index} className="text-sm text-red-700">
                    <strong>{bug.id}</strong> - {bug.title}: {bug.impact}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bug Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{summary.severity.critical}</div>
              <div className="text-sm text-red-800">Critical</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{summary.severity.high}</div>
              <div className="text-sm text-orange-800">High</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.severity.medium}</div>
              <div className="text-sm text-yellow-800">Medium</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{summary.status.fixed}</div>
              <div className="text-sm text-green-800">Fixed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bug Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Bug Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">All ({summary.total})</TabsTrigger>
              <TabsTrigger value="order_lifecycle">Orders ({summary.categories.order_lifecycle})</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard ({summary.categories.dashboard})</TabsTrigger>
              <TabsTrigger value="api">API ({summary.categories.api})</TabsTrigger>
              <TabsTrigger value="auth">Auth ({summary.categories.auth})</TabsTrigger>
              <TabsTrigger value="ui">UI ({summary.categories.ui})</TabsTrigger>
              <TabsTrigger value="performance">Perf ({summary.categories.performance})</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              <div className="space-y-4">
                {filteredBugs.map((bug) => (
                  <Card key={bug.id} className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getSeverityIcon(bug.severity)}
                          <div>
                            <h3 className="text-lg font-semibold">{bug.id}: {bug.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {getCategoryBadge(bug.category)}
                              {getSeverityBadge(bug.severity)}
                              {getStatusBadge(bug.status)}
                            </div>
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-1">Description:</h4>
                        <p className="text-sm text-gray-600">{bug.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-1">Location:</h4>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{bug.location}</code>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-1">Impact:</h4>
                        <p className="text-sm text-red-600">{bug.impact}</p>
                      </div>

                      {bug.solution && (
                        <div>
                          <h4 className="font-medium mb-1">Solution:</h4>
                          <p className="text-sm text-green-600">{bug.solution}</p>
                        </div>
                      )}

                      {bug.testSteps && (
                        <div>
                          <h4 className="font-medium mb-1">Test Steps:</h4>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {bug.testSteps.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-xs text-gray-500">
                          Detected: {new Date(bug.detectedAt).toLocaleString()}
                          {bug.fixedAt && (
                            <span className="ml-2">
                              Fixed: {new Date(bug.fixedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        {bug.status === 'detected' && (
                          <Button 
                            size="sm" 
                            onClick={() => {
                              systemBugTracker.updateBugStatus(bug.id, 'fixing');
                              setBugs([...systemBugTracker.getAllBugs()]);
                            }}
                            className="flex items-center gap-1"
                          >
                            <Wrench className="w-3 h-3" />
                            Start Fix
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* System Health Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 text-red-800">🚨 Critical Issues</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Order transaction rollback missing</li>
                <li>• Approval workflow race conditions</li>
                <li>• Inventory validation atomicity issues</li>
                <li>• API retry infinite loops</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-orange-800">⚠️ High Priority</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• KPI calculation inconsistencies</li>
                <li>• Session timeout handling</li>
                <li>• Error boundary coverage gaps</li>
                <li>• Dashboard data refresh issues</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemBugTracker;
