import React from 'react';
import { Button as UIButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * @deprecated Use Button from '@/components/ui/button' instead.
 * This wrapper exists for backward compatibility and will be removed in a future version.
 * 
 * Migration guide:
 * - variant 'primary' → 'default'
 * - variant 'secondary' → 'secondary' or 'outline'
 * - variant 'danger' → 'destructive'
 * - size 'small' → 'sm'
 * - size 'medium' → 'default'
 * - size 'large' → 'lg'
 * - fullWidth → add className="w-full"
 * - loading → handle with custom loading state
 * - icon → pass as children with proper spacing
 */
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-4 w-4"
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
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  className,
  ...props
}) => {
  // Show deprecation warning in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'Button from @/components/common/Button is deprecated. Use Button from @/components/ui/button instead.'
      );
    }
  }, []);

  // Map old variants to new variants
  const mappedVariant = React.useMemo(() => {
    switch (variant) {
      case 'primary':
        return 'default';
      case 'secondary':
        return 'outline';
      case 'danger':
        return 'destructive';
      case 'success':
        return 'default'; // No direct mapping, use default with custom class
      case 'warning':
        return 'default'; // No direct mapping, use default with custom class
      case 'info':
        return 'default'; // No direct mapping, use default with custom class
      default:
        return 'default';
    }
  }, [variant]);

  // Map old sizes to new sizes
  const mappedSize = React.useMemo(() => {
    switch (size) {
      case 'small':
        return 'sm';
      case 'large':
        return 'lg';
      default:
        return 'default';
    }
  }, [size]);

  // Custom classes for variants without direct mapping
  const customVariantClass = React.useMemo(() => {
    switch (variant) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'warning':
        return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      default:
        return '';
    }
  }, [variant]);

  const isDisabled = disabled || loading;

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <LoadingSpinner />
          {children}
        </>
      );
    }

    if (icon) {
      return (
        <>
          {iconPosition === 'left' && icon}
          {children}
          {iconPosition === 'right' && icon}
        </>
      );
    }

    return children;
  };

  return (
    <UIButton
      variant={mappedVariant}
      size={mappedSize}
      disabled={isDisabled}
      className={cn(
        fullWidth && 'w-full',
        customVariantClass,
        className
      )}
      {...props}
    >
      {renderContent()}
    </UIButton>
  );
};

export default Button;
