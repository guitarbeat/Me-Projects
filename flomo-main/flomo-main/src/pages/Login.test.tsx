import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from './Login';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock AuthContext
const mockSignInOrSignUp = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signInOrSignUp: mockSignInOrSignUp,
    loading: false,
  }),
}));

// Mock useExistingUsers
vi.mock('@/hooks/useExistingUsers', () => ({
  useExistingUsers: () => ({
    userProfiles: [],
    loading: false,
  }),
}));

// Mock FloatingUserBubbles
vi.mock('@/components/bubbles/FloatingUserBubbles', () => ({
  FloatingUserBubbles: () => <div data-testid="floating-bubbles" />,
}));

// Mock Confetti
vi.mock('@/components/feedback/Confetti', () => ({
  Confetti: () => <div data-testid="confetti" />,
}));

// Mock lucide-react icons
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    User: (props: any) => <svg data-testid="user-icon" {...props} />,
    Lock: (props: any) => <svg data-testid="lock-icon" {...props} />,
    AlertCircle: (props: any) => <svg data-testid="alert-icon" {...props} />,
    Loader2: (props: any) => <svg data-testid="loader-icon" {...props} />,
    Check: (props: any) => <svg data-testid="check-icon" {...props} />,
    Sparkles: (props: any) => <svg data-testid="sparkles-icon" {...props} />,
    Eye: (props: any) => <svg data-testid="eye-icon" {...props} />,
    EyeOff: (props: any) => <svg data-testid="eye-off-icon" {...props} />,
  };
});

describe('LoginPage Accessibility', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockSignInOrSignUp.mockReset();
    mockSignInOrSignUp.mockResolvedValue({});
  });

  it('renders login form with basic accessibility', () => {
    render(<LoginPage />);

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    expect(usernameInput).toBeInTheDocument();
  });

  it('validates username and shows error', async () => {
    render(<LoginPage />);

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    fireEvent.change(usernameInput, { target: { value: 'a' } }); // Too short

    // Simulate submit
    const submitButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(submitButton);

    // Wait for validation error
    await waitFor(() => {
      expect(
        screen.getByText(/username must be at least 2 characters/i)
      ).toBeInTheDocument();
    });
  });

  it('checks for aria-describedby on username input', () => {
    render(<LoginPage />);
    const usernameInput = screen.getByPlaceholderText(/enter your username/i);

    // Should point to username-count
    const describedBy = usernameInput.getAttribute('aria-describedby');
    expect(describedBy).toContain('username-count');

    // Verify the character count element exists with that ID
    // Note: ID lookup in RTL is not direct, but we can query by ID via document
    // However, the span is rendered
    const countSpan = document.getElementById('username-count');
    expect(countSpan).toBeInTheDocument();
  });

  it('checks for role="alert" on error container and correct association', async () => {
    render(<LoginPage />);
    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    fireEvent.change(usernameInput, { target: { value: 'validuser' } });

    const submitButton = screen.getByRole('button', { name: /continue/i });

    // Force an error state
    mockSignInOrSignUp.mockResolvedValueOnce({
      error: { message: 'Something went wrong' },
    });

    fireEvent.click(submitButton);

    // Wait for error text
    const errorText = await screen.findByText(/something went wrong/i);
    expect(errorText).toBeInTheDocument();

    // Check for role="alert"
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('id', 'login-error');

    // Check if input references the error
    // Since it's a generic error (not password specific), username should reference it
    // because !isPasswordError check
    expect(usernameInput).toHaveAttribute('aria-describedby');
    const describedBy = usernameInput.getAttribute('aria-describedby');
    expect(describedBy).toContain('login-error');
    expect(describedBy).toContain('username-count');
  });
});
