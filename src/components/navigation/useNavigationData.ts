
import { useLocation } from 'react-router-dom';

export const useNavigationData = () => {
  const location = useLocation();

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
