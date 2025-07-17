import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSupplierPermissions } from '../auth/SupplierRouteGuard';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  BarChart3,
  Settings,
  Truck,
  Building2,
  CreditCard,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('franchisor' | 'franchisee' | 'admin' | 'user')[];
  badge?: string;
  children?: NavigationItem[];
}

/**
 * Role-based navigation component that shows/hides menu items based on user permissions
 */
export const RoleBasedNavigation: React.FC = () => {
  const { user } = useAuth();
  const { hasSupplierRead, hasSupplierWrite } = useSupplierPermissions();
  const location = useLocation();

  if (!user) return null;

  // Define navigation structure with role-based access
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['franchisor', 'franchisee', 'admin', 'user']
    },
    {
      id: 'franchises',
      label: 'Franchise Management',
      href: '/franchises',
      icon: Building2,
      roles: ['franchisor', 'admin'],
      children: [
        {
          id: 'franchise-list',
          label: 'Franchise Brands',
          href: '/franchises',
          icon: Building2,
          roles: ['franchisor', 'admin']
        },
        {
          id: 'franchise-applications',
          label: 'Applications',
          href: '/franchises/applications',
          icon: UserCheck,
          roles: ['franchisor', 'admin']
        },
        {
          id: 'franchise-locations',
          label: 'Locations',
          href: '/franchises/locations',
          icon: Building2,
          roles: ['franchisor', 'admin']
        }
      ]
    },
    {
      id: 'orders',
      label: 'Order Management',
      href: '/orders',
      icon: ShoppingCart,
      roles: ['franchisor', 'franchisee', 'admin', 'user']
    },
    {
      id: 'inventory',
      label: 'Inventory',
      href: '/inventory',
      icon: Package,
      roles: ['franchisor', 'franchisee', 'admin', 'user']
    },
    // Supplier Management - Only visible to franchisors and admins with read access
    ...(hasSupplierRead ? [{
      id: 'suppliers',
      label: 'Supplier Management',
      href: '/suppliers',
      icon: Truck,
      roles: ['franchisor', 'admin'] as const,
      badge: hasSupplierWrite ? undefined : 'Read Only',
      children: [
        {
          id: 'supplier-list',
          label: 'Suppliers',
          href: '/suppliers',
          icon: Truck,
          roles: ['franchisor', 'admin'] as const
        },
        {
          id: 'supplier-products',
          label: 'Supplier Products',
          href: '/suppliers/products',
          icon: Package,
          roles: ['franchisor', 'admin'] as const
        },
        {
          id: 'supplier-contracts',
          label: 'Contracts',
          href: '/suppliers/contracts',
          icon: FileText,
          roles: ['franchisor', 'admin'] as const
        },
        {
          id: 'supplier-performance',
          label: 'Performance',
          href: '/suppliers/performance',
          icon: BarChart3,
          roles: ['franchisor', 'admin'] as const
        },
        {
          id: 'purchase-orders',
          label: 'Purchase Orders',
          href: '/suppliers/purchase-orders',
          icon: ShoppingCart,
          roles: ['franchisor', 'admin'] as const
        }
      ]
    }] : []),
    {
      id: 'financial',
      label: 'Financial Management',
      href: '/financial',
      icon: CreditCard,
      roles: ['franchisor', 'franchisee', 'admin'],
      children: [
        {
          id: 'invoices',
          label: 'Invoices',
          href: '/financial/invoices',
          icon: FileText,
          roles: ['franchisor', 'franchisee', 'admin']
        },
        {
          id: 'payments',
          label: 'Payments',
          href: '/financial/payments',
          icon: CreditCard,
          roles: ['franchisor', 'franchisee', 'admin']
        }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      href: '/analytics',
      icon: BarChart3,
      roles: ['franchisor', 'franchisee', 'admin']
    },
    {
      id: 'users',
      label: 'User Management',
      href: '/users',
      icon: Users,
      roles: ['franchisor', 'admin']
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['franchisor', 'franchisee', 'admin', 'user']
    }
  ];

  // Filter navigation items based on user role
  const filteredNavigation = filterNavigationByRole(navigationItems, user.role);

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200 w-64 min-h-screen">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">FranchiseHub</h2>
        
        {/* User Role Indicator */}
        <div className="mb-4 p-2 bg-gray-50 rounded-md">
          <div className="text-xs text-gray-500">Logged in as</div>
          <div className="text-sm font-medium text-gray-900 capitalize">
            {user.role}
          </div>
          {user.role === 'franchisee' && (
            <div className="text-xs text-blue-600 mt-1">
              Limited supplier access
            </div>
          )}
        </div>

        <ul className="space-y-1">
          {filteredNavigation.map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              currentPath={location.pathname}
              userRole={user.role}
            />
          ))}
        </ul>

        {/* Supplier Access Notice for Franchisees */}
        {user.role === 'franchisee' && (
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <div className="font-medium mb-1">Supplier Information</div>
                <div>
                  Supplier details are managed by your franchisor. 
                  You can place orders for approved products without 
                  seeing supplier information.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

/**
 * Individual navigation item component
 */
const NavigationItem: React.FC<{
  item: NavigationItem;
  currentPath: string;
  userRole: string;
  level?: number;
}> = ({ item, currentPath, userRole, level = 0 }) => {
  const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
  const hasChildren = item.children && item.children.length > 0;
  const [isExpanded, setIsExpanded] = React.useState(isActive);

  const IconComponent = item.icon;

  return (
    <li>
      <div className="flex items-center">
        <Link
          to={item.href}
          className={`
            flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors
            ${level > 0 ? 'ml-4 pl-6' : ''}
            ${isActive 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
              : 'text-gray-700 hover:bg-gray-100'
            }
          `}
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        >
          <IconComponent className="h-4 w-4 mr-3 flex-shrink-0" />
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
      </div>

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <ul className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <NavigationItem
              key={child.id}
              item={child}
              currentPath={currentPath}
              userRole={userRole}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

/**
 * Filter navigation items based on user role
 */
function filterNavigationByRole(
  items: NavigationItem[],
  userRole: 'franchisor' | 'franchisee' | 'admin' | 'user'
): NavigationItem[] {
  return items
    .filter(item => item.roles.includes(userRole))
    .map(item => ({
      ...item,
      children: item.children 
        ? filterNavigationByRole(item.children, userRole)
        : undefined
    }));
}

export default RoleBasedNavigation;
