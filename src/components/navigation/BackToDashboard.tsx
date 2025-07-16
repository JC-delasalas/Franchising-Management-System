import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackToDashboardProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  showText?: boolean;
  customText?: string;
  position?: 'top-left' | 'top-right' | 'inline';
}

export const BackToDashboard: React.FC<BackToDashboardProps> = ({
  className,
  variant = 'outline',
  size = 'sm',
  showIcon = true,
  showText = true,
  customText,
  position = 'inline'
}) => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const getDashboardRoute = () => {
    return role === 'franchisor' ? '/franchisor-dashboard' : '/franchisee-dashboard';
  };

  const handleClick = () => {
    navigate(getDashboardRoute());
  };

  const buttonText = customText || 'Back to Dashboard';

  const positionClasses = {
    'top-left': 'fixed top-4 left-4 z-50',
    'top-right': 'fixed top-4 right-4 z-50',
    'inline': ''
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        positionClasses[position],
        'flex items-center space-x-2',
        className
      )}
    >
      {showIcon && <ArrowLeft className="w-4 h-4" />}
      {showText && <span>{buttonText}</span>}
    </Button>
  );
};

// Breadcrumb version for more complex navigation
interface BreadcrumbBackToDashboardProps {
  currentPage: string;
  className?: string;
}

export const BreadcrumbBackToDashboard: React.FC<BreadcrumbBackToDashboardProps> = ({
  currentPage,
  className
}) => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const getDashboardRoute = () => {
    return role === 'franchisor' ? '/franchisor-dashboard' : '/franchisee-dashboard';
  };

  const getDashboardName = () => {
    return role === 'franchisor' ? 'Franchisor Dashboard' : 'Franchisee Dashboard';
  };

  return (
    <nav className={cn('flex items-center space-x-2 text-sm text-gray-600', className)}>
      <button
        onClick={() => navigate(getDashboardRoute())}
        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>{getDashboardName()}</span>
      </button>
      <span>/</span>
      <span className="text-gray-900 font-medium">{currentPage}</span>
    </nav>
  );
};

// Header component with back button and page title
interface PageHeaderWithBackProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeaderWithBack: React.FC<PageHeaderWithBackProps> = ({
  title,
  subtitle,
  children,
  className
}) => {
  return (
    <div className={cn('mb-8', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BackToDashboard />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {children && (
          <div className="flex items-center space-x-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackToDashboard;
