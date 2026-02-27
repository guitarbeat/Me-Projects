import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComposeInterface } from './ComposeInterface';
import { TooltipProvider } from '@/components/ui';

// Mock dependencies
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: '123' } } })),
    }
  },
}));

jest.mock('@/hooks', () => ({
  useToast: () => ({ toast: jest.fn() }),
  useErrorHandler: () => ({
    handleError: jest.fn(),
    handleAsyncError: (fn: any) => fn(),
  }),
}));

jest.mock('../chat/ModelSelector', () => ({
  ModelSelector: () => <div data-testid="model-selector" />,
  AI_MODELS: [{ provider: 'gemini', model: 'gemini-1.5-flash' }],
}));

jest.mock('../chat/chat-components', () => ({
  MessageItem: () => <div data-testid="message-item" />,
  TypingIndicator: () => <div data-testid="typing-indicator" />,
  ChatEmptyState: () => <div data-testid="chat-empty-state" />,
}));

jest.mock('../chat/use-speech-recognition', () => ({
  useSpeechRecognition: () => ({
    isListening: false,
    startListening: jest.fn(),
    stopListening: jest.fn(),
  }),
}));

// Mock icons
jest.mock('@/lib/icons/icon-imports', () => {
  const actual = jest.requireActual('@/lib/icons/icon-imports') as Record<string, unknown>;
  return {
    ...actual,
    Printer: () => <span />,
    Mic: () => <span />,
    MicOff: () => <span />,
    Send: () => <span />,
    Upload: () => <span />,
    X: () => <span />,
    Check: () => <span />,
    AlertCircle: () => <span />,
    MessageSquare: () => <span />,
  };
});

describe('ComposeInterface', () => {
  it('renders file upload area with correct accessibility attributes', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <ComposeInterface onGenerateRetrospective={jest.fn()} />
      </TooltipProvider>
    );

    // Wait for loading to finish
    await waitFor(() => {
        expect(screen.queryByText('Loading messages...')).not.toBeInTheDocument();
    });

    // Switch to Import tab
    const importTab = screen.getByRole('tab', { name: /import/i });
    await user.click(importTab);

    await waitFor(() => {
        expect(screen.getByRole('tabpanel', { name: /import/i })).not.toHaveAttribute('hidden');
    });

    const uploadArea = screen.getByLabelText('Upload file');
    expect(uploadArea).toBeInTheDocument();
    expect(uploadArea).toHaveAttribute('role', 'button');
    expect(uploadArea).toHaveAttribute('tabIndex', '0');
  });

  it('renders clear import button with accessibility attributes', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <ComposeInterface onGenerateRetrospective={jest.fn()} />
      </TooltipProvider>
    );

    // Wait for loading to finish
    await waitFor(() => {
        expect(screen.queryByText('Loading messages...')).not.toBeInTheDocument();
    });

     // Switch to Import tab
    const importTab = screen.getByRole('tab', { name: /import/i });
    await user.click(importTab);

    await waitFor(() => {
        expect(screen.getByRole('tabpanel', { name: /import/i })).not.toHaveAttribute('hidden');
    });

    // Simulate file content to show the clear button
    const textarea = screen.getByPlaceholderText(/or paste entries here/i);
    await user.type(textarea, '2023-01-01: Test entry');

    const clearButton = await screen.findByLabelText('Clear import');
    expect(clearButton).toBeInTheDocument();
  });
});
