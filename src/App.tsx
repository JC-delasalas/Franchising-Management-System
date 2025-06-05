
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import { PageLoading } from "@/components/ui/loading";
import { validateConfig } from "@/config/environment";

// Import Contact directly to fix the loading issue
import Contact from "./pages/Contact";

// Lazy load other pages for better performance
const Index = React.lazy(() => import("./pages/Index"));
const Apply = React.lazy(() => import("./pages/Apply"));
const FranchisorDashboard = React.lazy(() => import("./pages/FranchisorDashboard"));
const FranchiseeDashboard = React.lazy(() => import("./pages/FranchiseeDashboard"));
const FranchiseeTraining = React.lazy(() => import("./pages/FranchiseeTraining"));
const BrandMicrosite = React.lazy(() => import("./pages/BrandMicrosite"));
const Blog = React.lazy(() => import("./pages/Blog"));
const BlogPost = React.lazy(() => import("./pages/BlogPost"));
const SalesUpload = React.lazy(() => import("./pages/franchisee/SalesUpload"));
const InventoryOrder = React.lazy(() => import("./pages/franchisee/InventoryOrder"));
const MarketingAssets = React.lazy(() => import("./pages/franchisee/MarketingAssets"));
const ContractPackage = React.lazy(() => import("./pages/franchisee/ContractPackage"));
const SupportRequests = React.lazy(() => import("./pages/franchisee/SupportRequests"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// New pages for analytics and auth
const FranchisorAnalytics = React.lazy(() => import("./pages/FranchisorAnalytics"));
const FranchiseeAnalytics = React.lazy(() => import("./pages/FranchiseeAnalytics"));
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));

// Configure React Query with better defaults and error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Validate configuration on app start with error handling
try {
  validateConfig();
} catch (error) {
  console.error('Configuration validation failed:', error);
}

const App = () => (
  <AppErrorBoundary>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoading />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/apply" element={<Apply />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/franchisor-dashboard" element={<FranchisorDashboard />} />
                <Route path="/franchisor-analytics" element={<FranchisorAnalytics />} />
                <Route path="/franchisee-dashboard" element={<FranchiseeDashboard />} />
                <Route path="/franchisee-analytics" element={<FranchiseeAnalytics />} />
                <Route path="/franchisee-training" element={<FranchiseeTraining />} />
                <Route path="/brand/:brandId" element={<BrandMicrosite />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/franchisee/sales-upload" element={<SalesUpload />} />
                <Route path="/franchisee/inventory-order" element={<InventoryOrder />} />
                <Route path="/franchisee/marketing-assets" element={<MarketingAssets />} />
                <Route path="/franchisee/contract-package" element={<ContractPackage />} />
                <Route path="/franchisee/support-requests" element={<SupportRequests />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </AppErrorBoundary>
);

export default App;
