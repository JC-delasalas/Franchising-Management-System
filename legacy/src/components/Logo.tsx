
import React from 'react';
import { Link } from 'react-router-dom';

// Fallback config to prevent import issues
const appConfig = {
  app: {
    name: 'FranchiseHub'
  }
};

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  to?: string;
}

const Logo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
  clickable = true,
  to = '/'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const logoContent = (
    <div className={`flex items-center space-x-2 ${clickable ? 'hover:opacity-80 transition-opacity' : ''}`}>
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <img
          src="/logo-simple.svg"
          alt="FranchiseHub Logo"
          className={`${sizeClasses[size]} object-contain`}
          loading="eager"
        />
      </div>
      {showText && (
        <span className={`font-bold ${className?.includes('text-white') ? 'text-white' : 'text-gray-900'} ${textSizeClasses[size]}`}>
          {appConfig.app.name}
        </span>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link
        to={to}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
        aria-label={`Go to ${to === '/' ? 'homepage' : to}`}
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;
