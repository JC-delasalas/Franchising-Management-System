
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import ComponentErrorBoundary from "@/components/ui/ComponentErrorBoundary";
import { PageLoading } from "@/components/ui/loading";
import { validateConfig } from "@/config/environment";
import { AuthorizationProvider } from "@/contexts/AuthorizationContext";

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

// Franchisee sub-pages
const SalesUpload = React.lazy(() => import("./pages/franchisee/SalesUpload"));
const InventoryOrder = React.lazy(() => import("./pages/franchisee/InventoryOrder"));
const MarketingAssets = React.lazy(() => import("./pages/franchisee/MarketingAssets"));
const ContractPackage = React.lazy(() => import("./pages/franchisee/ContractPackage"));
const SupportRequests = React.lazy(() => import("./pages/franchisee/SupportRequests"));

// 404 page
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Optimized React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2; // Reduced from 3 to 2 for faster failure detection
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1, // Only retry mutations once
    },
  },
});

// Validate configuration on app start
try {
  validateConfig();
} catch (error) {
  console.error('Configuration validation failed:', error);
}

const App = () => (
  <AppErrorBoundary>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthorizationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ComponentErrorBoundary>
                <Suspense fallback={<PageLoading />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/apply" element={<Apply />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                    <Route path="/brand/:brandId" element={<BrandMicrosite />} />
                    
                    {/* Dashboard Routes */}
                    <Route path="/franchisor-dashboard" element={<FranchisorDashboard />} />
                    <Route path="/franchisee-dashboard" element={<FranchiseeDashboard />} />
                    <Route path="/franchisee-training" element={<FranchiseeTraining />} />
                    
                    {/* Analytics Routes */}
                    <Route path="/franchisor-analytics" element={<FranchisorAnalytics />} />
                    <Route path="/franchisee-analytics" element={<FranchiseeAnalytics />} />
                    
                    {/* IAM Routes */}
                    <Route path="/iam-management" element={<IAMManagement />} />
                    
                    {/* Franchisee Sub-pages */}
                    <Route path="/franchisee/sales-upload" element={<SalesUpload />} />
                    <Route path="/franchisee/inventory-order" element={<InventoryOrder />} />
                    <Route path="/franchisee/marketing-assets" element={<MarketingAssets />} />
                    <Route path="/franchisee/contract-package" element={<ContractPackage />} />
                    <Route path="/franchisee/support-requests" element={<SupportRequests />} />
                    
                    {/* Catch-all route - MUST be last */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ComponentErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </AuthorizationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </AppErrorBoundary>
);

export default App;
