import * as React from "react"
import { cn } from "@/lib/utils"

export interface NewsprintTextareaProps extends React.ComponentProps<"textarea"> {}

const NewsprintTextarea = React.forwardRef<HTMLTextAreaElement, NewsprintTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "border-b-2 border-newsprint-foreground bg-transparent px-3 py-2 font-newsprint-mono text-sm focus-visible:bg-newsprint-neutral-100 focus-visible:outline-none sharp-corners resize-none placeholder:text-newsprint-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]",
          className
        )}
        style={{ borderRadius: 0 }}
        ref={ref}
        {...props}
      />
    )
  }
)
NewsprintTextarea.displayName = "NewsprintTextarea"

export { NewsprintTextarea }
