
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthorizationProvider } from "@/contexts/AuthorizationContext";
import { RequireSupabaseAuth, GuestOnlySupabase } from "@/components/auth/SupabaseAuthGuard";
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
const Signup = lazy(() => import("./pages/Signup"));
const SupabaseLogin = lazy(() => import("./pages/SupabaseLogin"));
const SupabaseSignup = lazy(() => import("./pages/SupabaseSignup"));
const FranchiseeDashboard = lazy(() => import("./pages/FranchiseeDashboard"));
const FranchisorDashboard = lazy(() => import("./pages/FranchisorDashboard"));
const FranchiseeAnalytics = lazy(() => import("./pages/FranchiseeAnalytics"));
const FranchisorAnalytics = lazy(() => import("./pages/FranchisorAnalytics"));
const FranchiseeTraining = lazy(() => import("./pages/FranchiseeTraining"));
const NotFound = lazy(() => import("./pages/NotFound"));
const IAMManagement = lazy(() => import("./pages/IAMManagement"));

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
            <AuthorizationProvider>
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

                        {/* Legacy auth routes (keep for existing users) */}
                        <Route path="/login" element={
                          <GuestOnlySupabase>
                            <Login />
                          </GuestOnlySupabase>
                        } />
                        <Route path="/signup" element={
                          <GuestOnlySupabase>
                            <Signup />
                          </GuestOnlySupabase>
                        } />

                        {/* New Supabase auth routes */}
                        <Route path="/supabase-login" element={
                          <GuestOnlySupabase>
                            <SupabaseLogin />
                          </GuestOnlySupabase>
                        } />
                        <Route path="/supabase-signup" element={
                          <GuestOnlySupabase>
                            <SupabaseSignup />
                          </GuestOnlySupabase>
                        } />

                        {/* Protected routes */}
                        <Route path="/franchisee-dashboard" element={
                          <RequireSupabaseAuth>
                            <FranchiseeDashboard />
                          </RequireSupabaseAuth>
                        } />
                        <Route path="/franchisor-dashboard" element={
                          <RequireSupabaseAuth>
                            <FranchisorDashboard />
                          </RequireSupabaseAuth>
                        } />
                        <Route path="/franchisee-analytics" element={
                          <RequireSupabaseAuth>
                            <FranchiseeAnalytics />
                          </RequireSupabaseAuth>
                        } />
                        <Route path="/franchisor-analytics" element={
                          <RequireSupabaseAuth>
                            <FranchisorAnalytics />
                          </RequireSupabaseAuth>
                        } />
                        <Route path="/franchisee-training" element={
                          <RequireSupabaseAuth>
                            <FranchiseeTraining />
                          </RequireSupabaseAuth>
                        } />
                        <Route path="/iam-management" element={
                          <RequireSupabaseAuth>
                            <IAMManagement />
                          </RequireSupabaseAuth>
                        } />

                        {/* New Management Routes */}
                        <Route path="/file-management" element={
                          <RequireSupabaseAuth>
                            <FileManagement />
                          </RequireSupabaseAuth>
                        } />
                        <Route path="/transaction-management" element={
                          <RequireSupabaseAuth>
                            <TransactionManagement />
                          </RequireSupabaseAuth>
                        } />
                        <Route path="/report-generation" element={
                          <RequireSupabaseAuth>
                            <ReportGeneration />
                          </RequireSupabaseAuth>
                        } />

                        {/* Franchisee specific routes */}
                        <Route path="/franchisee/contract-package" element={
                          <RequireSupabaseAuth>
                            <ContractPackage />
                          </RequireSupabaseAuth>
                        } />
                        <Route path="/franchisee/inventory-order" element={
                          <RequireSupabaseAuth>
                            <InventoryOrder />
                          </RequireSupabaseAuth>
                        } />
                        <Route path="/franchisee/marketing-assets" element={
                          <RequireSupabaseAuth>
                            <MarketingAssets />
                          </RequireSupabaseAuth>
                        } />
                        <Route path="/franchisee/sales-upload" element={
                          <RequireSupabaseAuth>
                            <SalesUpload />
                          </RequireSupabaseAuth>
                        } />
                        <Route path="/franchisee/support-requests" element={
                          <RequireSupabaseAuth>
                            <SupportRequests />
                          </RequireSupabaseAuth>
                        } />

                        {/* Franchisor specific routes */}
                        <Route path="/franchisor/order-management" element={
                          <RequireSupabaseAuth>
                            <OrderManagement />
                          </RequireSupabaseAuth>
                        } />

                        {/* Redirect patterns */}
                        <Route path="/auth" element={<Navigate to="/supabase-login" replace />} />
                        <Route path="/auth/login" element={<Navigate to="/supabase-login" replace />} />
                        <Route path="/auth/signup" element={<Navigate to="/supabase-signup" replace />} />

                        {/* Catch all */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </div>
                </BrowserRouter>
              </TooltipProvider>
            </AuthorizationProvider>
          </AuthProvider>
        </QueryClientProvider>
      </GlobalErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
