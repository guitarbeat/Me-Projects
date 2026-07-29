import { render, screen, fireEvent, act } from '@testing-library/react';
import { ProfileEditor } from './ProfileEditor';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    profile: { username: 'TestUser' },
    updateFromLocalUser: vi.fn(),
  }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDarkMode: false,
    toggleDarkMode: vi.fn(),
  }),
}));

vi.mock('@/lib/imageUtils', () => ({
  processImageToBase64: vi.fn(),
  validateImageFile: () => null,
  getAvatarSource: (url: string) => url,
  optimizeImageStorage: (url: string) => Promise.resolve(url),
  isCatImageUrl: () => false,
}));

// Simple mock that renders everything to bypass Dialog state complexity
// We also trigger onOpenChange(true) to ensure internal effects relying on isOpen run
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, onOpenChange }: any) => {
    React.useEffect(() => {
      onOpenChange?.(true);
    }, [onOpenChange]);
    return <div>{children}</div>;
  },
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
}));

// Mock Tab components to ensure content is rendered
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button>{children}</button>,
  TabsContent: ({ children, value }: any) => (
    <div data-value={value}>{children}</div>
  ),
}));

import { processImageToBase64 } from '@/lib/imageUtils';

describe('ProfileEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading state on upload button during file upload', async () => {
      let resolveProcessing: (value: string) => void;
      const processingPromise = new Promise<string>((resolve) => {
        resolveProcessing = resolve;
      });
      (processImageToBase64 as any).mockReturnValue(processingPromise);

      render(<ProfileEditor />);

      // Since we mock Dialog to render everything, the upload button should be present.
      const uploadButtonText = screen.getByText('Upload Custom Image');
      const uploadButton = uploadButtonText.closest('button');
      expect(uploadButton).toBeTruthy();

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeTruthy();

      const file = new File(['(⌐□_□)'], 'chucknorris.png', {
        type: 'image/png',
      });

      // Trigger upload
      await act(async () => {
        fireEvent.change(fileInput!, { target: { files: [file] } });
      });

      // Check loading state
      expect(uploadButton).toBeDisabled();

      // Resolve
      await act(async () => {
        resolveProcessing!('base64data');
      });

      // Check enabled
      expect(uploadButton).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('updates aria attributes on display name validation error', async () => {
      vi.useFakeTimers();
      render(<ProfileEditor />);

      const input = screen.getByLabelText('Display Name');
      expect(input).toHaveAttribute('aria-invalid', 'false');
      expect(input).toHaveAttribute('aria-describedby', 'display-name-helper');

      // Trigger error (name too short)
      await act(async () => {
        fireEvent.change(input, { target: { value: 'a' } });
        // Advance timer past debounce (800ms)
        vi.advanceTimersByTime(1000);
      });

      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'display-name-error');

      const errorMessage = document.getElementById('display-name-error');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage).toHaveTextContent(
        'Name must be at least 2 characters'
      );

      vi.useRealTimers();
    });
  });
});
