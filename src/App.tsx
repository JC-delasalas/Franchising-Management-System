
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import RequireAuth from "@/components/auth/RequireAuth";
import { HelmetProvider } from 'react-helmet-async';
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { LoadingSpinner } from "@/components/ui/loading";

const Index = lazy(() => import("./pages/Index"));
const Apply = lazy(() => import("./pages/Apply"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BrandMicrosite = lazy(() => import("./pages/BrandMicrosite"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const FranchiseeDashboard = lazy(() => import("./pages/FranchiseeDashboard"));
const FranchisorDashboard = lazy(() => import("./pages/FranchisorDashboard"));
const FranchiseeAnalytics = lazy(() => import("./pages/FranchiseeAnalytics"));
const FranchisorAnalytics = lazy(() => import("./pages/FranchisorAnalytics"));
const FranchiseeTraining = lazy(() => import("./pages/FranchiseeTraining"));
const NotFound = lazy(() => import("./pages/NotFound"));
const IAMManagement = lazy(() => import("./pages/IAMManagement"));
const SupabaseTest = lazy(() => import("./pages/SupabaseTest"));
const Diagnostic = lazy(() => import("./pages/Diagnostic"));

// Franchisee pages
const ContractPackage = lazy(() => import("./pages/franchisee/ContractPackage"));
const InventoryOrder = lazy(() => import("./pages/franchisee/InventoryOrder"));
const MarketingAssets = lazy(() => import("./pages/franchisee/MarketingAssets"));
const SalesUpload = lazy(() => import("./pages/franchisee/SalesUpload"));
const SupportRequests = lazy(() => import("./pages/franchisee/SupportRequests"));

// Franchisor pages
const OrderManagement = lazy(() => import("./pages/franchisor/OrderManagement"));

// New management pages
const FileManagement = lazy(() => import("./pages/FileManagement"));
const TransactionManagement = lazy(() => import("./pages/TransactionManagement"));
const ReportGeneration = lazy(() => import("./pages/ReportGeneration"));

// New module pages
const FranchiseOnboarding = lazy(() => import("./pages/FranchiseOnboarding"));
const POSSystem = lazy(() => import("./pages/POSSystem"));
const AdminPortal = lazy(() => import("./pages/AdminPortal"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <GlobalErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>

              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <div className="min-h-screen bg-background">
                    <Suspense fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <LoadingSpinner size="lg" />
                      </div>
                    }>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/apply" element={<Apply />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:slug" element={<BlogPost />} />
                        <Route path="/brand/:brandId" element={<BrandMicrosite />} />
                        <Route path="/brands/:brandSlug" element={<BrandMicrosite />} />
                        <Route path="/contact" element={<Contact />} />

                        {/* Test routes */}
                        <Route path="/test" element={<SupabaseTest />} />
                        <Route path="/diagnostic" element={<Diagnostic />} />

                        {/* Authentication routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected routes */}
                        <Route path="/franchisee-dashboard" element={
                          <RequireAuth allowedRoles={['franchisee']}>
                            <FranchiseeDashboard />
                          </RequireAuth>
                        } />
                        <Route path="/franchisor-dashboard" element={
                          <RequireAuth allowedRoles={['franchisor']}>
                            <FranchisorDashboard />
                          </RequireAuth>
                        } />
                        <Route path="/franchisee-analytics" element={
                          <RequireAuth allowedRoles={['franchisee']}>
                            <FranchiseeAnalytics />
                          </RequireAuth>
                        } />
                        <Route path="/franchisor-analytics" element={
                          <RequireAuth allowedRoles={['franchisor']}>
                            <FranchisorAnalytics />
                          </RequireAuth>
                        } />
                        <Route path="/franchisee-training" element={
                          <RequireAuth allowedRoles={['franchisee']}>
                            <FranchiseeTraining />
                          </RequireAuth>
                        } />
                        <Route path="/iam-management" element={
                          <RequireAuth allowedRoles={['admin']}>
                            <IAMManagement />
                          </RequireAuth>
                        } />

                        {/* New Management Routes */}
                        <Route path="/file-management" element={
                          <RequireAuth>
                            <FileManagement />
                          </RequireAuth>
                        } />
                        <Route path="/transaction-management" element={
                          <RequireAuth>
                            <TransactionManagement />
                          </RequireAuth>
                        } />
                        <Route path="/report-generation" element={
                          <RequireAuth>
                            <ReportGeneration />
                          </RequireAuth>
                        } />

                        {/* Franchisee specific routes */}
                        <Route path="/franchisee/contract-package" element={
                          <RequireAuth allowedRoles={['franchisee']}>
                            <ContractPackage />
                          </RequireAuth>
                        } />
                        <Route path="/franchisee/inventory-order" element={
                          <RequireAuth allowedRoles={['franchisee']}>
                            <InventoryOrder />
                          </RequireAuth>
                        } />
                        <Route path="/franchisee/marketing-assets" element={
                          <RequireAuth allowedRoles={['franchisee']}>
                            <MarketingAssets />
                          </RequireAuth>
                        } />
                        <Route path="/franchisee/sales-upload" element={
                          <RequireAuth allowedRoles={['franchisee']}>
                            <SalesUpload />
                          </RequireAuth>
                        } />
                        <Route path="/franchisee/support-requests" element={
                          <RequireAuth allowedRoles={['franchisee']}>
                            <SupportRequests />
                          </RequireAuth>
                        } />

                        {/* Franchisor specific routes */}
                        <Route path="/franchisor/order-management" element={
                          <RequireAuth allowedRoles={['franchisor']}>
                            <OrderManagement />
                          </RequireAuth>
                        } />

                        {/* New Module Routes */}
                        <Route path="/onboarding" element={
                          <RequireAuth allowedRoles={['admin', 'franchisor']}>
                            <FranchiseOnboarding userRole="admin" />
                          </RequireAuth>
                        } />
                        <Route path="/pos" element={
                          <RequireAuth allowedRoles={['franchisee']}>
                            <POSSystem />
                          </RequireAuth>
                        } />
                        <Route path="/admin" element={
                          <RequireAuth allowedRoles={['admin']}>
                            <AdminPortal />
                          </RequireAuth>
                        } />

                        {/* Redirect patterns */}
                        <Route path="/auth" element={<Navigate to="/login" replace />} />
                        <Route path="/auth/login" element={<Navigate to="/login" replace />} />
                        <Route path="/auth/signup" element={<Navigate to="/register" replace />} />

                        {/* Catch all */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </div>
                </BrowserRouter>
              </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </GlobalErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
