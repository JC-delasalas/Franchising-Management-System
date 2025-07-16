
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  ArrowLeft,
  ShoppingCart,
  Store,
  CreditCard,
  MapPin
} from 'lucide-react';

const DashboardSidebar = React.memo(() => {
  const location = useLocation();

  const navigationItems = useMemo(() => [
    {
      href: '/franchisee-dashboard',
      label: 'Overview',
      icon: TrendingUp,
      isActive: location.pathname === '/franchisee-dashboard'
    },
    {
      href: '/franchisee/sales-upload',
      label: 'Upload Sales',
      icon: DollarSign,
      isActive: location.pathname === '/franchisee/sales-upload'
    },
    {
      href: '/product-catalog',
      label: 'Product Catalog',
      icon: Store,
      isActive: location.pathname === '/product-catalog'
    },
    {
      href: '/cart',
      label: 'Shopping Cart',
      icon: ShoppingCart,
      isActive: location.pathname === '/cart'
    },
    {
      href: '/franchisee/inventory-order',
      label: 'Order Inventory',
      icon: Package,
      isActive: location.pathname === '/franchisee/inventory-order'
    },
    {
      href: '/franchisee/marketing-assets',
      label: 'Marketing Assets',
      icon: ImageIcon,
      isActive: location.pathname === '/franchisee/marketing-assets'
    },
    {
      href: '/franchisee/contract-package',
      label: 'Contract & Package',
      icon: FileText,
      isActive: location.pathname === '/franchisee/contract-package'
    },
    {
      href: '/franchisee/support-requests',
      label: 'Support & Requests',
      icon: Phone,
      isActive: location.pathname === '/franchisee/support-requests'
    },
    {
      href: '/payment-methods',
      label: 'Payment Methods',
      icon: CreditCard,
      isActive: location.pathname === '/payment-methods'
    },
    {
      href: '/addresses',
      label: 'Addresses',
      icon: MapPin,
      isActive: location.pathname === '/addresses'
    }
  ], [location.pathname]);

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
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  item.isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                aria-current={item.isActive ? 'page' : undefined}
              >
                <IconComponent className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-4">
            <Link to="/franchisee-training">
              <BookOpen className="w-4 h-4 mr-2" />
              Training
            </Link>
          </Button>
        </nav>
      </div>
    </div>
  );
});

DashboardSidebar.displayName = 'DashboardSidebar';

export default DashboardSidebar;
