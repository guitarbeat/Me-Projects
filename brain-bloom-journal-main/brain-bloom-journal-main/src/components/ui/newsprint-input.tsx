import * as React from "react"
import { cn } from "@/lib/utils"

export interface NewsprintInputProps extends React.ComponentProps<"input"> {}

const NewsprintInput = React.forwardRef<HTMLInputElement, NewsprintInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "border-b-2 border-newsprint-foreground bg-transparent px-3 py-2 font-newsprint-mono text-sm focus-visible:bg-newsprint-neutral-100 focus-visible:outline-none sharp-corners placeholder:text-newsprint-neutral-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{ borderRadius: 0 }}
        ref={ref}
        {...props}
      />
    )
  }
)
NewsprintInput.displayName = "NewsprintInput"

export { NewsprintInput }
