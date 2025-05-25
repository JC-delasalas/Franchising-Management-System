
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Apply from "./pages/Apply";
import FranchisorDashboard from "./pages/FranchisorDashboard";
import FranchiseeDashboard from "./pages/FranchiseeDashboard";
import FranchiseeTraining from "./pages/FranchiseeTraining";
import BrandMicrosite from "./pages/BrandMicrosite";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
