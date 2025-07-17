import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

const SimpleNavigation: React.FC = () => {
  const { isAuthenticated, user, role } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo size="md" />

          {/* Simple Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link 
              to="/#brands" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Brands
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Contact
            </Link>
            <Link 
              to="/blog" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Blog
            </Link>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3 ml-4">
              {isAuthenticated ? (
                // Show user info and logout when authenticated
                <>
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
                </>
              ) : (
                // Show login/signup when not authenticated
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link to="/apply">Apply Now</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            {isAuthenticated ? (
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Link to={role === 'franchisor' ? '/franchisor-dashboard' : '/franchisee-dashboard'}>
                  Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Link to="/apply">Apply</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavigation;
