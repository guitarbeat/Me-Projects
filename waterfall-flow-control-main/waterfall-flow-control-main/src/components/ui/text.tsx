import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================
// HEADING COMPONENT
// ============================================

const headingVariants = cva('font-semibold tracking-tight text-balance', {
  variants: {
    level: {
      1: 'text-3xl sm:text-4xl lg:text-5xl leading-tight',
      2: 'text-2xl sm:text-3xl leading-snug',
      3: 'text-xl sm:text-2xl leading-snug',
      4: 'text-lg sm:text-xl leading-normal',
      5: 'text-base sm:text-lg leading-normal',
      6: 'text-sm sm:text-base leading-normal',
    },
    gradient: {
      true: 'bg-clip-text text-transparent bg-gradient-to-r from-primary to-chart-1',
      false: '',
    },
  },
  defaultVariants: {
    level: 2,
    gradient: false,
  },
});

interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 2, gradient, as, children, ...props }, ref) => {
    const Tag = as || (`h${level}` as keyof JSX.IntrinsicElements);

    return React.createElement(
      Tag,
      {
        ref,
        className: cn(headingVariants({ level, gradient }), className),
        ...props,
      },
      children
    );
  }
);
Heading.displayName = 'Heading';

// ============================================
// BODY TEXT COMPONENT
// ============================================

const bodyVariants = cva('leading-relaxed', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
    },
    muted: {
      true: 'text-muted-foreground',
      false: 'text-foreground',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
    },
  },
  defaultVariants: {
    size: 'base',
    muted: false,
    weight: 'normal',
  },
});

interface BodyProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof bodyVariants> {
  as?: 'p' | 'span' | 'div';
}

const Body = React.forwardRef<HTMLParagraphElement, BodyProps>(
  (
    { className, size, muted, weight, as: Tag = 'p', children, ...props },
    ref
  ) => {
    return React.createElement(
      Tag,
      {
        ref,
        className: cn(bodyVariants({ size, muted, weight }), className),
        ...props,
      },
      children
    );
  }
);
Body.displayName = 'Body';

// ============================================
// LABEL COMPONENT
// ============================================

const labelVariants = cva('font-medium', {
  variants: {
    size: {
      xs: 'text-2xs',
      sm: 'text-xs',
      base: 'text-sm',
    },
    variant: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      uppercase: 'uppercase tracking-wider text-muted-foreground',
    },
  },
  defaultVariants: {
    size: 'base',
    variant: 'default',
  },
});

interface TextLabelProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof labelVariants> {}

const TextLabel = React.forwardRef<HTMLSpanElement, TextLabelProps>(
  ({ className, size, variant, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(labelVariants({ size, variant }), className)}
      {...props}
    >
      {children}
    </span>
  )
);
TextLabel.displayName = 'TextLabel';

// ============================================
// MONO TEXT COMPONENT (for numbers/currency)
// ============================================

const monoVariants = cva('font-mono tabular-nums', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    tone: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      success: 'text-success',
      destructive: 'text-destructive',
    },
  },
  defaultVariants: {
    size: 'base',
    weight: 'semibold',
    tone: 'default',
  },
});

interface MonoProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof monoVariants> {}

const Mono = React.forwardRef<HTMLSpanElement, MonoProps>(
  ({ className, size, weight, tone, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(monoVariants({ size, weight, tone }), className)}
      {...props}
    >
      {children}
    </span>
  )
);
Mono.displayName = 'Mono';

export {
  Heading,
  Body,
  TextLabel,
  Mono,
  headingVariants,
  bodyVariants,
  labelVariants,
  monoVariants,
};
