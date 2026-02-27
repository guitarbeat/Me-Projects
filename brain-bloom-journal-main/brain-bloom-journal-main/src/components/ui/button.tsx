import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-2xl",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-2xl",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-2xl",
        link: "text-primary underline-offset-4 hover:underline rounded-2xl",
        newsprint: "bg-newsprint-foreground text-newsprint-bg border border-transparent hover:bg-newsprint-bg hover:text-newsprint-foreground hover:border-newsprint-foreground sharp-corners uppercase tracking-widest min-h-[44px] min-w-[44px]",
        "newsprint-outline": "border border-newsprint-foreground bg-transparent hover:bg-newsprint-foreground hover:text-newsprint-bg sharp-corners uppercase tracking-widest min-h-[44px] min-w-[44px]",
        "newsprint-ghost": "hover:bg-newsprint-muted hover:text-newsprint-foreground sharp-corners min-h-[44px] min-w-[44px]",
        "newsprint-link": "text-newsprint-foreground underline-offset-4 decoration-2 decoration-newsprint-accent hover:underline sharp-corners",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-2xl px-3",
        lg: "h-11 rounded-2xl px-8",
        icon: "h-10 w-10",
        "newsprint-sm": "h-9 px-3 sharp-corners",
        "newsprint-lg": "h-11 px-8 sharp-corners",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || disabled}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
