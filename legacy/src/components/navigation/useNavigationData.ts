
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthorization } from '@/contexts/AuthorizationContext';

export const useNavigationData = () => {
  const location = useLocation();
  const { user } = useAuth();
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

  return { 
    navigationLinks
  };
};
