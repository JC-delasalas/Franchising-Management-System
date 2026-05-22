export { FranchiseAPI } from './franchises';
export { AnalyticsAPI } from './analytics';
export { OrderAPI, OrdersAPI } from './orders';
export { InventoryAPI } from './inventory';
export { FileAPI } from './files';
export { ApprovalAPI } from './approvals';

// Re-export types for convenience
export type {
  FileStorageRecord,
  FileVersion,
  FilePermission,
  StorageBucket,
  FileUploadOptions,
  FileSearchFilters
} from './files';

export type {
  ApprovalWorkflow,
  ApprovalCondition,
  ApprovalHistory,
  ApprovalNotification,
  ApprovalDashboardItem,
  ApprovalDecision
} from './approvals';
