// Local shadcn components
export { Button, buttonVariants } from './button';
export type { ButtonProps } from './button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Badge, badgeVariants } from './badge';
export type { BadgeProps } from './badge';
export { Input } from './input';
export type { InputProps } from './input';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { ScrollArea, ScrollBar } from './scroll-area';
export { Popover, PopoverTrigger, PopoverContent } from './popover';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu';
export { Skeleton } from './skeleton';
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from './command';
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';
export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast';
export type { ToastProps, ToastActionElement } from './toast';

// App-specific Newsprint Design System components
export { NewsprintInput } from './newsprint-input';
export { NewsprintTextarea } from './newsprint-textarea';
export { 
  NewsprintCard, 
  NewsprintCardHeader, 
  NewsprintCardTitle, 
  NewsprintCardDescription, 
  NewsprintCardContent, 
  NewsprintCardFooter 
} from './newsprint-card';

// App-specific Toaster (depends on app hook)
export { Toaster } from './toaster';
