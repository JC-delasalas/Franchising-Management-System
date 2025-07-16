
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, PlusCircle, ArrowUp, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  showUpgrade: boolean;
  onToggleUpgrade: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  showUpgrade,
  onToggleUpgrade
}) => {
  const { user } = useAuth();

  const firstName = user?.full_name?.split(' ')[0] || 'User';

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {firstName}!</h1>
        <p className="text-gray-600">
          {user?.role === 'franchisee' ? 'Franchisee Dashboard' : 'Franchisor Dashboard'}
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleUpgrade}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none hover:from-purple-700 hover:to-pink-700"
        >
          <ArrowUp className="w-4 h-4 mr-2" />
          Upgrade Package
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/franchisee/support-requests">
            <Bell className="w-4 h-4 mr-2" />
            Support
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/franchisee/sales-upload">
            <PlusCircle className="w-4 h-4 mr-2" />
            Upload Sales
          </Link>
        </Button>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profile_picture_url} alt={user?.full_name} />
                <AvatarFallback>
                  {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
