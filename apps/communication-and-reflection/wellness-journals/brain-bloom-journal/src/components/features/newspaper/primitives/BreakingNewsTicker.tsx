import { memo, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { AlertCircle } from "@/lib/icons/icon-imports"

interface TickerItem {
  id: string
  text: string
  type?: "insight" | "quote" | "stat"
}

interface BreakingNewsTickerProps {
  items: TickerItem[]
  className?: string
  speed?: "slow" | "normal" | "fast"
}

/**
 * BreakingNewsTicker - Horizontal scrolling ticker for insights and highlights
 * Displays key insights from retrospectives in a newspaper-style crawl
 */
export const BreakingNewsTicker = memo<BreakingNewsTickerProps>(({
  items,
  className,
  speed = "normal",
}) => {
  const [isPaused, setIsPaused] = useState(false);

  const speedMap = {
    slow: "40s",
    normal: "30s",
    fast: "20s",
  }

  // Memoize to prevent unnecessary recalculations
  const tickerContent = useMemo(() => {
    if (!items || items.length === 0) return null

    return items.map((item, index) => (
      <span key={item.id} className="inline-flex items-center gap-2">
        {item.type === "insight" && (
          <span className="text-newsprint-accent">●</span>
        )}
        {item.type === "stat" && (
          <span className="text-newsprint-accent font-bold">▲</span>
        )}
        {item.type === "quote" && (
          <span className="text-newsprint-accent">"</span>
        )}
        <span>{item.text}</span>
        {index < items.length - 1 && (
          <span className="mx-4 text-newsprint-accent">◆</span>
        )}
      </span>
    ))
  }, [items])

  if (!items || items.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        "bg-newsprint-foreground text-newsprint-bg overflow-hidden sharp-corners print:hidden",
        className
      )}
      role="region"
      aria-label="Insights Ticker"
    >
      <div className="flex items-center">
        {/* Breaking News Label */}
        <div className="flex-shrink-0 bg-newsprint-accent text-newsprint-bg px-3 py-2 flex items-center gap-2 z-10">
          <AlertCircle className="h-3 w-3" />
          <span className="font-newsprint-sans text-xs font-bold uppercase tracking-wider whitespace-nowrap">
            Insights
          </span>
        </div>

        {/* Scrolling Content */}
        <div
          className="overflow-hidden flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-newsprint-foreground focus-visible:ring-offset-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          tabIndex={0}
          role="marquee"
          aria-live="off"
        >
          <div
            className="flex whitespace-nowrap font-newsprint-mono text-xs uppercase tracking-wider py-2"
            style={{
              animation: `marquee-left ${speedMap[speed]} linear infinite`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            <div className="flex items-center gap-2 px-4">
              {tickerContent}
            </div>
            <div className="flex items-center gap-2 px-4" aria-hidden="true">
              {tickerContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

BreakingNewsTicker.displayName = "BreakingNewsTicker"

// Helper function to generate ticker items from retrospective data
// eslint-disable-next-line react-refresh/only-export-components
export function generateTickerItems(retrospectives: any[]): TickerItem[] {
  if (!retrospectives || retrospectives.length === 0) {
    return [
      { id: "default-1", text: "Welcome to The Daily Reflection", type: "insight" },
      { id: "default-2", text: "Start your first reflection to see insights here", type: "insight" },
    ]
  }

  const items: TickerItem[] = []
  
  // Add stats
  items.push({
    id: "stat-count",
    text: `${retrospectives.length} editions published`,
    type: "stat",
  })

  // Get recent retrospective titles/highlights
  const recent = retrospectives.slice(0, 3)
  recent.forEach((retro, index) => {
    if (retro.title) {
      items.push({
        id: `title-${index}`,
        text: retro.title,
        type: "insight",
      })
    }
  })

  // Add a motivational quote if we have few items
  if (items.length < 4) {
    items.push({
      id: "quote-1",
      text: "Reflection is the lamp of the heart",
      type: "quote",
    })
  }

  return items
}
