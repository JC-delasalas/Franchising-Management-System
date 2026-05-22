
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { UserCircle, LogIn, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface HeaderProps {
  showAuthButtons?: boolean;
}

const Header = ({ showAuthButtons = true }: HeaderProps) => {
  const { isAuthenticated, user, role } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo size="md" />

          {showAuthButtons && (
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                // Show user info and logout when authenticated
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{user?.email}</span>
                    <span className="text-xs text-gray-500 ml-1">({role})</span>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={role === 'franchisor' ? '/franchisor-dashboard' : '/franchisee-dashboard'}>
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                // Show login/signup when not authenticated
                <div className="flex items-center space-x-4">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/login">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Link to="/signup">
                      <UserCircle className="w-4 h-4 mr-2" />
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
