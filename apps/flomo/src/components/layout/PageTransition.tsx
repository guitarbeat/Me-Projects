import React from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Page transition wrapper that applies smooth enter animations
 * Uses CSS animations for performance and respects prefers-reduced-motion
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
}) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className={`flex-1 flex flex-col animate-page-enter motion-reduce:animate-none ${className}`}
    >
      {children}
    </div>
  );
};
