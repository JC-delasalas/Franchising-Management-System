
import React from 'react';
import { Link } from 'react-router-dom';
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

interface DevPage {
  href: string;
  label: string;
  desc: string;
}

interface DevModeMenuProps {
  devMode: boolean;
  onDevModeChange: (enabled: boolean) => void;
  devPages: DevPage[];
}

export const DevModeMenu: React.FC<DevModeMenuProps> = ({ 
  devMode, 
  onDevModeChange, 
  devPages 
}) => {
  return (
    <div className="flex items-center space-x-6 lg:space-x-8">
      {devMode && (
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Dev Pages</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[400px]">
                  {devPages.map((page) => (
                    <NavigationMenuLink key={page.href} asChild>
                      <Link to={page.href} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">{page.label}</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          {page.desc}
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )}

      <div className="flex items-center space-x-2 ml-4">
        <span className="text-sm text-gray-600">Dev Mode</span>
        <Switch
          checked={devMode}
          onCheckedChange={onDevModeChange}
          aria-label="Toggle development mode"
        />
        {devMode && <Badge variant="outline" className="text-xs">DEV</Badge>}
      </div>
    </div>
  );
};
