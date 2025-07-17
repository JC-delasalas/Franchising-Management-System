/**
 * Route Test Runner
 * 
 * Tests all application routes to ensure they load properly
 */

export interface RouteTestResult {
  path: string;
  component: string;
  status: 'success' | 'error' | 'missing';
  message: string;
  loadTime?: number;
  requiresAuth: boolean;
  requiredRole?: string;
}

export class RouteTestRunner {
  private results: RouteTestResult[] = [];

  // Define all routes from App.tsx
  private routes = [
    // Public routes
    { path: '/', component: 'Index', requiresAuth: false },
    { path: '/test', component: 'Test', requiresAuth: false },
    { path: '/contact', component: 'Contact', requiresAuth: false },
    { path: '/blog', component: 'Blog', requiresAuth: false },
    { path: '/blog/:id', component: 'BlogPost', requiresAuth: false },
    { path: '/brand/:brandId', component: 'BrandMicrosite', requiresAuth: false },
    
    // Auth routes
    { path: '/auth/callback', component: 'AuthCallback', requiresAuth: false },
    { path: '/login', component: 'Login', requiresAuth: false },
    { path: '/signup', component: 'Signup', requiresAuth: false },
    { path: '/apply', component: 'Apply', requiresAuth: false },
    
    // Protected routes
    { path: '/franchisor-dashboard', component: 'FranchisorDashboard', requiresAuth: true, requiredRole: 'franchisor' },
    { path: '/franchisor-analytics', component: 'FranchisorAnalytics', requiresAuth: true, requiredRole: 'franchisor' },
    { path: '/franchisee-dashboard', component: 'FranchiseeDashboard', requiresAuth: true, requiredRole: 'franchisee' },
    { path: '/franchisee-analytics', component: 'FranchiseeAnalytics', requiresAuth: true, requiredRole: 'franchisee' },
    { path: '/franchisee-training', component: 'FranchiseeTraining', requiresAuth: true, requiredRole: 'franchisee' },
    
    // Franchisee sub-pages
    { path: '/franchisee/sales-upload', component: 'SalesUpload', requiresAuth: true, requiredRole: 'franchisee' },
    { path: '/franchisee/inventory-order', component: 'InventoryOrder', requiresAuth: true, requiredRole: 'franchisee' },
    { path: '/franchisee/marketing-assets', component: 'MarketingAssets', requiresAuth: true, requiredRole: 'franchisee' },
    { path: '/franchisee/contract-package', component: 'ContractPackage', requiresAuth: true, requiredRole: 'franchisee' },
    { path: '/franchisee/support-requests', component: 'SupportRequests', requiresAuth: true, requiredRole: 'franchisee' },
    
    // Order management
    { path: '/products', component: 'ProductCatalog', requiresAuth: true },
    { path: '/cart', component: 'ShoppingCart', requiresAuth: true },
    { path: '/checkout', component: 'Checkout', requiresAuth: true },
    { path: '/order-confirmation', component: 'OrderConfirmation', requiresAuth: true },
    { path: '/order-approval', component: 'OrderApprovalDashboard', requiresAuth: true, requiredRole: 'franchisor' },
    { path: '/payment-methods', component: 'PaymentMethods', requiresAuth: true },
    { path: '/addresses', component: 'AddressManagement', requiresAuth: true },
    { path: '/order-tracking', component: 'OrderTracking', requiresAuth: true },
    { path: '/shipping-management', component: 'ShippingManagement', requiresAuth: true, requiredRole: 'franchisor' },
    { path: '/orders', component: 'OrdersList', requiresAuth: true },
    { path: '/notifications', component: 'NotificationsPage', requiresAuth: true },
    { path: '/notification-settings', component: 'NotificationSettings', requiresAuth: true },
    
    // Business logic pages
    { path: '/order-management', component: 'OrderManagement', requiresAuth: true },
    { path: '/financial-dashboard', component: 'FinancialDashboard', requiresAuth: true },
    
    // Supplier management
    { path: '/suppliers', component: 'SuppliersListPage', requiresAuth: true, requiredRole: 'franchisor' },
    { path: '/suppliers/:id', component: 'SupplierDetailsPage', requiresAuth: true, requiredRole: 'franchisor' },
    { path: '/suppliers/create', component: 'CreateSupplierPage', requiresAuth: true, requiredRole: 'franchisor' },
    { path: '/suppliers/:id/products', component: 'SupplierProductsPage', requiresAuth: true, requiredRole: 'franchisor' },
    { path: '/suppliers/:id/contracts', component: 'SupplierContractsPage', requiresAuth: true, requiredRole: 'franchisor' },
    { path: '/suppliers/:id/performance', component: 'SupplierPerformancePage', requiresAuth: true, requiredRole: 'franchisor' },
    { path: '/purchase-orders', component: 'PurchaseOrdersPage', requiresAuth: true, requiredRole: 'franchisor' },
    { path: '/purchase-orders/:id', component: 'PurchaseOrderDetailsPage', requiresAuth: true, requiredRole: 'franchisor' },
    
    // Testing routes
    { path: '/test/supplier-access', component: 'SupplierAccessTest', requiresAuth: true },
    { path: '/test/authentication', component: 'AuthenticationTest', requiresAuth: true },
    { path: '/test/login', component: 'LoginModuleTest', requiresAuth: true },
    { path: '/test/api-errors', component: 'APIErrorTest', requiresAuth: true },
    { path: '/test/react-query', component: 'ReactQueryTest', requiresAuth: true },
    { path: '/test/auth-security', component: 'AuthSecurityTest', requiresAuth: true },
    
    // IAM and profile
    { path: '/iam-management', component: 'IAMManagement', requiresAuth: true },
    { path: '/profile', component: 'UserProfile', requiresAuth: true },
  ];

  async testComponentImport(componentName: string): Promise<{ success: boolean; error?: string; loadTime: number }> {
    const startTime = Date.now();
    
    try {
      // Test dynamic import based on component name
      let importPromise: Promise<any>;
      
      switch (componentName) {
        // Public pages
        case 'Index':
          importPromise = import('../pages/Index');
          break;
        case 'Test':
          importPromise = import('../pages/Test');
          break;
        case 'Contact':
          importPromise = import('../pages/Contact');
          break;
        case 'Blog':
          importPromise = import('../pages/Blog');
          break;
        case 'BlogPost':
          importPromise = import('../pages/BlogPost');
          break;
        case 'BrandMicrosite':
          importPromise = import('../pages/BrandMicrosite');
          break;
          
        // Auth components
        case 'AuthCallback':
          importPromise = import('../components/auth/AuthCallback');
          break;
        case 'Login':
          importPromise = import('../pages/Login');
          break;
        case 'Signup':
          importPromise = import('../pages/Signup');
          break;
        case 'Apply':
          importPromise = import('../pages/Apply');
          break;
          
        // Dashboard pages
        case 'FranchisorDashboard':
          importPromise = import('../pages/FranchisorDashboard');
          break;
        case 'FranchiseeDashboard':
          importPromise = import('../pages/FranchiseeDashboard');
          break;
        case 'FranchiseeTraining':
          importPromise = import('../pages/FranchiseeTraining');
          break;
        case 'FranchisorAnalytics':
          importPromise = import('../pages/FranchisorAnalytics');
          break;
        case 'FranchiseeAnalytics':
          importPromise = import('../pages/FranchiseeAnalytics');
          break;
          
        // Franchisee sub-pages
        case 'SalesUpload':
          importPromise = import('../pages/franchisee/SalesUpload');
          break;
        case 'InventoryOrder':
          importPromise = import('../pages/franchisee/InventoryOrder');
          break;
        case 'MarketingAssets':
          importPromise = import('../pages/franchisee/MarketingAssets');
          break;
        case 'ContractPackage':
          importPromise = import('../pages/franchisee/ContractPackage');
          break;
        case 'SupportRequests':
          importPromise = import('../pages/franchisee/SupportRequests');
          break;
          
        // Order management
        case 'ProductCatalog':
          importPromise = import('../pages/ProductCatalog');
          break;
        case 'ShoppingCart':
          importPromise = import('../pages/ShoppingCart');
          break;
        case 'Checkout':
          importPromise = import('../pages/Checkout');
          break;
        case 'OrderConfirmation':
          importPromise = import('../pages/OrderConfirmation');
          break;
        case 'OrderApprovalDashboard':
          importPromise = import('../pages/OrderApprovalDashboard');
          break;
        case 'PaymentMethods':
          importPromise = import('../pages/PaymentMethods');
          break;
        case 'AddressManagement':
          importPromise = import('../pages/AddressManagement');
          break;
        case 'OrderTracking':
          importPromise = import('../pages/OrderTracking');
          break;
        case 'ShippingManagement':
          importPromise = import('../pages/ShippingManagement');
          break;
        case 'OrdersList':
          importPromise = import('../pages/OrdersList');
          break;
        case 'NotificationsPage':
          importPromise = import('../pages/NotificationsPage');
          break;
        case 'NotificationSettings':
          importPromise = import('../pages/NotificationSettings');
          break;
          
        // Business logic
        case 'OrderManagement':
          importPromise = import('../pages/OrderManagement');
          break;
        case 'FinancialDashboard':
          importPromise = import('../pages/FinancialDashboard');
          break;
          
        // Supplier management
        case 'SuppliersListPage':
          importPromise = import('../pages/suppliers/SuppliersListPage');
          break;
        case 'SupplierDetailsPage':
          importPromise = import('../pages/suppliers/SupplierDetailsPage');
          break;
        case 'CreateSupplierPage':
          importPromise = import('../pages/suppliers/CreateSupplierPage');
          break;
        case 'SupplierProductsPage':
          importPromise = import('../pages/suppliers/SupplierProductsPage');
          break;
        case 'SupplierContractsPage':
          importPromise = import('../pages/suppliers/SupplierContractsPage');
          break;
        case 'SupplierPerformancePage':
          importPromise = import('../pages/suppliers/SupplierPerformancePage');
          break;
        case 'PurchaseOrdersPage':
          importPromise = import('../pages/suppliers/PurchaseOrdersPage');
          break;
        case 'PurchaseOrderDetailsPage':
          importPromise = import('../pages/suppliers/PurchaseOrderDetailsPage');
          break;
          
        // Testing components
        case 'SupplierAccessTest':
          importPromise = import('../components/testing/SupplierAccessTest');
          break;
        case 'AuthenticationTest':
          importPromise = import('../components/testing/AuthenticationTest');
          break;
        case 'LoginModuleTest':
          importPromise = import('../components/testing/LoginModuleTest');
          break;
        case 'APIErrorTest':
          importPromise = import('../components/testing/APIErrorTest');
          break;
        case 'ReactQueryTest':
          importPromise = import('../components/testing/ReactQueryTest');
          break;
        case 'AuthSecurityTest':
          importPromise = import('../components/testing/AuthSecurityTest');
          break;
          
        // Other pages
        case 'IAMManagement':
          importPromise = import('../pages/IAMManagement');
          break;
        case 'UserProfile':
          importPromise = import('../pages/UserProfile');
          break;
        case 'NotFound':
          importPromise = import('../pages/NotFound');
          break;
          
        default:
          throw new Error(`Unknown component: ${componentName}`);
      }
      
      const module = await importPromise;
      const loadTime = Date.now() - startTime;
      
      if (!module.default) {
        throw new Error('Component does not have a default export');
      }
      
      return { success: true, loadTime };
    } catch (error) {
      const loadTime = Date.now() - startTime;
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        loadTime 
      };
    }
  }

  async runAllRouteTests(): Promise<RouteTestResult[]> {
    this.results = [];
    
    console.log('🔍 Starting Route Component Tests...');
    
    for (const route of this.routes) {
      const testResult = await this.testComponentImport(route.component);
      
      const result: RouteTestResult = {
        path: route.path,
        component: route.component,
        status: testResult.success ? 'success' : 'error',
        message: testResult.success 
          ? `Component loaded successfully in ${testResult.loadTime}ms`
          : `Failed to load: ${testResult.error}`,
        loadTime: testResult.loadTime,
        requiresAuth: route.requiresAuth,
        requiredRole: route.requiredRole
      };
      
      this.results.push(result);
    }
    
    return this.results;
  }

  getResults(): RouteTestResult[] {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const successful = this.results.filter(r => r.status === 'success').length;
    const failed = this.results.filter(r => r.status === 'error').length;
    const missing = this.results.filter(r => r.status === 'missing').length;
    
    const avgLoadTime = this.results
      .filter(r => r.loadTime)
      .reduce((sum, r) => sum + (r.loadTime || 0), 0) / this.results.length;
    
    return {
      total,
      successful,
      failed,
      missing,
      successRate: total > 0 ? (successful / total * 100).toFixed(2) : 0,
      avgLoadTime: Math.round(avgLoadTime),
      allRoutesWorking: failed === 0 && missing === 0
    };
  }
}

// Export a default instance for easy use
export const routeTestRunner = new RouteTestRunner();
