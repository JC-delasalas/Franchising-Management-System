
import { useLocation } from 'react-router-dom';
import { getCurrentUser } from '@/services/authService';
import { useAuthorization } from '@/contexts/AuthorizationContext';

export const useNavigationData = () => {
  const location = useLocation();
  const user = getCurrentUser();
  const { canAccessIAM } = useAuthorization();

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
    { href: '/franchisor-dashboard', label: 'Franchisor Dashboard' },
    { href: '/franchisee-dashboard', label: 'Franchisee Dashboard' },
    { href: '/franchisor-analytics', label: 'Franchisor Analytics' },
    { href: '/franchisee-analytics', label: 'Franchisee Analytics' },
    { href: '/franchisee-training', label: 'Franchisee Training' },
    { href: '/franchisee/sales-upload', label: 'Sales Upload' },
    { href: '/franchisee/inventory-order', label: 'Inventory Order' },
    { href: '/franchisee/marketing-assets', label: 'Marketing Assets' },
    { href: '/franchisee/contract-package', label: 'Contract Package' },
    { href: '/franchisee/support-requests', label: 'Support Requests' },
    ...(canAccessIAM ? [{ href: '/iam-management', label: 'IAM Management' }] : [])
  ];

  return { navigationLinks, devPages };
};
