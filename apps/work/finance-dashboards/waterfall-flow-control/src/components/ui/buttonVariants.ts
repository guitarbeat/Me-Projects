import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm active:scale-[0.97] transition-transform',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm active:scale-[0.97] transition-transform',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-[0.97] transition-transform',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.97] transition-transform',
        ghost:
          'hover:bg-accent hover:text-accent-foreground active:scale-[0.97] transition-transform',
        link: 'text-primary underline-offset-4 hover:underline',
        success:
          'bg-success text-success-foreground hover:bg-success/90 shadow-sm active:scale-[0.97] transition-transform',
        glass:
          'bg-card/80 backdrop-blur-xl border border-border/50 hover:bg-card/90 active:scale-[0.97] transition-transform',
        gradient:
          'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl active:scale-[0.97] transition-transform',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
