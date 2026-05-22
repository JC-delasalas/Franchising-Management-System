
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface EnhancedLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const EnhancedLoadingSpinner: React.FC<EnhancedLoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  label = 'Loading content' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center justify-center" role="status" aria-label={label}>
      <Loader2 
        className={cn(
          'animate-spin text-blue-600',
          sizeClasses[size],
          className
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

interface CardSkeletonProps {
  className?: string;
  showImage?: boolean;
  lines?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  className,
  showImage = true,
  lines = 3
}) => {
  return (
    <div className={cn('p-6 space-y-4', className)} role="status" aria-label="Loading card content">
      {showImage && (
        <Skeleton className="h-48 w-full rounded-lg" />
      )}
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton 
            key={index}
            className={cn(
              'h-4',
              index === lines - 1 ? 'w-1/2' : 'w-full'
            )}
          />
        ))}
      </div>
      <span className="sr-only">Loading card content</span>
    </div>
  );
};

interface PackageSkeletonProps {
  className?: string;
}

export const PackageSkeleton: React.FC<PackageSkeletonProps> = ({ className }) => {
  return (
    <div className={cn('border rounded-lg p-6 space-y-4', className)} role="status" aria-label="Loading package information">
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-8 mx-auto rounded-full" />
        <Skeleton className="h-6 w-24 mx-auto" />
        <Skeleton className="h-8 w-20 mx-auto" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
      <span className="sr-only">Loading package information</span>
    </div>
  );
};

interface TestimonialSkeletonProps {
  className?: string;
}

export const TestimonialSkeleton: React.FC<TestimonialSkeletonProps> = ({ className }) => {
  return (
    <div className={cn('p-6 space-y-4', className)} role="status" aria-label="Loading testimonial">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex space-x-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-4" />
        ))}
      </div>
      <Skeleton className="h-16 w-full" />
      <span className="sr-only">Loading testimonial</span>
    </div>
  );
};

interface PageSkeletonProps {
  title?: string;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ 
  title = 'Loading page content'
}) => {
  return (
    <div className="min-h-screen bg-gray-50" role="status" aria-label={title}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section Skeleton */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <div className="flex space-x-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
};

export default {
  EnhancedLoadingSpinner,
  CardSkeleton,
  PackageSkeleton,
  TestimonialSkeleton,
  PageSkeleton
};
