import React from 'react';
import { Card as UICard } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * @deprecated Use Card from '@/components/ui/card' instead.
 * This wrapper exists for backward compatibility and will be removed in a future version.
 * 
 * Migration guide:
 * - variant 'default' → use Card directly
 * - variant 'glass' → add custom className with backdrop-blur
 * - variant 'elevated' → add custom className with shadow
 * - variant 'outlined' → add className="border-2"
 * - padding → use CardContent with custom padding classes
 * - hoverable → add className="hover:-translate-y-1 transition-transform cursor-pointer"
 * 
 * For structured cards, use CardHeader, CardTitle, CardDescription, CardContent, CardFooter
 */
export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  className,
  style,
  onClick,
  hoverable = false,
  ...props
}) => {
  // Show deprecation warning in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'Card from @/components/common/Card is deprecated. Use Card from @/components/ui/card instead.'
      );
    }
  }, []);

  // Map variant to classes
  const variantClass = React.useMemo(() => {
    switch (variant) {
      case 'glass':
        return 'bg-background/80 backdrop-blur-lg border-white/10 shadow-2xl';
      case 'elevated':
        return 'shadow-lg';
      case 'outlined':
        return 'border-2 border-primary';
      default:
        return '';
    }
  }, [variant]);

  // Map padding to classes
  const paddingClass = React.useMemo(() => {
    switch (padding) {
      case 'none':
        return 'p-0';
      case 'small':
        return 'p-3';
      case 'large':
        return 'p-8';
      default:
        return 'p-5';
    }
  }, [padding]);

  // Hoverable classes
  const hoverClass = (onClick || hoverable) 
    ? 'hover:-translate-y-1 transition-transform cursor-pointer' 
    : '';

  return (
    <UICard
      className={cn(
        variantClass,
        paddingClass,
        hoverClass,
        className
      )}
      style={style}
      onClick={onClick}
      {...props}
    >
      {children}
    </UICard>
  );
};

export default Card;
