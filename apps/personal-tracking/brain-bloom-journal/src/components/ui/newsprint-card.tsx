import * as React from "react"
import { cn } from "@/lib/utils"

const NewsprintCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "article" | "column" | "hover" | "inverted" | "curl" | "fold" | "clipping" | "stack"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantStyles = {
    default: "bg-newsprint-bg border border-newsprint-border p-6",
    article: "bg-newsprint-bg border border-newsprint-border p-6 hover:bg-newsprint-neutral-100 transition-colors duration-200",
    column: "bg-newsprint-bg border-r border-b border-newsprint-border p-6",
    hover: "bg-newsprint-bg border border-newsprint-border p-6 hard-shadow-hover",
    inverted: "bg-newsprint-foreground border border-newsprint-border p-6 text-newsprint-bg",
    curl: "bg-newsprint-bg border border-newsprint-border p-6 paper-curl",
    fold: "bg-newsprint-bg border border-newsprint-border p-6 paper-fold",
    clipping: "bg-newsprint-bg border border-newsprint-border p-6 paper-clipping",
    stack: "bg-newsprint-bg border border-newsprint-border p-6 paper-stack",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "sharp-corners",
        variantStyles[variant],
        className
      )}
      style={{ borderRadius: 0 }}
      {...props}
    />
  )
})
NewsprintCard.displayName = "NewsprintCard"

const NewsprintCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
    {...props}
  />
))
NewsprintCardHeader.displayName = "NewsprintCardHeader"

const NewsprintCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-newsprint-serif text-2xl lg:text-3xl font-bold text-newsprint-foreground",
      className
    )}
    {...props}
  />
))
NewsprintCardTitle.displayName = "NewsprintCardTitle"

const NewsprintCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "font-newsprint-body text-sm text-newsprint-neutral-500 leading-relaxed",
      className
    )}
    {...props}
  />
))
NewsprintCardDescription.displayName = "NewsprintCardDescription"

const NewsprintCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
NewsprintCardContent.displayName = "NewsprintCardContent"

const NewsprintCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
NewsprintCardFooter.displayName = "NewsprintCardFooter"

export {
  NewsprintCard,
  NewsprintCardHeader,
  NewsprintCardTitle,
  NewsprintCardDescription,
  NewsprintCardContent,
  NewsprintCardFooter,
}
