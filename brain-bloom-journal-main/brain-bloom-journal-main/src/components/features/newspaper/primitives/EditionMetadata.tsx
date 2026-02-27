import { cn } from "@/lib/utils"

interface EditionMetadataProps {
  volume?: string | number
  issue?: string | number
  date?: string
  location?: string
  className?: string
}

/**
 * EditionMetadata - Newspaper-style edition information
 * Displays volume, issue, date, and location in monospace
 */
export const EditionMetadata = ({
  volume,
  issue,
  date,
  location,
  className,
}: EditionMetadataProps) => {
  const parts = []
  
  if (volume) parts.push(`Vol. ${volume}`)
  if (issue) parts.push(`No. ${issue}`)
  if (date) parts.push(date)
  if (location) parts.push(`${location} Edition`)

  if (parts.length === 0) return null

  return (
    <div
      className={cn(
        "font-newsprint-mono text-xs uppercase tracking-widest text-newsprint-neutral-500",
        className
      )}
    >
      {parts.join(" | ")}
    </div>
  )
}
