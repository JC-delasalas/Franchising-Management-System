
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import {
  TrendingUp,
  Package,
  DollarSign,
  BookOpen,
  Phone,
  FileText,
  Image as ImageIcon,
  ArrowLeft
} from 'lucide-react';

const DashboardSidebar = () => {
  return (
    <div className="w-64 bg-white shadow-lg h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <Logo size="md" />
          <Button variant="ghost" asChild size="sm" className="text-gray-900 hover:text-gray-700 p-1">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <nav className="space-y-2">
          <div className="flex items-center space-x-3 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            <TrendingUp className="w-5 h-5" />
            <span>Overview</span>
          </div>
          <Link to="/franchisee/sales-upload" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            <DollarSign className="w-5 h-5" />
            <span>Upload Sales</span>
          </Link>
          <Link to="/franchisee/inventory-order" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            <Package className="w-5 h-5" />
            <span>Order Inventory</span>
          </Link>
          <Link to="/franchisee/marketing-assets" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            <ImageIcon className="w-5 h-5" />
            <span>Marketing Assets</span>
          </Link>
          <Link to="/franchisee/contract-package" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            <FileText className="w-5 h-5" />
            <span>Contract & Package</span>
          </Link>
          <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-4">
            <Link to="/franchisee-training">
              <BookOpen className="w-4 h-4 mr-2" />
              Training
            </Link>
          </Button>
          <Link to="/franchisee/support-requests" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            <Phone className="w-5 h-5" />
            <span>Support & Requests</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default DashboardSidebar;
