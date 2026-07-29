import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PinLockOverlay } from './PinLockOverlay';
import * as AuthContext from '@/contexts/AuthContext';
import * as Security from '@/lib/security';

// Mock the AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the Security library
vi.mock('@/lib/security', () => ({
  verifyPin: vi.fn(),
  hashPin: vi.fn(),
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({})) })),
    })),
  },
}));

describe('PinLockOverlay Security Test', () => {
  const mockUser = { id: 'user-123' };
  const mockProfile = {
    id: 'user-123',
    pin_hash: 'hashed-pin',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (AuthContext.useAuth as any).mockReturnValue({
      user: mockUser,
      profile: mockProfile,
    });
    // Clear localStorage before each test
    localStorage.clear();
    sessionStorage.clear();
  });

  it('persists attempts on remount and locks out user', async () => {
    // Setup verification failure
    (Security.verifyPin as any).mockResolvedValue(false);

    const TestComponent = () => (
      <PinLockOverlay>
        <div>Protected Content</div>
      </PinLockOverlay>
    );

    const { unmount } = render(<TestComponent />);

    // Function to enter a PIN
    const enterPin = () => {
      const inputs = screen.getAllByLabelText(/Digit/i);
      inputs.forEach((input) => {
        fireEvent.change(input, { target: { value: '1' } });
      });
    };

    // Enter wrong PIN 3 times
    // Attempt 1
    enterPin();
    await waitFor(() =>
      expect(screen.getByText(/Incorrect PIN/i)).toBeInTheDocument()
    );

    // Attempt 2
    enterPin();
    await waitFor(() =>
      expect(screen.getByText(/Incorrect PIN/i)).toBeInTheDocument()
    );

    // Attempt 3
    enterPin();
    await waitFor(() =>
      expect(screen.getByText(/Hint: Check your PIN/i)).toBeInTheDocument()
    );

    // Verify hint is visible
    expect(screen.getByText(/Hint: Check your PIN/i)).toBeInTheDocument();

    // Now simulate reload (unmount and remount)
    unmount();
    render(<TestComponent />);

    // Verify hint is initially hidden (because no error yet)
    expect(screen.queryByText(/Hint: Check your PIN/i)).not.toBeInTheDocument();

    // Enter PIN 1 more time (Attempt 4 if persisted, Attempt 1 if reset)
    enterPin();
    await waitFor(() =>
      expect(screen.getByText(/Incorrect PIN/i)).toBeInTheDocument()
    );

    // Hint should be visible immediately because attempts (4) >= 3
    // If attempts reset to 1, hint would not be visible
    expect(screen.getByText(/Hint: Check your PIN/i)).toBeInTheDocument();

    // Enter PIN 1 more time (Attempt 5) -> Lockout
    enterPin();

    // Should see Lockout message
    await waitFor(() => {
      expect(screen.getByText(/Locked Out/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Too many attempts/i)[0]).toBeInTheDocument();

    // Inputs should be disabled
    const inputs = screen.getAllByLabelText(/Digit/i);
    expect(inputs[0]).toBeDisabled();

    // Verify persistence of lockout
    unmount();

    const storedAttempts = localStorage.getItem('pin_attempts_user-123');
    expect(storedAttempts).toBe('5');
    expect(localStorage.getItem('pin_lockout_until_user-123')).toBeTruthy();

    const { container } = render(<TestComponent />);

    // Should still be locked out immediately on remount
    // Using simple text content check first to bypass potential query selector issues
    await waitFor(() => {
      expect(container.textContent).toContain('Locked Out');
    });

    const inputsRemount = screen.getAllByLabelText(/Digit/i);
    expect(inputsRemount[0]).toBeDisabled();
  });
});
