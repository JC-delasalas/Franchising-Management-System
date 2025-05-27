import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin',
        sizeClasses[size],
        className
      )} 
    />
  );
};

interface PageLoadingProps {
  message?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
};

interface ButtonLoadingProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({ 
  children, 
  loading = false,
  className 
}) => {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {loading && <LoadingSpinner size="sm" />}
      <span>{children}</span>
    </div>
  );
};

interface CardLoadingProps {
  lines?: number;
  className?: string;
}

export const CardLoading: React.FC<CardLoadingProps> = ({ 
  lines = 3,
  className 
}) => {
  return (
    <div className={cn('animate-pulse space-y-3', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index}
          className={cn(
            'h-4 bg-gray-200 rounded',
            index === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

interface TableLoadingProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableLoading: React.FC<TableLoadingProps> = ({ 
  rows = 5,
  columns = 4,
  className 
}) => {
  return (
    <div className={cn('animate-pulse space-y-3', className)}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex}
              className="h-4 bg-gray-200 rounded flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

interface FullPageLoadingProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

export const FullPageLoading: React.FC<FullPageLoadingProps> = ({
  title = 'FranchiseHub',
  subtitle = 'Loading your franchise management platform...',
  showLogo = true
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {showLogo && (
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold text-xl">FH</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        
        <div className="mb-6">
          <LoadingSpinner size="lg" className="mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{subtitle}</p>
        </div>
        
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default {
  LoadingSpinner,
  PageLoading,
  ButtonLoading,
  CardLoading,
  TableLoading,
  FullPageLoading
};
