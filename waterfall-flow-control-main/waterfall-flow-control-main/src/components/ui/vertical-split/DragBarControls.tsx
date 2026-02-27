import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Volume2,
  VolumeX,
  Settings2,
  Lock,
  Unlock,
  Download,
  Upload,
  User,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { SplitSettings, SNAP_VALUES } from './types';

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}

const ControlButton = ({
  icon,
  label,
  onClick,
  active,
  disabled,
  className,
}: ControlButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        className={cn(
          'p-1 rounded transition-colors hover:bg-foreground/8',
          active && 'text-amber-500',
          disabled && 'opacity-40 cursor-not-allowed',
          className
        )}
        onPointerDown={e => e.stopPropagation()}
        onClick={e => {
          e.stopPropagation();
          if (!disabled) onClick();
        }}
        disabled={disabled}
        aria-label={label}
      >
        {icon}
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="text-xs">
      {label}
    </TooltipContent>
  </Tooltip>
);

interface LeftControlsProps {
  locked: boolean;
  toggleLock: () => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  settings: SplitSettings;
  updateSettings: (updates: Partial<SplitSettings>) => void;
  enabledSnapCount: number;
  feedbackEnabled: boolean;
  toggleFeedback: () => void;
  prefersReducedMotion: boolean;
  visible: boolean;
}

export const LeftControls = ({
  locked,
  toggleLock,
  settingsOpen,
  setSettingsOpen,
  settings,
  updateSettings,
  enabledSnapCount,
  feedbackEnabled,
  toggleFeedback,
  prefersReducedMotion,
  visible,
}: LeftControlsProps) => (
  <div
    className={cn(
      'absolute left-1.5 flex items-center gap-px transition-opacity duration-150',
      visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
    )}
  >
    <ControlButton
      icon={
        locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />
      }
      label={locked ? 'Unlock' : 'Lock'}
      onClick={toggleLock}
      active={locked}
    />

    <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
      <PopoverTrigger asChild>
        <button
          className="p-1 rounded transition-colors hover:bg-foreground/8"
          onPointerDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
          aria-label="Split settings"
        >
          <Settings2 className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 z-[100]" align="start" side="bottom">
        <div className="space-y-2.5">
          <div className="space-y-1">
            <h4 className="font-medium text-[11px]">Snap Points</h4>
            <div className="space-y-0.5">
              {(['top', 'middle', 'bottom'] as const).map(key => {
                const isDisabled =
                  settings.snapPoints[key] && enabledSnapCount <= 1;
                return (
                  <div key={key} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`snap-${key}`}
                      checked={settings.snapPoints[key]}
                      disabled={isDisabled}
                      onCheckedChange={checked =>
                        updateSettings({
                          snapPoints: {
                            ...settings.snapPoints,
                            [key]: !!checked,
                          },
                        })
                      }
                      className="h-3.5 w-3.5"
                    />
                    <Label
                      htmlFor={`snap-${key}`}
                      className={cn(
                        'text-[11px] capitalize',
                        isDisabled && 'text-muted-foreground'
                      )}
                    >
                      {key} ({SNAP_VALUES[key]}%)
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[11px]">Magnetic</Label>
              <span className="text-[9px] text-muted-foreground">
                {settings.magneticStrength}%
              </span>
            </div>
            <Slider
              value={[settings.magneticStrength]}
              onValueChange={([value]) =>
                updateSettings({ magneticStrength: value })
              }
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>

    {!prefersReducedMotion && (
      <ControlButton
        icon={
          feedbackEnabled ? (
            <Volume2 className="h-3 w-3" />
          ) : (
            <VolumeX className="h-3 w-3" />
          )
        }
        label={feedbackEnabled ? 'Sound on' : 'Sound off'}
        onClick={toggleFeedback}
        className={!feedbackEnabled ? 'opacity-40' : undefined}
      />
    )}
  </div>
);

interface RightControlsProps {
  onExport?: () => void;
  onImport?: () => void;
  onProfile?: () => void;
  exportDisabled?: boolean;
  visible: boolean;
}

export const RightControls = ({
  onExport,
  onImport,
  onProfile,
  exportDisabled,
  visible,
}: RightControlsProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        'absolute right-1.5 flex items-center gap-px transition-opacity duration-150',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      {onExport && (
        <ControlButton
          icon={<Download className="h-3 w-3" />}
          label="Export"
          onClick={onExport}
          disabled={exportDisabled}
        />
      )}

      {onImport && (
        <ControlButton
          icon={<Upload className="h-3 w-3" />}
          label="Import"
          onClick={onImport}
        />
      )}

      {onProfile && (
        <ControlButton
          icon={<User className="h-3 w-3" />}
          label="Profile"
          onClick={onProfile}
        />
      )}

      <ControlButton
        icon={
          theme === 'dark' ? (
            <Sun className="h-3 w-3" />
          ) : (
            <Moon className="h-3 w-3" />
          )
        }
        label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
    </div>
  );
};
