import { cn } from '@/lib/utils';
import { nearestSnapPercent } from './utils';

interface SnapIndicatorsProps {
  visible: boolean;
  activeSnapPoints: number[];
  currentTop: number;
}

export const SnapIndicators = ({
  visible,
  activeSnapPoints,
  currentTop,
}: SnapIndicatorsProps) => {
  if (!visible) return null;

  const nearestSnap = nearestSnapPercent(currentTop, activeSnapPoints);

  return (
    <>
      {activeSnapPoints.map(snapPoint => {
        const isNearest = snapPoint === nearestSnap;
        const distance = Math.abs(currentTop - snapPoint);
        const isClose = distance < 8;

        return (
          <div
            key={snapPoint}
            className={cn(
              'absolute left-0 right-0 z-50 pointer-events-none transition-opacity duration-100',
              isClose ? 'opacity-100' : 'opacity-40'
            )}
            style={{ top: `${snapPoint}%` }}
          >
            <div className="relative flex items-center justify-center">
              <div
                className={cn(
                  'absolute left-4 right-4 h-px transition-all duration-100',
                  isNearest && isClose
                    ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]'
                    : 'bg-foreground/20'
                )}
              />
              <div
                className={cn(
                  'relative px-2 py-0.5 rounded text-[10px] font-medium transition-all duration-100',
                  isNearest && isClose
                    ? 'bg-primary text-primary-foreground scale-110'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {snapPoint === 50 ? '50%' : snapPoint === 8 ? 'Top' : 'Bottom'}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};
