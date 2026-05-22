
import React, { useState, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { NavigationLinks } from '@/components/navigation/NavigationLinks';
import { MobileMenu } from '@/components/navigation/MobileMenu';
import { useNavigationData } from '@/components/navigation/useNavigationData';

const Navigation = React.memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { navigationLinks } = useNavigationData();

  const handleNavClick = useCallback((href: string, isRoute: boolean) => {
    if (!isRoute && location.pathname !== '/') {
      window.location.href = `/${href}`;
    }
  }, [location.pathname]);

  const memoizedNavigationLinks = useMemo(() => navigationLinks, [navigationLinks]);

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo size="md" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <NavigationLinks 
              links={memoizedNavigationLinks}
              onNavClick={handleNavClick}
            />

            <Button asChild className="bg-blue-600 hover:bg-blue-700 ml-4">
              <Link to="/apply">Apply Now</Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <MobileMenu 
            navigationLinks={memoizedNavigationLinks}
            onNavClick={handleNavClick}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        </div>
      </div>
    </nav>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;
