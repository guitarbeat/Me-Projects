import { ReactNode, memo } from 'react';
import { cn } from '@/lib/utils';
import { VerticalSplitProps } from './types';
import { useSplitState } from './useSplitState';
import { LeftControls, RightControls } from './DragBarControls';
import { DragHandle } from './DragHandle';
import { SnapIndicators } from './SnapIndicators';
import { nearestSnapPercent } from './utils';

export const VerticalSplit = memo(
  ({
    topView,
    bottomView,
    topTitle,
    bottomTitle,
    defaultDetent = 'middle',
    onDetentChange,
    className,
    onExport,
    onImport,
    onProfile,
    exportDisabled = false,
    centerSlot,
  }: VerticalSplitProps) => {
    const {
      top,
      drag,
      hov,
      setHov,
      locked,
      feedbackEnabled,
      settingsOpen,
      setSettingsOpen,
      settings,
      prefersReducedMotion,
      activeSnapPoints,
      enabledSnapCount,
      updateSettings,
      toggleLock,
      toggleFeedback,
      snapToPercent,
      onPointer,
    } = useSplitState({ defaultDetent, onDetentChange });

    const active = drag || hov;
    const topMinimized = top < 15;
    const bottomMinimized = 100 - top < 15;
    const hasActions = onExport || onImport || onProfile || centerSlot;

    const Panel = ({
      height,
      minimized,
      rounded,
      title,
      children,
    }: {
      height: string;
      minimized: boolean;
      rounded: string;
      title: string;
      children: ReactNode;
    }) => (
      <div
        className={cn(
          'overflow-hidden',
          !drag && 'transition-[height] duration-300'
        )}
        style={{ height }}
      >
        <div
          className={cn('relative h-full', minimized && 'cursor-pointer')}
          onClick={minimized && !locked ? () => snapToPercent(50) : undefined}
        >
          {minimized && (
            <div
              className={`absolute inset-0 z-10 flex items-center justify-center bg-muted/70 backdrop-blur-sm ${rounded}`}
            >
              <div className="px-4 py-2 bg-background/80 rounded-full shadow-sm border border-border/50 text-sm">
                {title}
              </div>
            </div>
          )}
          <div
            className={cn(
              'h-full w-full',
              minimized && 'scale-95 opacity-50 blur-[1px]'
            )}
          >
            {children}
          </div>
        </div>
      </div>
    );

    return (
      <div
        className={cn(
          'flex flex-col h-full w-full overflow-hidden bg-background relative',
          className
        )}
      >
        <SnapIndicators
          visible={drag}
          activeSnapPoints={activeSnapPoints}
          currentTop={top}
        />

        <Panel
          height={`${top}%`}
          minimized={topMinimized}
          rounded="rounded-b-2xl"
          title={topTitle || 'Tap to expand'}
        >
          {topView}
        </Panel>

        {/* Drag Bar */}
        <div
          className="relative z-10"
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
        >
          <div
            className={cn(
              'relative flex items-center justify-center border-y touch-none select-none transition-all duration-200',
              active && hasActions ? 'py-2.5' : 'py-1.5',
              locked
                ? 'border-amber-500/20 bg-amber-500/5'
                : active
                  ? 'border-border/40 bg-muted/40'
                  : 'border-border/20 bg-transparent',
              locked
                ? 'cursor-not-allowed'
                : 'cursor-grab active:cursor-grabbing'
            )}
            onPointerDown={onPointer}
            onPointerMove={onPointer}
            onPointerUp={onPointer}
            onPointerCancel={onPointer}
            onKeyDown={e => {
              if (locked) return;
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const nudge =
                  (e.key === 'ArrowUp' ? -1 : 1) * (e.shiftKey ? 30 : 10);
                const newPercent = nearestSnapPercent(
                  top + nudge,
                  activeSnapPoints
                );
                snapToPercent(newPercent);
              }
            }}
            tabIndex={locked ? -1 : 0}
            role="separator"
            aria-label={locked ? 'Resize panels (locked)' : 'Resize panels'}
            aria-valuenow={Math.round(top)}
          >
            <LeftControls
              locked={locked}
              toggleLock={toggleLock}
              settingsOpen={settingsOpen}
              setSettingsOpen={setSettingsOpen}
              settings={settings}
              updateSettings={updateSettings}
              enabledSnapCount={enabledSnapCount}
              feedbackEnabled={feedbackEnabled}
              toggleFeedback={toggleFeedback}
              prefersReducedMotion={prefersReducedMotion}
              visible={active}
            />

            {/* Center: either custom slot or drag handle */}
            {active && centerSlot ? (
              <span onPointerDown={e => e.stopPropagation()}>{centerSlot}</span>
            ) : (
              <DragHandle drag={drag} active={active} locked={locked} />
            )}

            <RightControls
              onExport={onExport}
              onImport={onImport}
              onProfile={onProfile}
              exportDisabled={exportDisabled}
              visible={active}
            />
          </div>
        </div>

        <Panel
          height={`${100 - top}%`}
          minimized={bottomMinimized}
          rounded="rounded-t-2xl"
          title={bottomTitle || 'Tap to expand'}
        >
          {bottomView}
        </Panel>
      </div>
    );
  }
);

VerticalSplit.displayName = 'VerticalSplit';
