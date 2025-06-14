
import { useLocation } from 'react-router-dom';
import { getCurrentUser } from '@/services/authService';
import { useAuthorization } from '@/contexts/AuthorizationContext';

export const useNavigationData = () => {
  const location = useLocation();
  const user = getCurrentUser();
  const { canAccessIAM, isLoading, error } = useAuthorization();

  const navigationLinks = [
    { 
      href: '/#how-it-works', 
      label: 'How It Works', 
      isRoute: false,
      show: location.pathname === '/'
    },
    { 
      href: '/#success-stories', 
      label: 'Success Stories', 
      isRoute: false,
      show: location.pathname === '/'
    },
    { 
      href: '/blog', 
      label: 'Blog', 
      isRoute: true,
      show: true
    },
    { 
      href: '/contact', 
      label: 'Contact', 
      isRoute: true,
      show: true
    }
  ].filter(link => link.show);

  const devPages = [
    { href: '/franchisor-dashboard', label: 'Franchisor Dashboard', desc: 'Main dashboard for franchise owners' },
    { href: '/franchisee-dashboard', label: 'Franchisee Dashboard', desc: 'Main dashboard for franchisees' },
    { href: '/franchisor-analytics', label: 'Franchisor Analytics', desc: 'Analytics and reporting for franchisors' },
    { href: '/franchisee-analytics', label: 'Franchisee Analytics', desc: 'Analytics and reporting for franchisees' },
    { href: '/franchisee-training', label: 'Franchisee Training', desc: 'Training modules and resources' },
    { href: '/franchisee/sales-upload', label: 'Sales Upload', desc: 'Upload and manage sales data' },
    { href: '/franchisee/inventory-order', label: 'Inventory Order', desc: 'Place and manage inventory orders' },
    { href: '/franchisee/marketing-assets', label: 'Marketing Assets', desc: 'Access marketing materials and assets' },
    { href: '/franchisee/contract-package', label: 'Contract Package', desc: 'View and manage contract packages' },
    { href: '/franchisee/support-requests', label: 'Support Requests', desc: 'Submit and track support requests' },
    // Only include IAM if user has access and no authorization error
    ...(canAccessIAM && !error ? [{ href: '/iam-management', label: 'IAM Management', desc: 'Identity and access management' }] : [])
  ];

  return { 
    navigationLinks, 
    devPages, 
    authorizationStatus: {
      isLoading,
      error,
      hasAccess: canAccessIAM
    }
  };
};
