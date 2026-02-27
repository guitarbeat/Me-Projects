export const WeekdayHeaders = () => (
  <div
    className="grid grid-cols-7 smooth-resize"
    style={{
      gap: 'var(--cell-gap)',
      marginBottom: 'var(--space-xs)',
    }}
  >
    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
      <div
        key={day}
        className="text-center font-semibold font-quicksand text-muted-foreground smooth-resize"
        style={{
          padding: 'var(--space-2xs)',
          fontSize: 'var(--text-xs)',
        }}
      >
        <span className="hidden md:inline">{day}</span>
        <span className="hidden sm:inline md:hidden">{day.slice(0, 2)}</span>
        <span className="sm:hidden">{day.slice(0, 1)}</span>
      </div>
    ))}
  </div>
);
