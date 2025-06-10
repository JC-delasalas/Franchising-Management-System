
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import Logo from '@/components/Logo';
import { Menu } from 'lucide-react';

interface NavigationLink {
  href: string;
  label: string;
  isRoute?: boolean;
}

interface DevPage {
  href: string;
  label: string;
  desc: string;
}

interface MobileMenuProps {
  navigationLinks: NavigationLink[];
  devPages: DevPage[];
  devMode: boolean;
  onDevModeChange: (enabled: boolean) => void;
  onNavClick: (href: string, isRoute: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  navigationLinks,
  devPages,
  devMode,
  onDevModeChange,
  onNavClick,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const location = useLocation();

  return (
    <div className="md:hidden flex items-center space-x-2">
      <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs px-3">
        <Link to="/apply">Apply</Link>
      </Button>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]" aria-label="Mobile navigation menu">
          <div className="flex flex-col space-y-4 mt-8">
            <div className="mb-6">
              <Logo size="md" clickable={false} />
            </div>

            <nav className="flex flex-col space-y-4" aria-label="Mobile navigation links">
              {navigationLinks.map((link) => (
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`text-lg font-medium hover:text-blue-600 transition-colors py-2 px-4 rounded-md ${
                      location.pathname === link.href 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-900'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={location.pathname === link.href ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors py-2 px-4 rounded-md"
                    onClick={() => {
                      onNavClick(link.href, false);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {link.label}
                  </a>
                )
              ))}
            </nav>

            {devMode && (
              <div className="border-t pt-4 mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Development Pages</h3>
                <div className="flex flex-col space-y-2">
                  {devPages.map((page) => (
                    <Link
                      key={page.href}
                      to={page.href}
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors py-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {page.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dev Mode</span>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={devMode}
                    onCheckedChange={onDevModeChange}
                    aria-label="Toggle development mode"
                  />
                  {devMode && <Badge variant="outline" className="text-xs">DEV</Badge>}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
