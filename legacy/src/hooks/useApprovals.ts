import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApprovalAPI, ApprovalDecision } from '@/api/approvals';

export const useApprovalDashboard = (filters: {
  assignee_id?: string;
  status?: string;
  priority?: number;
  franchise_id?: string;
} = {}) => {
  return useQuery({
    queryKey: ['approval-dashboard', filters],
    queryFn: () => ApprovalAPI.getApprovalDashboard(filters),
    staleTime: 30000,
  });
};

export const useWorkflow = (workflowId: string) => {
  return useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => ApprovalAPI.getWorkflow(workflowId),
    enabled: !!workflowId,
    staleTime: 30000,
  });
};

export const useApplicationWorkflows = (applicationId: string) => {
  return useQuery({
    queryKey: ['application-workflows', applicationId],
    queryFn: () => ApprovalAPI.getApplicationWorkflows(applicationId),
    enabled: !!applicationId,
    staleTime: 30000,
  });
};

export const useWorkflowConditions = (workflowId: string) => {
  return useQuery({
    queryKey: ['workflow-conditions', workflowId],
    queryFn: () => ApprovalAPI.getWorkflowConditions(workflowId),
    enabled: !!workflowId,
    staleTime: 30000,
  });
};

export const useWorkflowHistory = (workflowId: string) => {
  return useQuery({
    queryKey: ['workflow-history', workflowId],
    queryFn: () => ApprovalAPI.getWorkflowHistory(workflowId),
    enabled: !!workflowId,
    staleTime: 60000,
  });
};

export const useUserNotifications = (userId: string, unreadOnly = false) => {
  return useQuery({
    queryKey: ['user-notifications', userId, unreadOnly],
    queryFn: () => ApprovalAPI.getUserNotifications(userId, unreadOnly),
    enabled: !!userId,
    staleTime: 30000,
  });
};

export const useApprovalStats = (filters: {
  date_from?: string;
  date_to?: string;
  franchise_id?: string;
  approver_id?: string;
} = {}) => {
  return useQuery({
    queryKey: ['approval-stats', filters],
    queryFn: () => ApprovalAPI.getApprovalStats(filters),
    staleTime: 60000,
  });
};

export const useProcessApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (decision: ApprovalDecision) => ApprovalAPI.processApproval(decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['application-workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow'] });
    },
  });
};

export const useAssignWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, assigneeId }: { workflowId: string; assigneeId: string }) =>
      ApprovalAPI.assignWorkflow(workflowId, assigneeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['workflow'] });
    },
  });
};

export const useAddCondition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, condition }: { workflowId: string; condition: any }) =>
      ApprovalAPI.addCondition(workflowId, condition),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-conditions', variables.workflowId] });
      queryClient.invalidateQueries({ queryKey: ['approval-dashboard'] });
    },
  });
};

export const useUpdateCondition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conditionId, updates }: { conditionId: string; updates: any }) =>
      ApprovalAPI.updateCondition(conditionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-conditions'] });
      queryClient.invalidateQueries({ queryKey: ['approval-dashboard'] });
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, comment }: { workflowId: string; comment: string }) =>
      ApprovalAPI.addComment(workflowId, comment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-history', variables.workflowId] });
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => ApprovalAPI.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
  });
};

export const useEscalateWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, reason, escalateTo }: { 
      workflowId: string; 
      reason: string; 
      escalateTo?: string 
    }) => ApprovalAPI.escalateWorkflow(workflowId, reason, escalateTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['workflow'] });
    },
  });
};
