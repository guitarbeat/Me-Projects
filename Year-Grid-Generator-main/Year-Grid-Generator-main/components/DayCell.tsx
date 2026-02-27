import React from 'react';
import { DayData, ActiveLabelFormat } from '../types';

interface DayCellProps {
  filled: boolean;
  active?: boolean;
  label: string;
  // Config props needed for content rendering
  index: number;
  granularity: 'day' | 'week' | 'month';
  showActiveLabel: boolean;
  activeLabelFormat: ActiveLabelFormat;
  showMonths: boolean;
  dotSize: number;
  // Data item
  item: DayData;
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DayCell: React.FC<DayCellProps> = React.memo(({
  filled,
  active,
  label,
  index,
  granularity,
  showActiveLabel,
  activeLabelFormat,
  showMonths,
  dotSize,
  item
}) => {
  const style: React.CSSProperties = {
    width: 'var(--dot-size)',
    height: 'var(--dot-size)',
    backgroundColor: filled ? 'var(--color-fill)' : 'var(--color-empty)',
    borderRadius: 'var(--radius)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Using max() and calc() for responsive font size based on dot size
    fontSize: 'max(8px, calc(var(--dot-size) * 0.4))',
    color: filled ? 'var(--color-bg)' : 'var(--color-text)',
    fontWeight: 'bold',
    userSelect: 'none',
    zIndex: active ? 10 : 2,
    position: 'relative',
    boxShadow: 'none',
    lineHeight: 1,
    textAlign: 'center',
    whiteSpace: 'pre-line'
  };

  // Helper to determine content
  const renderContent = () => {
    // 1. If Active Label is ON and this cell is active, it takes priority
    if (active && showActiveLabel) {
       // Safely check for date existence before accessing methods
       if (granularity === 'day' && item.date && item.date instanceof Date && !isNaN(item.date.getTime())) {
         try {
           switch (activeLabelFormat) {
             case 'day': return dayNamesShort[item.date.getDay()].substring(0, 1);
             case 'week': return item.weekIndex;
             case 'month': return monthNames[item.date.getMonth()];
             case 'month-date':
               return dotSize < 30 ? `${item.date.getMonth() + 1}/${item.date.getDate()}` : `${monthNames[item.date.getMonth()]} ${item.date.getDate()}`;
             case 'full':
               if (dotSize < 30) return item.date.getDate();
               return (
                 <>
                   <div style={{ fontSize: '0.7em', opacity: 0.8 }}>{dayNamesShort[item.date.getDay()]}</div>
                   <div>{item.date.getDate()}</div>
                   <div style={{ fontSize: '0.6em', opacity: 0.7 }}>W{item.weekIndex}</div>
                 </>
               );
             case 'date':
             default: return item.date.getDate();
           }
         } catch (e) {
           return '?';
         }
       }
       if (granularity === 'week') return index + 1;
       if (granularity === 'month') return index + 1;
    }

    // 2. Otherwise, check standard labels
    if (granularity !== 'day' && showMonths) {
        if (granularity === 'month') return item.label.substring(0, 1);
        if (granularity === 'week' && dotSize > 20) return index + 1;
    }

    return null;
  };

  return (
    <div
      title={label}
      style={style}
    >
      <span className="pointer-events-none w-full">{renderContent()}</span>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // We only re-render if props that affect rendering change.
  // Note: CSS variables handle styling (colors, radius, dotSize for dimensions),
  // but dotSize is also used for logic inside renderContent, so we must check it.

  return (
    prevProps.filled === nextProps.filled &&
    prevProps.active === nextProps.active &&
    prevProps.label === nextProps.label &&
    prevProps.index === nextProps.index &&
    prevProps.granularity === nextProps.granularity &&
    prevProps.showActiveLabel === nextProps.showActiveLabel &&
    prevProps.activeLabelFormat === nextProps.activeLabelFormat &&
    prevProps.showMonths === nextProps.showMonths &&
    prevProps.dotSize === nextProps.dotSize &&
    // Shallow compare item object - assumes YearGrid memoizes dataItems correctly
    prevProps.item === nextProps.item
  );
});

DayCell.displayName = 'DayCell';

export default DayCell;
