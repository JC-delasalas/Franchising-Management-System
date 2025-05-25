
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏪</text></svg>" 
              alt="FranchiseHub Logo" 
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-gray-900">FranchiseHub</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#brands" className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded">Brands</a>
            <a href="#packages" className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded">Packages</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded">How It Works</a>
            <Link to="/contact" className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded">Contact</Link>
            
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
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
