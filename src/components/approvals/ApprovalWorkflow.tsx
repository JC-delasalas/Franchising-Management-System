import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApprovalAPI, ApprovalDashboardItem, ApprovalDecision } from '@/api/approvals';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar,
  MessageSquare,
  ChevronRight,
  FileText
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ApprovalWorkflowProps {
  applicationId?: string;
  showDashboard?: boolean;
  onApplicationSelect?: (application: ApprovalDashboardItem) => void;
}

const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
  applicationId,
  showDashboard = true,
  onApplicationSelect
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedApplication, setSelectedApplication] = useState<ApprovalDashboardItem | null>(null);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'reject' | 'conditional'>('approve');
  const [comments, setComments] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Query for approval dashboard
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['approval-dashboard', filterStatus],
    queryFn: () => ApprovalAPI.getApprovalDashboard({
      status: filterStatus === 'all' ? undefined : filterStatus,
      assignee_id: user?.id
    }),
    enabled: showDashboard,
    staleTime: 30000,
  });

  // Query for specific application workflows
  const { data: workflowData, isLoading: workflowLoading } = useQuery({
    queryKey: ['application-workflows', applicationId],
    queryFn: () => applicationId ? ApprovalAPI.getApplicationWorkflows(applicationId) : null,
    enabled: !!applicationId,
    staleTime: 30000,
  });

  // Process approval mutation
  const processApprovalMutation = useMutation({
    mutationFn: (decision: ApprovalDecision) => ApprovalAPI.processApproval(decision),
    onSuccess: () => {
      toast({
        title: "Decision processed",
        description: "The approval decision has been successfully processed.",
      });
      queryClient.invalidateQueries({ queryKey: ['approval-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['application-workflows'] });
      setShowDecisionDialog(false);
      setComments('');
      setSelectedApplication(null);
    },
    onError: (error: any) => {
      toast({
        title: "Processing failed",
        description: error.message || "Failed to process approval decision.",
        variant: "destructive",
      });
    },
  });

  const handleDecisionSubmit = () => {
    if (!selectedApplication?.current_workflow_id) return;

    const decisionData: ApprovalDecision = {
      workflow_id: selectedApplication.current_workflow_id,
      decision,
      comments: comments.trim() || undefined,
    };

    processApprovalMutation.mutate(decisionData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'conditional': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'conditional': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimelineColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-600';
      case 'due_soon': return 'text-orange-600';
      default: return 'text-green-600';
    }
  };

  if (dashboardLoading || workflowLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showDashboard && (
        <>
          {/* Header and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Approval Workflow</h2>
              <p className="text-gray-600">Manage franchise application approvals</p>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="conditional">Conditional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData?.map((application) => (
              <Card 
                key={application.application_id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedApplication(application);
                  onApplicationSelect?.(application);
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{application.franchise_name}</CardTitle>
                      <p className="text-sm text-gray-600">{application.applicant_name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(application.current_status || 'pending')}>
                        {getStatusIcon(application.current_status || 'pending')}
                        <span className="ml-1">{application.current_status || 'pending'}</span>
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(application.priority)}>
                        Priority {application.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Tier {application.current_tier} of 3</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(application.current_tier / 3) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Conditions Progress */}
                    {application.total_conditions > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Conditions:</span>
                        <span className="font-medium">
                          {application.satisfied_conditions}/{application.total_conditions} 
                          ({application.conditions_completion_percentage}%)
                        </span>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{application.current_assignee_name || 'Unassigned'}</span>
                      </div>
                      {application.current_due_date && (
                        <div className={`flex items-center gap-1 ${getTimelineColor(application.timeline_status)}`}>
                          <Calendar className="h-4 w-4" />
                          <span>
                            Due {new Date(application.current_due_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {application.current_assignee_id === user?.id && application.current_status === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApplication(application);
                            setDecision('approve');
                            setShowDecisionDialog(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApplication(application);
                            setDecision('conditional');
                            setShowDecisionDialog(true);
                          }}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Conditional
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApplication(application);
                            setDecision('reject');
                            setShowDecisionDialog(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {dashboardData?.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600">
                {filterStatus === 'all' 
                  ? "There are no applications to review at this time."
                  : `No applications with status "${filterStatus}" found.`
                }
              </p>
            </div>
          )}
        </>
      )}

      {/* Workflow Details for Specific Application */}
      {applicationId && workflowData && (
        <Card>
          <CardHeader>
            <CardTitle>Approval Workflow Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflowData.map((workflow, index) => (
                <div key={workflow.id} className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      workflow.status === 'approved' ? 'bg-green-100 text-green-600' :
                      workflow.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      workflow.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {workflow.tier_level}
                    </div>
                    <div>
                      <p className="font-medium">Tier {workflow.tier_level}</p>
                      <p className="text-sm text-gray-600">
                        {workflow.status === 'pending' ? 'In Progress' : 
                         workflow.status === 'approved' ? 'Approved' :
                         workflow.status === 'rejected' ? 'Rejected' : workflow.status}
                      </p>
                    </div>
                  </div>
                  
                  {index < workflowData.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decision Dialog */}
      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decision === 'approve' ? 'Approve Application' :
               decision === 'reject' ? 'Reject Application' :
               'Conditional Approval'}
            </DialogTitle>
            <DialogDescription>
              {selectedApplication && (
                <>
                  Processing {selectedApplication.franchise_name} application by {selectedApplication.applicant_name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Comments</label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={
                  decision === 'approve' ? 'Add approval comments (optional)' :
                  decision === 'reject' ? 'Provide rejection reason' :
                  'Specify conditions for approval'
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDecisionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDecisionSubmit}
              disabled={processApprovalMutation.isPending || (decision === 'reject' && !comments.trim())}
              variant={decision === 'reject' ? 'destructive' : 'default'}
            >
              {processApprovalMutation.isPending ? <LoadingSpinner /> : 
               decision === 'approve' ? 'Approve' :
               decision === 'reject' ? 'Reject' :
               'Set Conditions'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalWorkflow;
