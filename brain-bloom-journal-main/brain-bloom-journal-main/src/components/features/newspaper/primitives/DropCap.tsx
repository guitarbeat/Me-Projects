import { cn } from "@/lib/utils"

interface DropCapProps {
  letter: string
  className?: string
  accent?: boolean
}

/**
 * DropCap - Massive drop cap for first letter of paragraphs
 * Creates editorial, newspaper-style typography
 */
export const DropCap = ({ letter, className, accent = false }: DropCapProps) => {
  return (
    <span
      className={cn(
        "float-left font-newsprint-serif text-7xl leading-none mr-2 pt-2",
        accent ? "text-newsprint-accent" : "text-newsprint-foreground",
        className
      )}
      style={{ lineHeight: 0.8 }}
    >
      {letter}
    </span>
  )
}
