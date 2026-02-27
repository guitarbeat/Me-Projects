/**
 * Calendar skeleton loader component for loading states
 * Features themed colors and subtle float animations
 */
export const CalendarSkeleton = () => (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-cream/50 via-background to-mint/50 dark:from-gray-900 dark:via-background dark:to-gray-700">
    <div className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">
      {/* Controls skeleton */}
      <div className="flex items-center justify-end gap-2 sm:gap-3 mb-4 flex-wrap">
        <div
          className="skeleton h-9 w-24 rounded-full"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="skeleton h-9 w-9 rounded-full"
          style={{ animationDelay: '100ms' }}
        />
        <div
          className="skeleton h-9 w-20 rounded-full"
          style={{ animationDelay: '200ms' }}
        />
      </div>

      {/* Calendar header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="skeleton h-8 w-8 rounded-full"
          style={{ animationDelay: '50ms' }}
        />
        <div
          className="skeleton h-8 w-40 rounded-xl"
          style={{ animationDelay: '150ms' }}
        />
        <div
          className="skeleton h-8 w-8 rounded-full"
          style={{ animationDelay: '250ms' }}
        />
      </div>

      {/* Weekday headers skeleton */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-6 rounded-lg"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>

      {/* Calendar grid skeleton with staggered animations */}
      <div className="grid grid-cols-7 gap-2 md:gap-3">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="skeleton aspect-square rounded-lg"
            style={{
              animationDelay: `${(i % 7) * 50 + Math.floor(i / 7) * 30}ms`,
              opacity: 0.4 + (Math.sin(i * 0.5) * 0.2 + 0.2),
            }}
          />
        ))}
      </div>

      {/* Bottom cards skeleton */}
      <div className="mt-6 space-y-4">
        <div
          className="skeleton h-24 w-full rounded-2xl"
          style={{ animationDelay: '400ms' }}
        />
      </div>
    </div>
  </div>
);
