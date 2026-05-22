import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
}

// Image optimization utility
const getOptimizedImageUrl = (src: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}) => {
  // If it's a Supabase storage URL, we can add transformation parameters
  if (src.includes('supabase.co/storage')) {
    const url = new URL(src);
    if (options.width) url.searchParams.set('width', options.width.toString());
    if (options.height) url.searchParams.set('height', options.height.toString());
    if (options.quality) url.searchParams.set('quality', options.quality.toString());
    if (options.format) url.searchParams.set('format', options.format);
    return url.toString();
  }
  
  // For other URLs, return as-is (could integrate with image CDN here)
  return src;
};

// Generate responsive image sources
const generateSrcSet = (src: string, sizes: number[]) => {
  return sizes
    .map(size => `${getOptimizedImageUrl(src, { width: size, format: 'webp' })} ${size}w`)
    .join(', ');
};

// Intersection Observer hook for lazy loading
const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [elementRef, options]);
  
  return isIntersecting;
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  onLoad,
  onError,
  className,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use intersection observer for lazy loading (unless priority is true)
  const isInView = useIntersectionObserver(containerRef, {
    threshold: 0.1,
    rootMargin: '50px',
  });
  
  const shouldLoad = priority || isInView;
  
  useEffect(() => {
    if (shouldLoad && !currentSrc && !hasError) {
      // Generate optimized image URL
      const optimizedSrc = getOptimizedImageUrl(src, {
        width,
        height,
        quality,
        format: 'webp',
      });
      setCurrentSrc(optimizedSrc);
    }
  }, [shouldLoad, src, width, height, quality, currentSrc, hasError]);
  
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };
  
  const handleError = () => {
    setHasError(true);
    onError?.();
  };
  
  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || (width ? `${width}px` : '100vw');
  
  // Generate srcSet for responsive images
  const srcSet = width 
    ? generateSrcSet(src, [width * 0.5, width, width * 1.5, width * 2].map(Math.round))
    : undefined;
  
  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        !isLoaded && 'animate-pulse bg-muted',
        className
      )}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!isLoaded && placeholder === 'blur' && blurDataURL && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      {shouldLoad && currentSrc && !hasError && (
        <img
          ref={imgRef}
          src={currentSrc}
          srcSet={srcSet}
          sizes={responsiveSizes}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...props}
        />
      )}
      
      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}
      
      {/* Loading indicator */}
      {shouldLoad && currentSrc && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

// Avatar component with optimized loading
export const OptimizedAvatar: React.FC<{
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}> = ({ src, alt, size = 'md', fallback, className }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };
  
  const sizePixels = {
    sm: 32,
    md: 40,
    lg: 64,
    xl: 96,
  };
  
  if (!src) {
    return (
      <div
        className={cn(
          'rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium',
          sizeClasses[size],
          className
        )}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }
  
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={sizePixels[size]}
      height={sizePixels[size]}
      className={cn('rounded-full', sizeClasses[size], className)}
      priority={size === 'xl'} // Prioritize larger avatars
    />
  );
};

// Product image component with specific optimizations
export const ProductImage: React.FC<{
  src: string;
  alt: string;
  size?: 'thumbnail' | 'card' | 'detail';
  className?: string;
}> = ({ src, alt, size = 'card', className }) => {
  const sizeConfig = {
    thumbnail: { width: 80, height: 80 },
    card: { width: 300, height: 300 },
    detail: { width: 600, height: 600 },
  };
  
  const config = sizeConfig[size];
  
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={config.width}
      height={config.height}
      quality={size === 'detail' ? 90 : 75}
      className={cn('aspect-square', className)}
      sizes={
        size === 'thumbnail' 
          ? '80px'
          : size === 'card'
          ? '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
          : '(max-width: 768px) 100vw, 50vw'
      }
    />
  );
};

export default OptimizedImage;
