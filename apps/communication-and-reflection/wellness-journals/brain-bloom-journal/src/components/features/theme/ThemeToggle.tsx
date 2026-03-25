import { Moon, Sun, Monitor, Check, Newspaper } from '@/lib/icons/icon-imports';
import { 
  Button, DropdownMenu, DropdownMenuContent, 
  DropdownMenuItem, DropdownMenuTrigger,
  Tooltip, TooltipContent, TooltipTrigger
} from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sharp-corners"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 sepia:-rotate-90 sepia:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <Newspaper className="absolute h-4 w-4 rotate-90 scale-0 transition-all sepia:rotate-0 sepia:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle theme</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="bg-popover border-border">
        <DropdownMenuItem onClick={() => setTheme('light')} className="justify-between">
          <div className="flex items-center">
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
          </div>
          {theme === 'light' && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="justify-between">
          <div className="flex items-center">
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
          </div>
          {theme === 'dark' && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('sepia')} className="justify-between">
          <div className="flex items-center">
            <Newspaper className="mr-2 h-4 w-4" />
            <span>Vintage</span>
          </div>
          {theme === 'sepia' && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="justify-between">
          <div className="flex items-center">
            <Monitor className="mr-2 h-4 w-4" />
            <span>System</span>
          </div>
          {theme === 'system' && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
