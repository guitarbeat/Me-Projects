import { memo } from 'react';
import { format, parseISO } from 'date-fns';
import { getTypeIcon, getTypeColor } from '@/lib';
import { Badge } from '@/components/ui';

interface TimelineEntryProps {
  id: string;
  title: string;
  date: string;
  type: string;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export const TimelineEntry = memo<TimelineEntryProps>(({
  id,
  title,
  date,
  type,
  isSelected,
  onClick,
  index
}) => {
  const TypeIcon = getTypeIcon(type);
  const typeColor = getTypeColor(type);
  
  const formattedDate = (() => {
    try {
      return format(parseISO(date), 'MMM d, yyyy');
    } catch {
      return date;
    }
  })();

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 sharp-corners border transition-all duration-200
        ${isSelected 
          ? 'bg-newsprint-foreground text-newsprint-bg border-newsprint-foreground' 
          : 'bg-newsprint-bg text-newsprint-foreground border-newsprint-border hover:bg-newsprint-neutral-100'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Timeline Dot */}
        <div className={`
          w-3 h-3 mt-1.5 sharp-corners flex-shrink-0
          ${isSelected ? 'bg-newsprint-bg' : 'bg-newsprint-foreground'}
        `} />
        
        <div className="flex-1 min-w-0">
          {/* Date */}
          <div className={`
            font-newsprint-mono text-xs uppercase tracking-wider mb-1
            ${isSelected ? 'text-newsprint-neutral-400' : 'text-newsprint-neutral-500'}
          `}>
            {formattedDate}
          </div>
          
          {/* Title */}
          <h3 className={`
            font-newsprint-serif text-lg font-bold leading-tight mb-2 truncate
            ${isSelected ? 'text-newsprint-bg' : 'text-newsprint-foreground'}
          `}>
            {title || `Entry #${index + 1}`}
          </h3>
          
          {/* Type Badge */}
          <Badge 
            variant="outline"
            className={`
              text-xs sharp-corners
              ${isSelected 
                ? 'border-newsprint-bg/50 text-newsprint-bg' 
                : typeColor
              }
            `}
          >
            <TypeIcon className="h-3 w-3 mr-1" />
            {type}
          </Badge>
        </div>
      </div>
    </button>
  );
});

TimelineEntry.displayName = 'TimelineEntry';
