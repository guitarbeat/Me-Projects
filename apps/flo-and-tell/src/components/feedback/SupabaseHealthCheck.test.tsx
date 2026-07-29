import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseHealthCheck } from './SupabaseHealthCheck';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
    })),
  },
}));

import { supabase } from '@/integrations/supabase/client';

describe('SupabaseHealthCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when connection is successful', async () => {
    // Mock successful response
    const mockSelect = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ select: mockSelect });

    render(<SupabaseHealthCheck />);

    // Should stay null
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('renders error banner when connection fails (42P01)', async () => {
    // Mock error response
    const mockSelect = vi.fn().mockResolvedValue({
      error: { code: '42P01', message: 'relation does not exist' },
    });
    (supabase.from as any).mockReturnValue({ select: mockSelect });

    render(<SupabaseHealthCheck />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByText(/Database tables are missing/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/npm run db:push/i)).toBeInTheDocument();
    });
  });

  it('renders error banner when connection fails (404)', async () => {
    // Mock error response
    const mockSelect = vi.fn().mockResolvedValue({
      error: { code: '404', message: 'Not Found' },
    });
    (supabase.from as any).mockReturnValue({ select: mockSelect });

    render(<SupabaseHealthCheck />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByText(/Database tables are missing/i)
      ).toBeInTheDocument();
    });
  });

  it('renders error banner when connection fails (PGRST301)', async () => {
    // Mock error response
    const mockSelect = vi.fn().mockResolvedValue({
      error: { code: 'PGRST301', message: 'Not Found' },
    });
    (supabase.from as any).mockReturnValue({ select: mockSelect });

    render(<SupabaseHealthCheck />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByText(/Database tables are missing/i)
      ).toBeInTheDocument();
    });
  });

  it('renders generic error banner for other errors', async () => {
    // Mock generic error
    const mockSelect = vi.fn().mockResolvedValue({
      error: { code: '500', message: 'Something went wrong' },
    });
    (supabase.from as any).mockReturnValue({ select: mockSelect });

    render(<SupabaseHealthCheck />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByText(/Database connection issue: Something went wrong/i)
      ).toBeInTheDocument();
    });
  });
});
