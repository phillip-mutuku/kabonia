import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
  text?: string;
}

export const Loader = ({ size = 'md', color = 'primary', className = '', text }: LoaderProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    white: 'text-white',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {text && <p className={`mt-2 text-sm font-medium ${colorClasses[color]}`}>{text}</p>}
    </div>
  );
};

interface PageLoaderProps {
  text?: string;
}

export const PageLoader = ({ text = 'Loading...' }: PageLoaderProps) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div className="text-center">
        <Loader size="lg" color="primary" />
        <p className="mt-4 text-primary-500 font-medium">{text}</p>
      </div>
    </div>
  );
};

interface ContentLoaderProps {
  text?: string;
  className?: string;
}

export const ContentLoader = ({ text = 'Loading...', className = '' }: ContentLoaderProps) => {
  return (
    <div className={`w-full py-12 flex items-center justify-center ${className}`}>
      <div className="text-center">
        <Loader size="md" color="primary" />
        <p className="mt-2 text-primary-500 font-medium">{text}</p>
      </div>
    </div>
  );
};