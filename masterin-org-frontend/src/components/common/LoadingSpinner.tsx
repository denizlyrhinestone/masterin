"use client";

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string; // e.g., 'border-sky-600', 'border-white'
  className?: string; // Additional classes
  screenReaderText?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'border-sky-600 dark:border-sky-400',
  className = '',
  screenReaderText = 'Loading...',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4', // Default size in many existing uses
    lg: 'h-16 w-16 border-4',
    xl: 'h-24 w-24 border-[5px]',
  };

  return (
    <div role="status" aria-live="polite" className={`flex justify-center items-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-dashed ${sizeClasses[size]} ${color} border-t-transparent`}
      />
      {screenReaderText && <span className="sr-only">{screenReaderText}</span>}
    </div>
  );
};

export default LoadingSpinner;
