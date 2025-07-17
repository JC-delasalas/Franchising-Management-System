import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

const SimpleNavigation: React.FC = () => {
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
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Link to="/signup">Sign Up</Link>
              </Button>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link to="/apply">Apply Now</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/apply">Apply</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavigation;
