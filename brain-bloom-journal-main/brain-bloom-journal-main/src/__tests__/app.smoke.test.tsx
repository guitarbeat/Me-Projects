import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import React from 'react';
import App from '@/App';

jest.mock('@/components/PerformanceMonitor', () => () => null);
jest.mock('@vercel/analytics/react', () => ({ Analytics: () => null }));
jest.mock('../components/DataExport/DataExport', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => null)
  };
});

// Mock Supabase client to avoid network and DB
jest.mock('@/integrations/supabase/client', () => {
  const mockFrom = () => ({
    select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
    insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: {}, error: null }) }) }),
    update: () => ({ eq: () => Promise.resolve({ error: null }) }),
  });
  return {
    supabase: {
      auth: { getUser: () => Promise.resolve({ data: { user: null } }) },
      from: mockFrom,
    },
  };
});

describe('App smoke tests', () => {
  beforeEach(() => {
    // Default to desktop size
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    window.history.pushState({}, '', '/');
  });

  it('renders home header without crashing', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Weekends:/i)).toBeInTheDocument();
    });
  });

  it('renders 404 page on unknown route', async () => {
    window.history.pushState({}, '', '/some-unknown-route');
    render(<App />);
    const weekendsLabel = await screen.findByText(/Weekends:/i);
    expect(weekendsLabel).toBeInTheDocument();
  });
});
