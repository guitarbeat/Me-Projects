import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium font-quicksand ring-offset-background focus-ring press-effect disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm',
        soft: 'bg-secondary/60 text-foreground shadow-soft hover:bg-secondary/80',
        elevated:
          'bg-card text-card-foreground shadow-card border border-border',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline !transform-none',
      },
      size: {
        default: 'h-10 px-4 py-2 min-h-[44px]',
        sm: 'h-9 rounded-md px-3 min-h-[36px]',
        lg: 'h-11 rounded-md px-8 min-h-[48px]',
        icon: 'h-10 w-10 min-h-[44px] min-w-[44px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isLoading || props.disabled}
        ref={ref}
        {...props}
      >
        {isLoading && !asChild && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

// * Gradient Button Variants - Unified Brand Treatment
const gradientVariants = {
  coral:
    'bg-gradient-to-r from-coral to-rose-pink hover:from-rose-pink hover:to-coral text-white',
  red: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white',
  lavender:
    'bg-secondary/80 hover:bg-secondary text-foreground dark:bg-primary/20 dark:hover:bg-primary/30 dark:text-primary-foreground',
};

// * Gradient Button Component
interface GradientButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  'variant'
> {
  variant?: 'coral' | 'red' | 'lavender';
  children: React.ReactNode;
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant = 'coral', children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          gradientVariants[variant],
          'font-semibold rounded-full shadow-md hover:shadow-lg motion-slow interactive',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

GradientButton.displayName = 'GradientButton';

export { Button, GradientButton };
