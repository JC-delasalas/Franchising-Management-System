
export const ROUTES = {
  // Public routes
  HOME: '/',
  CONTACT: '/contact',
  BLOG: '/blog',
  BLOG_POST: '/blog/:id',
  BRAND_MICROSITE: '/brand/:brandId',
  
  // Auth routes
  LOGIN: '/login',
  SIGNUP: '/signup',
  APPLY: '/apply',
  
  // Franchisor routes
  FRANCHISOR_DASHBOARD: '/franchisor-dashboard',
  FRANCHISOR_ANALYTICS: '/franchisor-analytics',
  FRANCHISOR_ORDER_MANAGEMENT: '/franchisor/order-management',
  
  // Franchisee routes
  FRANCHISEE_DASHBOARD: '/franchisee-dashboard',
  FRANCHISEE_ANALYTICS: '/franchisee-analytics',
  FRANCHISEE_TRAINING: '/franchisee-training',
  
  // Franchisee sub-routes
  FRANCHISEE: {
    SALES_UPLOAD: '/franchisee/sales-upload',
    INVENTORY_ORDER: '/franchisee/inventory-order',
    MARKETING_ASSETS: '/franchisee/marketing-assets',
    CONTRACT_PACKAGE: '/franchisee/contract-package',
    SUPPORT_REQUESTS: '/franchisee/support-requests',
  },
  
  // IAM routes
  IAM_MANAGEMENT: '/iam-management',
} as const;

// Helper function to generate dynamic routes
export const generateRoute = {
  blogPost: (id: string) => `/blog/${id}`,
  brandMicrosite: (brandId: string) => `/brand/${brandId}`,
} as const;

// Route groups for easier management
export const ROUTE_GROUPS = {
  PUBLIC: [
    ROUTES.HOME,
    ROUTES.CONTACT,
    ROUTES.BLOG,
    ROUTES.BLOG_POST,
    ROUTES.BRAND_MICROSITE,
  ],
  AUTH: [
    ROUTES.LOGIN,
    ROUTES.SIGNUP,
    ROUTES.APPLY,
  ],
  FRANCHISOR: [
    ROUTES.FRANCHISOR_DASHBOARD,
    ROUTES.FRANCHISOR_ANALYTICS,
    ROUTES.FRANCHISOR_ORDER_MANAGEMENT,
  ],
  FRANCHISEE: [
    ROUTES.FRANCHISEE_DASHBOARD,
    ROUTES.FRANCHISEE_ANALYTICS,
    ROUTES.FRANCHISEE_TRAINING,
    ...Object.values(ROUTES.FRANCHISEE),
  ],
  PROTECTED: [
    ROUTES.IAM_MANAGEMENT,
  ],
} as const;
