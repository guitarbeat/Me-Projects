import * as React from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface StaggerProps {
  /** Delay between each child's animation in milliseconds */
  delay?: number;
  /** Base duration for each animation in milliseconds */
  duration?: number;
  /** Animation type */
  animation?:
    | 'fade-up'
    | 'fade-in'
    | 'scale-in'
    | 'slide-in-right'
    | 'slide-in-left';
  /** Additional className for the container */
  className?: string;
  /** Children to stagger animate */
  children: React.ReactNode;
  /** Whether to trigger animations (useful for intersection observer) */
  animate?: boolean;
}

/**
 * Stagger - Coordinates entry animations for child elements
 *
 * Wraps children and automatically applies staggered animation delays.
 * Respects user's reduced motion preferences.
 *
 * @example
 * <Stagger delay={50}>
 *   <Surface>Card 1</Surface>
 *   <Surface>Card 2</Surface>
 *   <Surface>Card 3</Surface>
 * </Stagger>
 */
export const Stagger = ({
  delay = 50,
  duration = 400,
  animation = 'fade-up',
  className,
  children,
  animate = true,
}: StaggerProps) => {
  const prefersReducedMotion = useReducedMotion();

  const animationClass = {
    'fade-up': 'animate-fade-up',
    'fade-in': 'animate-fade-in',
    'scale-in': 'animate-scale-in',
    'slide-in-right': 'animate-slide-in-right',
    'slide-in-left': 'animate-slide-in-left',
  }[animation];

  const staggeredChildren = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;

    const staggerDelay = prefersReducedMotion ? 0 : delay * index;
    const animDuration = prefersReducedMotion ? 0 : duration;

    return React.cloneElement(
      child as React.ReactElement<{
        className?: string;
        style?: React.CSSProperties;
      }>,
      {
        className: cn(
          (child.props as { className?: string }).className,
          animate && !prefersReducedMotion && animationClass,
          animate && 'opacity-0 animate-fill-forwards'
        ),
        style: {
          ...(child.props as { style?: React.CSSProperties }).style,
          animationDelay: animate ? `${staggerDelay}ms` : undefined,
          animationDuration: animate ? `${animDuration}ms` : undefined,
          '--stagger-index': index,
        } as React.CSSProperties,
      }
    );
  });

  return <div className={className}>{staggeredChildren}</div>;
};

/**
 * StaggerItem - Individual item in a stagger animation sequence
 *
 * Use when you need more control over individual items.
 */
interface StaggerItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  delay?: number;
  animation?: 'fade-up' | 'fade-in' | 'scale-in';
}

export const StaggerItem = React.forwardRef<HTMLDivElement, StaggerItemProps>(
  (
    {
      index,
      delay = 50,
      animation = 'fade-up',
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion();

    const animationClass = {
      'fade-up': 'animate-fade-up',
      'fade-in': 'animate-fade-in',
      'scale-in': 'animate-scale-in',
    }[animation];

    return (
      <div
        ref={ref}
        className={cn(
          !prefersReducedMotion && animationClass,
          !prefersReducedMotion && 'opacity-0 animate-fill-forwards',
          className
        )}
        style={{
          ...style,
          animationDelay: prefersReducedMotion
            ? undefined
            : `${delay * index}ms`,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
StaggerItem.displayName = 'StaggerItem';
