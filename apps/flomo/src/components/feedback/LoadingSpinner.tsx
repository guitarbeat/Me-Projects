import React from 'react';
import { Loader2, Heart } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'default' | 'hearts';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Loading...',
  variant = 'default',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  if (variant === 'hearts') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <Heart
            className={`${sizeClasses[size]} text-rose-pink animate-pulse`}
          />
          <Heart
            className={`${sizeClasses[size]} text-coral absolute inset-0 animate-ping opacity-75`}
          />
        </div>
        {text && (
          <p
            className={`${textSizes[size]} font-quicksand text-gray-600 dark:text-gray-400 text-center`}
          >
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className={`${sizeClasses[size]} text-rose-pink animate-spin`} />
      {text && (
        <p
          className={`${textSizes[size]} font-quicksand text-gray-600 dark:text-gray-400 text-center`}
        >
          {text}
        </p>
      )}
    </div>
  );
};
