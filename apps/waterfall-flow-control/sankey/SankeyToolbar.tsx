import { Button } from '@/components/ui/button';
import {
  RotateCw,
  RotateCcw,
  Maximize,
  Minimize,
  Download,
} from 'lucide-react';

interface SankeyToolbarProps {
  isVertical: boolean;
  isFullscreen: boolean;
  onToggleVertical: () => void;
  onToggleFullscreen: () => void;
  onExportPNG: () => void;
}

export function SankeyToolbar({
  isVertical,
  isFullscreen,
  onToggleVertical,
  onToggleFullscreen,
  onExportPNG,
}: SankeyToolbarProps) {
  return (
    <div className="absolute top-2 right-2 z-10 flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleVertical}
        className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-accent"
        title={isVertical ? 'Horizontal layout' : 'Vertical layout'}
      >
        {isVertical ? (
          <RotateCcw className="h-4 w-4" />
        ) : (
          <RotateCw className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleFullscreen}
        className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-accent"
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? (
          <Minimize className="h-4 w-4" />
        ) : (
          <Maximize className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onExportPNG}
        className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-accent"
        title="Export as PNG"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}
