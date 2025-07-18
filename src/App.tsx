
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import ComponentErrorBoundary from "@/components/ui/ComponentErrorBoundary";
import AuthErrorBoundary from "@/components/auth/AuthErrorBoundary";
import { PageLoading } from "@/components/ui/loading";
import { SessionTimeoutWarning } from "@/components/auth/SessionTimeoutWarning";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useAuth } from "@/hooks/useAuth";
import { validateConfig } from "@/config/environment";
import { AuthorizationProvider } from "@/contexts/AuthorizationContext";
import { AuthGuard, RequireAuth, GuestOnly } from "@/components/auth/AuthGuard";
import { SupplierRouteGuard } from "@/components/auth/SupplierRouteGuard";
import NotificationToast from "@/components/notifications/NotificationToast";

// Lazy load pages for better performance
const Index = React.lazy(() => import("./pages/Index"));
const Apply = React.lazy(() => import("./pages/Apply"));
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Blog = React.lazy(() => import("./pages/Blog"));
const BlogPost = React.lazy(() => import("./pages/BlogPost"));
const BrandMicrosite = React.lazy(() => import("./pages/BrandMicrosite"));
const Test = React.lazy(() => import("./pages/Test"));

// Auth components
const AuthCallback = React.lazy(() => import("./components/auth/AuthCallback"));

// Dashboard pages
const FranchisorDashboard = React.lazy(() => import("./pages/FranchisorDashboard"));
const FranchiseeDashboard = React.lazy(() => import("./pages/FranchiseeDashboard"));
const FranchiseeTraining = React.lazy(() => import("./pages/FranchiseeTraining"));

// Analytics pages
const FranchisorAnalytics = React.lazy(() => import("./pages/FranchisorAnalytics"));
const FranchiseeAnalytics = React.lazy(() => import("./pages/FranchiseeAnalytics"));

// IAM pages
const IAMManagement = React.lazy(() => import("./pages/IAMManagement"));

// User Profile page
const UserProfile = React.lazy(() => import("./pages/UserProfile"));

// Franchisee sub-pages
const SalesUpload = React.lazy(() => import("./pages/franchisee/SalesUpload"));
const InventoryOrder = React.lazy(() => import("./pages/franchisee/InventoryOrder"));
const MarketingAssets = React.lazy(() => import("./pages/franchisee/MarketingAssets"));
const ContractPackage = React.lazy(() => import("./pages/franchisee/ContractPackage"));
const SupportRequests = React.lazy(() => import("./pages/franchisee/SupportRequests"));

// Order Management pages
const ProductCatalog = React.lazy(() => import("./pages/ProductCatalog"));
const ShoppingCart = React.lazy(() => import("./pages/ShoppingCart"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const OrderConfirmation = React.lazy(() => import("./pages/OrderConfirmation"));
const OrderApprovalDashboard = React.lazy(() => import("./pages/OrderApprovalDashboard"));
const PaymentMethods = React.lazy(() => import("./pages/PaymentMethods"));
const AddressManagement = React.lazy(() => import("./pages/AddressManagement"));
const OrderTracking = React.lazy(() => import("./pages/OrderTracking"));
const ShippingManagement = React.lazy(() => import("./pages/ShippingManagement"));
const OrdersList = React.lazy(() => import("./pages/OrdersList"));
const NotificationsPage = React.lazy(() => import("./pages/NotificationsPage"));
const NotificationSettings = React.lazy(() => import("./pages/NotificationSettings"));

// Phase 3 Business Logic Pages
const OrderManagement = React.lazy(() => import("./pages/OrderManagement"));
const FinancialDashboard = React.lazy(() => import("./pages/FinancialDashboard"));

// Supplier Management Pages
const SuppliersListPage = React.lazy(() => import("./pages/suppliers/SuppliersListPage"));
const SupplierDetailsPage = React.lazy(() => import("./pages/suppliers/SupplierDetailsPage"));
const CreateSupplierPage = React.lazy(() => import("./pages/suppliers/CreateSupplierPage"));
const SupplierProductsPage = React.lazy(() => import("./pages/suppliers/SupplierProductsPage"));
const SupplierContractsPage = React.lazy(() => import("./pages/suppliers/SupplierContractsPage"));
const SupplierPerformancePage = React.lazy(() => import("./pages/suppliers/SupplierPerformancePage"));
const PurchaseOrdersPage = React.lazy(() => import("./pages/suppliers/PurchaseOrdersPage"));
const PurchaseOrderDetailsPage = React.lazy(() => import("./pages/suppliers/PurchaseOrderDetailsPage"));

// Testing Components
const SupplierAccessTest = React.lazy(() => import("./components/testing/SupplierAccessTest"));
const AuthenticationTest = React.lazy(() => import("./components/testing/AuthenticationTest"));
const LoginModuleTest = React.lazy(() => import("./components/testing/LoginModuleTest"));
const APIErrorTest = React.lazy(() => import("./components/testing/APIErrorTest"));
const ReactQueryTest = React.lazy(() => import("./components/testing/ReactQueryTest"));
const AuthSecurityTest = React.lazy(() => import("./components/testing/AuthSecurityTest"));
const RouteTest = React.lazy(() => import("./components/testing/RouteTest"));
const ProductionFixesTest = React.lazy(() => import("./components/testing/ProductionFixesTest"));
const IntegrationTest = React.lazy(() => import("./components/testing/IntegrationTest"));
const TestSuiteDashboard = React.lazy(() => import("./components/testing/TestSuiteDashboard"));
const RLSSecurityTest = React.lazy(() => import("./components/testing/RLSSecurityTest"));
const SystemBugTracker = React.lazy(() => import("./components/testing/SystemBugTracker"));
const CartTest = React.lazy(() => import("./components/testing/CartTest"));

// 404 page
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Using optimized query client from lib/queryClient.ts

// Validate configuration on app start
try {
  validateConfig();
} catch (error) {
  console.error('Configuration validation failed:', error);
}

const SessionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const {
    showWarning,
    formatTimeRemaining,
    refreshSession,
    handleSessionTimeout
  } = useSessionManager();

  return (
    <>
      {children}
      {isAuthenticated && user && (
        <SessionTimeoutWarning
          timeRemaining={formatTimeRemaining()}
          onRefreshSession={refreshSession}
          onLogout={handleSessionTimeout}
          show={showWarning}
        />
      )}
    </>
  );
};

const App = () => (
  <GlobalErrorBoundary>
    <AppErrorBoundary>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthorizationProvider>
            <AuthErrorBoundary>
              <SessionWrapper>
                <NotificationToast>
                  <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                  <ComponentErrorBoundary>
                    <Suspense fallback={<PageLoading />}>
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/test" element={<Test />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:id" element={<BlogPost />} />
                        <Route path="/brand/:brandId" element={<BrandMicrosite />} />

                        {/* Auth Callback Route - Handles email confirmation redirects */}
                        <Route path="/auth/callback" element={<AuthCallback />} />

                        {/* Guest Only Routes (redirect if logged in) */}
                        <Route path="/login" element={
                          <GuestOnly>
                            <Login />
                          </GuestOnly>
                        } />
                        <Route path="/signup" element={
                          <GuestOnly>
                            <Signup />
                          </GuestOnly>
                        } />
                        <Route path="/apply" element={
                          <GuestOnly>
                            <Apply />
                          </GuestOnly>
                        } />
                        
                        {/* Protected Franchisor Routes */}
                        <Route path="/franchisor-dashboard" element={
                          <RequireAuth role="franchisor">
                            <FranchisorDashboard />
                          </RequireAuth>
                        } />
                        <Route path="/franchisor-analytics" element={
                          <RequireAuth role="franchisor">
                            <FranchisorAnalytics />
                          </RequireAuth>
                        } />
                        
                        {/* Protected Franchisee Routes */}
                        <Route path="/franchisee-dashboard" element={
                          <RequireAuth role="franchisee">
                            <FranchiseeDashboard />
                          </RequireAuth>
                        } />
                        <Route path="/franchisee-analytics" element={
                          <RequireAuth role="franchisee">
                            <FranchiseeAnalytics />
                          </RequireAuth>
                        } />
                        <Route path="/franchisee-training" element={
                          <RequireAuth role="franchisee">
                            <FranchiseeTraining />
                          </RequireAuth>
                        } />
                        
                        {/* Protected Franchisee Sub-pages */}
                        <Route path="/franchisee/sales-upload" element={
                          <RequireAuth role="franchisee">
                            <SalesUpload />
                          </RequireAuth>
                        } />
                        <Route path="/franchisee/inventory-order" element={
                          <RequireAuth role="franchisee">
                            <InventoryOrder />
                          </RequireAuth>
                        } />
                        <Route path="/franchisee/marketing-assets" element={
                          <RequireAuth role="franchisee">
                            <MarketingAssets />
                          </RequireAuth>
                        } />
                        <Route path="/franchisee/contract-package" element={
                          <RequireAuth role="franchisee">
                            <ContractPackage />
                          </RequireAuth>
                        } />
                        <Route path="/franchisee/support-requests" element={
                          <RequireAuth role="franchisee">
                            <SupportRequests />
                          </RequireAuth>
                        } />

                        {/* Order Management Routes */}
                        <Route path="/product-catalog" element={
                          <RequireAuth role="franchisee">
                            <ProductCatalog />
                          </RequireAuth>
                        } />
                        <Route path="/cart" element={
                          <RequireAuth role="franchisee">
                            <ShoppingCart />
                          </RequireAuth>
                        } />
                        <Route path="/checkout" element={
                          <RequireAuth role="franchisee">
                            <Checkout />
                          </RequireAuth>
                        } />
                        <Route path="/order-confirmation/:orderId" element={
                          <RequireAuth role="franchisee">
                            <OrderConfirmation />
                          </RequireAuth>
                        } />
                        <Route path="/order-approvals" element={
                          <RequireAuth role="franchisor">
                            <OrderApprovalDashboard />
                          </RequireAuth>
                        } />
                        <Route path="/payment-methods" element={
                          <RequireAuth role="franchisee">
                            <PaymentMethods />
                          </RequireAuth>
                        } />
                        <Route path="/addresses" element={
                          <RequireAuth role="franchisee">
                            <AddressManagement />
                          </RequireAuth>
                        } />
                        <Route path="/orders" element={
                          <RequireAuth role="franchisee">
                            <OrdersList />
                          </RequireAuth>
                        } />
                        <Route path="/orders/:orderId" element={
                          <RequireAuth role="franchisee">
                            <OrderTracking />
                          </RequireAuth>
                        } />
                        <Route path="/shipping-management" element={
                          <RequireAuth role="franchisor">
                            <ShippingManagement />
                          </RequireAuth>
                        } />
                        <Route path="/notifications" element={
                          <RequireAuth>
                            <NotificationsPage />
                          </RequireAuth>
                        } />
                        <Route path="/notification-settings" element={
                          <RequireAuth>
                            <NotificationSettings />
                          </RequireAuth>
                        } />

                        {/* Phase 3 Business Logic Routes */}
                        <Route path="/order-management" element={
                          <RequireAuth>
                            <OrderManagement />
                          </RequireAuth>
                        } />
                        <Route path="/financial-dashboard" element={
                          <RequireAuth>
                            <FinancialDashboard />
                          </RequireAuth>
                        } />

                        {/* Supplier Management Routes - Role-based access control */}
                        <Route path="/suppliers" element={
                          <SupplierRouteGuard requiredPermission="read">
                            <SuppliersListPage />
                          </SupplierRouteGuard>
                        } />
                        <Route path="/suppliers/create" element={
                          <SupplierRouteGuard requiredPermission="write">
                            <CreateSupplierPage />
                          </SupplierRouteGuard>
                        } />
                        <Route path="/suppliers/:id" element={
                          <SupplierRouteGuard requiredPermission="read">
                            <SupplierDetailsPage />
                          </SupplierRouteGuard>
                        } />
                        <Route path="/suppliers/products" element={
                          <SupplierRouteGuard requiredPermission="read">
                            <SupplierProductsPage />
                          </SupplierRouteGuard>
                        } />
                        <Route path="/suppliers/contracts" element={
                          <SupplierRouteGuard requiredPermission="read">
                            <SupplierContractsPage />
                          </SupplierRouteGuard>
                        } />
                        <Route path="/suppliers/performance" element={
                          <SupplierRouteGuard requiredPermission="read">
                            <SupplierPerformancePage />
                          </SupplierRouteGuard>
                        } />
                        <Route path="/suppliers/purchase-orders" element={
                          <SupplierRouteGuard requiredPermission="read">
                            <PurchaseOrdersPage />
                          </SupplierRouteGuard>
                        } />
                        <Route path="/suppliers/purchase-orders/:id" element={
                          <SupplierRouteGuard requiredPermission="read">
                            <PurchaseOrderDetailsPage />
                          </SupplierRouteGuard>
                        } />

                        {/* Testing Routes - Available to all authenticated users */}
                        <Route path="/test/supplier-access" element={
                          <RequireAuth>
                            <SupplierAccessTest />
                          </RequireAuth>
                        } />
                        <Route path="/test/authentication" element={
                          <RequireAuth>
                            <AuthenticationTest />
                          </RequireAuth>
                        } />
                        <Route path="/test/login" element={
                          <RequireAuth>
                            <LoginModuleTest />
                          </RequireAuth>
                        } />
                        <Route path="/test/api-errors" element={
                          <RequireAuth>
                            <APIErrorTest />
                          </RequireAuth>
                        } />
                        <Route path="/test/react-query" element={
                          <RequireAuth>
                            <ReactQueryTest />
                          </RequireAuth>
                        } />
                        <Route path="/test/auth-security" element={
                          <RequireAuth>
                            <AuthSecurityTest />
                          </RequireAuth>
                        } />
                        <Route path="/test/routes" element={
                          <RequireAuth>
                            <RouteTest />
                          </RequireAuth>
                        } />
                        <Route path="/test/production-fixes" element={
                          <RequireAuth>
                            <ProductionFixesTest />
                          </RequireAuth>
                        } />
                        <Route path="/test/integration" element={
                          <RequireAuth>
                            <IntegrationTest />
                          </RequireAuth>
                        } />
                        <Route path="/test" element={<TestSuiteDashboard />} />
                        <Route path="/test/rls-security" element={
                          <RequireAuth>
                            <RLSSecurityTest />
                          </RequireAuth>
                        } />
                        <Route path="/test/bug-tracker" element={
                          <RequireAuth>
                            <SystemBugTracker />
                          </RequireAuth>
                        } />
                        <Route path="/test/cart" element={
                          <RequireAuth>
                            <CartTest />
                          </RequireAuth>
                        } />

                        {/* Protected IAM Routes (requires special permissions) */}
                        <Route path="/iam-management" element={
                          <RequireAuth>
                            <IAMManagement />
                          </RequireAuth>
                        } />

                        {/* User Profile Route */}
                        <Route path="/profile" element={
                          <RequireAuth>
                            <UserProfile />
                          </RequireAuth>
                        } />

                        {/* Catch-all route - MUST be last */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </ComponentErrorBoundary>
                </BrowserRouter>
                </TooltipProvider>
                </NotificationToast>
              </SessionWrapper>
            </AuthErrorBoundary>
          </AuthorizationProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </AppErrorBoundary>
  </GlobalErrorBoundary>
);

export default App;
