import React from 'react';
import { DayData, ActiveLabelFormat } from '../types';

interface DayCellProps {
  filled: boolean;
  active?: boolean;
  selected?: boolean;
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
  onClick?: () => void;
}

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DayCell: React.FC<DayCellProps> = React.memo(
  ({
    filled,
    active,
    selected,
    label,
    index,
    granularity,
    showActiveLabel,
    activeLabelFormat,
    showMonths,
    dotSize,
    item,
    onClick,
  }) => {
    const getBackgroundColor = () => {
      if (active) return 'var(--color-fill)';
      if (selected) return 'var(--color-fill)';

      const intensity = item.intensity || 0;
      if (intensity > 0) {
        // Use fill color with varying opacities for intensity
        const opacities = [0, 0.3, 0.5, 0.7, 1];
        const opacity = opacities[intensity];
        return `var(--intensity-${intensity}, rgba(234, 88, 12, ${opacity}))`; // Fallback to hardcoded if CSS var not provided
      }

      return filled ? 'rgba(234, 88, 12, 0.1)' : 'var(--color-empty)';
    };

    const style: React.CSSProperties = {
      width: 'var(--dot-size)',
      height: 'var(--dot-size)',
      backgroundColor: getBackgroundColor(),
      borderRadius: 'var(--radius)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'max(8px, calc(var(--dot-size) * 0.4))',
      color: (item.intensity && item.intensity >= 3) || active ? 'white' : 'var(--color-text)',
      fontWeight: 'bold',
      userSelect: 'none',
      zIndex: active || selected ? 10 : 2,
      position: 'relative',
      boxShadow:
        active || selected ? '0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-fill)' : 'none',
      lineHeight: 1,
      textAlign: 'center',
      whiteSpace: 'pre-line',
      transition: 'background-color 0.2s ease, transform 0.1s ease, border-radius 0.3s ease',
      cursor: granularity === 'day' ? 'pointer' : 'default',
    };

    // Helper to determine content
    const renderContent = () => {
      // 1. If Active Label is ON and this cell is active, it takes priority
      if (active && showActiveLabel) {
        // Safely check for date existence before accessing methods
        if (
          granularity === 'day' &&
          item.date &&
          item.date instanceof Date &&
          !isNaN(item.date.getTime())
        ) {
          try {
            switch (activeLabelFormat) {
              case 'day':
                return dayNamesShort[item.date.getDay()].substring(0, 1);
              case 'week':
                return item.weekIndex;
              case 'month':
                return monthNames[item.date.getMonth()];
              case 'month-date':
                return dotSize < 30
                  ? `${item.date.getMonth() + 1}/${item.date.getDate()}`
                  : `${monthNames[item.date.getMonth()]} ${item.date.getDate()}`;
              case 'full':
                if (dotSize < 30) return item.date.getDate();
                return (
                  <>
                    <div style={{ fontSize: '0.7em', opacity: 0.8 }}>
                      {dayNamesShort[item.date.getDay()]}
                    </div>
                    <div>{item.date.getDate()}</div>
                    <div style={{ fontSize: '0.6em', opacity: 0.7 }}>W{item.weekIndex}</div>
                  </>
                );
              case 'date':
              default:
                return item.date.getDate();
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
      <div title={label} style={style} onClick={onClick}>
        <span className="pointer-events-none w-full">{renderContent()}</span>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    return (
      prevProps.filled === nextProps.filled &&
      prevProps.active === nextProps.active &&
      prevProps.selected === nextProps.selected &&
      prevProps.label === nextProps.label &&
      prevProps.index === nextProps.index &&
      prevProps.granularity === nextProps.granularity &&
      prevProps.showActiveLabel === nextProps.showActiveLabel &&
      prevProps.activeLabelFormat === nextProps.activeLabelFormat &&
      prevProps.showMonths === nextProps.showMonths &&
      prevProps.dotSize === nextProps.dotSize &&
      prevProps.item === nextProps.item &&
      prevProps.onClick === nextProps.onClick
    );
  }
);

DayCell.displayName = 'DayCell';

export default DayCell;
