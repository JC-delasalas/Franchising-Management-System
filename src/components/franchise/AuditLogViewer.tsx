import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  User,
  Activity,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';
import { AuditService } from '@/services/franchise';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  log_id: number;
  user_id?: string;
  entity_type: string;
  entity_id?: string;
  action_type: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp: string;
  user?: {
    first_nm: string;
    last_nm: string;
    email: string;
  };
}

interface AuditLogViewerProps {
  franchisorId: string;
}

export function AuditLogViewer({ franchisorId }: AuditLogViewerProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const { toast } = useToast();

  const logsPerPage = 20;

  useEffect(() => {
    loadAuditLogs();
  }, [franchisorId, currentPage, entityTypeFilter, actionTypeFilter, dateFilter]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      
      const filter = {
        entity_type: entityTypeFilter || undefined,
        action_type: actionTypeFilter || undefined,
        date_from: dateFilter || undefined,
        limit: logsPerPage,
        offset: (currentPage - 1) * logsPerPage
      };

      const result = await AuditService.getAuditLogs(filter);
      
      if (result.success) {
        setAuditLogs(result.data || []);
        setTotalLogs(result.data?.length || 0);
      } else {
        toast({
          title: "Error loading audit logs",
          description: result.error?.message || "Failed to load audit logs",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadAuditLogs();
      return;
    }

    try {
      setLoading(true);
      
      const filter = {
        entity_type: entityTypeFilter || undefined,
        action_type: actionTypeFilter || undefined,
        date_from: dateFilter || undefined,
        limit: logsPerPage
      };

      const result = await AuditService.searchAuditLogs(searchTerm, filter);
      
      if (result.success) {
        setAuditLogs(result.data || []);
        setCurrentPage(1);
      } else {
        toast({
          title: "Search failed",
          description: result.error?.message || "Failed to search audit logs",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const filter = {
        entity_type: entityTypeFilter || undefined,
        action_type: actionTypeFilter || undefined,
        date_from: dateFilter || undefined,
        date_to: new Date().toISOString().split('T')[0]
      };

      const result = await AuditService.exportAuditLogs(filter);
      
      if (result.success) {
        toast({
          title: "Export successful",
          description: `Exported ${result.data?.total_records || 0} audit logs`
        });
      } else {
        toast({
          title: "Export failed",
          description: result.error?.message || "Failed to export audit logs",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'destructive',
      warning: 'secondary',
      info: 'outline',
      default: 'default'
    } as const;

    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'default'}>
        {severity || 'info'}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEntityTypeColor = (entityType: string) => {
    const colors = {
      authentication: 'bg-blue-100 text-blue-800',
      brand: 'bg-purple-100 text-purple-800',
      product: 'bg-green-100 text-green-800',
      user: 'bg-orange-100 text-orange-800',
      system: 'bg-gray-100 text-gray-800',
      security: 'bg-red-100 text-red-800'
    } as const;

    return colors[entityType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading && auditLogs.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Audit Log Viewer
          </h2>
          <p className="text-muted-foreground">Monitor system activities and security events</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button size="sm" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Entity Type</label>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All entities</SelectItem>
                  <SelectItem value="authentication">Authentication</SelectItem>
                  <SelectItem value="brand">Brand</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Action Type</label>
              <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Date From</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Audit Logs
          </CardTitle>
          <CardDescription>
            Showing {auditLogs.length} logs {totalLogs > logsPerPage && `(Page ${currentPage})`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.log_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatTimestamp(log.timestamp)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.user ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">
                                {log.user.first_nm} {log.user.last_nm}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {log.user.email}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getEntityTypeColor(log.entity_type)}`}>
                          {log.entity_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-sm">{log.action_type}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(log.metadata?.severity || 'info')}
                          {getSeverityBadge(log.metadata?.severity || 'info')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {log.details && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                View details
                              </summary>
                              <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalLogs > logsPerPage && (
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={auditLogs.length < logsPerPage}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No audit logs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || entityTypeFilter || actionTypeFilter || dateFilter
                  ? 'No logs match your current filters'
                  : 'Audit logs will appear here as system activities occur'
                }
              </p>
              {(searchTerm || entityTypeFilter || actionTypeFilter || dateFilter) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setEntityTypeFilter('');
                    setActionTypeFilter('');
                    setDateFilter('');
                    loadAuditLogs();
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
