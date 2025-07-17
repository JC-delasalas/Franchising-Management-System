import React from 'react';

interface ErrorPageLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ErrorPageLogo: React.FC<ErrorPageLogoProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src="/logo.svg" 
        alt="FranchiseHub Logo" 
        className={`${sizeClasses[size]} object-contain opacity-50`}
        loading="eager"
      />
    </div>
  );
};

export default ErrorPageLogo;
