export { default as ApprovalWorkflow } from './ApprovalWorkflow';

// Re-export types for convenience
export type { 
  ApprovalWorkflow as ApprovalWorkflowType,
  ApprovalCondition,
  ApprovalHistory,
  ApprovalNotification,
  ApprovalDashboardItem,
  ApprovalDecision
} from '@/api/approvals';
