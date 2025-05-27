
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Logo from '@/components/Logo';
import { Menu, X } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

const Navigation = () => {
  const [devMode, setDevMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = (href: string, isRoute: boolean) => {
    if (!isRoute && location.pathname !== '/') {
      // If we're not on homepage and clicking an anchor link, go to homepage first
      window.location.href = `/${href}`;
    }
  };

  const navigationLinks = [
    { href: "#brands", label: "Brands" },
    { href: "#packages", label: "Packages" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "/blog", label: "Blog", isRoute: true },
    { href: "/contact", label: "Contact", isRoute: true }
  ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo size="md" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              link.isRoute ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => handleNavClick(link.href, false)}
                  className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded transition-colors"
                >
                  {link.label}
                </a>
              )
            ))}

            {devMode && (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Dev Pages</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-4 w-[400px]">
                        <NavigationMenuLink asChild>
                          <Link to="/franchisor-dashboard" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Franchisor Dashboard</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Manage franchise applications and inventory
                            </p>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/franchisee-dashboard" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Franchisee Dashboard</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              View your franchise performance and milestones
                            </p>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/franchisee-training" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Training Portal</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Access training materials and progress
                            </p>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/brand/siomai-king" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Brand Microsite</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              View brand-specific information
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            )}

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Dev Mode</span>
              <Switch
                checked={devMode}
                onCheckedChange={setDevMode}
                aria-label="Toggle development mode"
              />
              {devMode && <Badge variant="outline" className="text-xs">DEV</Badge>}
            </div>

            <Button asChild className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
              <Link to="/apply">Apply Now</Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/apply">Apply</Link>
            </Button>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="mb-6">
                    <Logo size="md" clickable={false} />
                  </div>

                  <nav className="flex flex-col space-y-4">
                    {navigationLinks.map((link) => (
                      link.isRoute ? (
                        <Link
                          key={link.href}
                          to={link.href}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors py-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          key={link.href}
                          href={link.href}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors py-2"
                          onClick={() => {
                            handleNavClick(link.href, false);
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
                        <Link
                          to="/franchisor-dashboard"
                          className="text-sm text-gray-600 hover:text-blue-600 transition-colors py-1"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Franchisor Dashboard
                        </Link>
                        <Link
                          to="/franchisee-dashboard"
                          className="text-sm text-gray-600 hover:text-blue-600 transition-colors py-1"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Franchisee Dashboard
                        </Link>
                        <Link
                          to="/franchisee-training"
                          className="text-sm text-gray-600 hover:text-blue-600 transition-colors py-1"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Training Portal
                        </Link>
                        <Link
                          to="/brand/siomai-king"
                          className="text-sm text-gray-600 hover:text-blue-600 transition-colors py-1"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Brand Microsite
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 mt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Dev Mode</span>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={devMode}
                          onCheckedChange={setDevMode}
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
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
