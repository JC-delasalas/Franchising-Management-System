
import React from 'react';
import { Link } from 'react-router-dom';
import { config } from '@/config/environment';

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
      <img
        src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏪</text></svg>"
        alt={`${config.app.name} Logo`}
        className={sizeClasses[size]}
      />
      {showText && (
        <span className={`font-bold ${className?.includes('text-white') ? 'text-white' : 'text-gray-900'} ${textSizeClasses[size]}`}>
          {config.app.name}
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
