
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FranchiseeAnalytics from '@/components/analytics/FranchiseeAnalytics';
import { OverviewTab } from './tabs/OverviewTab';
import { SalesTab } from './tabs/SalesTab';
import { InventoryTab } from './tabs/InventoryTab';
import { MarketingTab } from './tabs/MarketingTab';
import { ContractTab } from './tabs/ContractTab';
import { ReportsTab } from './tabs/ReportsTab';
import {
  BarChart3,
  TrendingUp,
  Upload,
  Package,
  ImageIcon,
  FileText,
  ClipboardList
} from 'lucide-react';

export const DashboardTabs: React.FC = () => {
  return (
    <Tabs defaultValue="analytics" className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
        <TabsList className="grid w-full grid-cols-7 bg-gray-50 rounded-lg p-1 gap-1">
          <TabsTrigger
            value="analytics"
            className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Home</span>
          </TabsTrigger>
          <TabsTrigger
            value="sales"
            className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
          >
            <Upload className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Upload Sales</span>
            <span className="sm:hidden">Sales</span>
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
          >
            <Package className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Inventory</span>
            <span className="sm:hidden">Stock</span>
          </TabsTrigger>
          <TabsTrigger
            value="marketing"
            className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Marketing</span>
            <span className="sm:hidden">Media</span>
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Reports</span>
            <span className="sm:hidden">Reports</span>
          </TabsTrigger>
          <TabsTrigger
            value="contract"
            className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
          >
            <FileText className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Contract</span>
            <span className="sm:hidden">Docs</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="analytics">
        <FranchiseeAnalytics franchiseeName="Siomai Shop - Makati Branch" />
      </TabsContent>

      <TabsContent value="overview">
        <OverviewTab />
      </TabsContent>

      <TabsContent value="sales">
        <SalesTab />
      </TabsContent>

      <TabsContent value="inventory">
        <InventoryTab />
      </TabsContent>

      <TabsContent value="marketing">
        <MarketingTab />
      </TabsContent>

      <TabsContent value="reports">
        <ReportsTab />
      </TabsContent>

      <TabsContent value="contract">
        <ContractTab />
      </TabsContent>
    </Tabs>
  );
};
