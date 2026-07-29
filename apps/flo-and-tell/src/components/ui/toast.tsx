import * as React from 'react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  Toaster,
  useToast,
  toast,
} from '@me-projects/ui';

type ToasterProps = React.ComponentProps<typeof Sonner>;

function getSonnerConfig(theme: string | undefined) {
  return {
    theme: (theme as ToasterProps['theme']) || 'system',
    className: 'toaster group',
    toastOptions: {
      classNames: {
        toast:
          'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
        description: 'group-[.toast]:text-muted-foreground',
        actionButton:
          'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
        cancelButton:
          'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
      },
    },
  } satisfies ToasterProps;
}

export const SonnerToaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();
  const config = getSonnerConfig(theme);
  return <Sonner {...config} {...props} />;
};
