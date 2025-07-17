import React from 'react';

interface LoadingScreenProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  size = 'lg' 
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center space-y-6">
        {/* Animated Logo */}
        <div className="relative">
          <img 
            src="/logo.svg" 
            alt="FranchiseHub Logo" 
            className={`${sizeClasses[size]} object-contain animate-pulse`}
            loading="eager"
          />
          {/* Spinning ring around logo */}
          <div className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-red-400 rounded-full animate-spin`}></div>
        </div>
        
        {/* Loading message */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">FranchiseHub</h2>
          <p className="text-gray-600">{message}</p>
        </div>
        
        {/* Loading dots */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
