import { render, screen } from '@testing-library/react';
import { AppContent } from './App';
import { vi, describe, it, expect } from 'vitest';

// Mock useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: '1' }, loading: false }),
}));

// Mock NavigationHeader
vi.mock('@/components/layout/NavigationHeader', () => ({
  NavigationHeader: () => <div data-testid="nav-header" />,
}));

// Mock Feedback Components
vi.mock('@/components/feedback', () => ({
  OfflineBanner: () => <div data-testid="offline-banner" />,
  SupabaseHealthCheck: () => <div data-testid="supabase-health-check" />,
}));

// Mock LoginPage
vi.mock('./pages/Login', () => ({
  LoginPage: () => <div data-testid="login-page" />,
}));

// Mock Calendar since it is lazy loaded
vi.mock('@/components/calendar/Calendar', () => ({
  Calendar: () => <div data-testid="calendar" />,
}));

describe('AppContent', () => {
  it('renders skip to content link', () => {
    render(<AppContent />);
    const skipLink = screen.getByRole('link', { name: /skip to content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(skipLink).toHaveClass('sr-only');
    expect(skipLink).toHaveClass('focus:not-sr-only');
  });
});
