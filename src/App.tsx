
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import ComponentErrorBoundary from "@/components/ui/ComponentErrorBoundary";
import { PageLoading } from "@/components/ui/loading";
import { SessionTimeoutWarning } from "@/components/auth/SessionTimeoutWarning";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useAuth } from "@/hooks/useAuth";
import { validateConfig } from "@/config/environment";
import { AuthorizationProvider } from "@/contexts/AuthorizationContext";
import { AuthGuard, RequireAuth, GuestOnly } from "@/components/auth/AuthGuard";

// Lazy load pages for better performance
const Index = React.lazy(() => import("./pages/Index"));
const Apply = React.lazy(() => import("./pages/Apply"));
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Blog = React.lazy(() => import("./pages/Blog"));
const BlogPost = React.lazy(() => import("./pages/BlogPost"));
const BrandMicrosite = React.lazy(() => import("./pages/BrandMicrosite"));

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

// Phase 3 Business Logic Pages
const OrderManagement = React.lazy(() => import("./pages/OrderManagement"));
const FinancialDashboard = React.lazy(() => import("./pages/FinancialDashboard"));

// 404 page
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Enhanced React Query configuration for optimal performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (increased for better caching)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      // Enable background refetching for better UX
      refetchInterval: false,
      // Optimize network usage
      networkMode: 'online',
      // Enable suspense for better loading states
      suspense: false,
    },
    mutations: {
      retry: 2,
      // Add network mode for mutations
      networkMode: 'online',
    },
  },
});

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
            <SessionWrapper>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ComponentErrorBoundary>
                    <Suspense fallback={<PageLoading />}>
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:id" element={<BlogPost />} />
                        <Route path="/brand/:brandId" element={<BrandMicrosite />} />
                        
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
            </SessionWrapper>
          </AuthorizationProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </AppErrorBoundary>
  </GlobalErrorBoundary>
);

export default App;
