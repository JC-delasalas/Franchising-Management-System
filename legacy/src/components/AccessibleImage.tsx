
import React from 'react';

interface AccessibleImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
}

const AccessibleImage: React.FC<AccessibleImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  width,
  height
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      width={width}
      height={height}
      decoding="async"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
      }}
    />
  );
};

export default AccessibleImage;
