
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { PageLoading } from "@/components/ui/loading";
import { validateConfig } from "@/config/environment";

// Lazy load pages for better performance
const Index = React.lazy(() => import("./pages/Index"));
const Apply = React.lazy(() => import("./pages/Apply"));
const FranchisorDashboard = React.lazy(() => import("./pages/FranchisorDashboard"));
const FranchiseeDashboard = React.lazy(() => import("./pages/FranchiseeDashboard"));
const FranchiseeTraining = React.lazy(() => import("./pages/FranchiseeTraining"));
const BrandMicrosite = React.lazy(() => import("./pages/BrandMicrosite"));
const Contact = React.lazy(() => import("./pages/Contact"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Configure React Query with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Validate configuration on app start
validateConfig();

const App = () => (
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
              <Route path="/franchisor-dashboard" element={<FranchisorDashboard />} />
              <Route path="/franchisee-dashboard" element={<FranchiseeDashboard />} />
              <Route path="/franchisee-training" element={<FranchiseeTraining />} />
              <Route path="/brand/:brandId" element={<BrandMicrosite />} />
              <Route path="/contact" element={<Contact />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
