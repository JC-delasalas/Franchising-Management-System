// Database Services Export
export { BaseService } from './base.service';
export { BrandService } from './brand.service';
export { AuthService } from './auth.service';
export { InventoryService } from './inventory.service';
export { AnalyticsService } from './analytics.service';
export { AuditService } from './audit.service';
export { FinancialService } from './financial.service';
export { FranchiseeService } from './franchisee.service';
export { TrainingService } from './training.service';
export { CRMService } from './crm.service';
export { ProductService } from './product.service';
export { FlexibleDataService, flexibleDataService } from './flexible-data.service';

// Service instances for easy import
export const brandService = new BrandService();
export const authService = new AuthService();
export const inventoryService = new InventoryService();
export const analyticsService = new AnalyticsService();
export const auditService = new AuditService();
export const financialService = new FinancialService();
export const franchiseeService = new FranchiseeService();
export const trainingService = new TrainingService();
export const crmService = new CRMService();
export const productService = new ProductService();
// flexibleDataService is already exported as singleton from its module

// Types
export type { Tables, TableName } from './base.service';
