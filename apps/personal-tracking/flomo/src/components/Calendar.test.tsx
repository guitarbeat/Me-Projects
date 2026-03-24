import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { Calendar } from './calendar/Calendar';

const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const mockUseProfile = vi.fn();
vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => mockUseProfile(),
}));

const mockUsePeriodTracking = vi.fn();
vi.mock('@/hooks/usePeriodTracking', () => ({
  usePeriodTracking: () => mockUsePeriodTracking(),
}));

const mockUseExistingUsers = vi.fn();
vi.mock('@/hooks/useExistingUsers', () => ({
  useExistingUsers: () => mockUseExistingUsers(),
}));

const mockUseCalendarNavigation = vi.fn();
vi.mock('@/hooks/useCalendarNavigation', () => ({
  useCalendarNavigation: () => mockUseCalendarNavigation(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      select: () => Promise.resolve({ data: [], error: null }),
    }),
    channel: () => {
      const chan = {
        on: () => chan,
        subscribe: () => ({}),
      };
      return chan;
    },
    removeChannel: () => {},
  },
}));

vi.mock('@/components/FloatingUserBubbles', () => ({
  FloatingUserBubbles: ({ userProfiles }: { userProfiles: unknown[] }) => (
    <div data-testid="floating-user-bubbles">{userProfiles?.length ?? 0}</div>
  ),
}));

vi.mock('@/components/profile/ProfileEditor', () => ({
  ProfileEditor: ({
    isPrivate = true,
    onPrivacyChange,
  }: {
    isPrivate?: boolean;
    onPrivacyChange?: (isPrivate: boolean) => void;
  }) => (
    <button type="button" onClick={() => onPrivacyChange?.(!isPrivate)}>
      {isPrivate ? 'Private' : 'Public'}
    </button>
  ),
}));

vi.mock('@/components/calendar/UserCalendar', () => ({
  UserCalendar: ({
    currentDate,
    onNavigate,
  }: {
    currentDate: Date;
    onNavigate: (direction: 'prev' | 'next') => void;
  }) => (
    <div>
      <div data-testid="calendar-current-month">
        {currentDate.toLocaleString('en-US', {
          month: 'long',
          year: 'numeric',
        })}
      </div>
      <button onClick={() => onNavigate('prev')}>Previous Month</button>
      <button onClick={() => onNavigate('next')}>Next Month</button>
    </div>
  ),
}));

const defaultDate = new Date('2024-01-15T00:00:00.000Z');

describe('Calendar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      signOut: vi.fn(),
      loading: false,
    });

    mockUseProfile.mockReturnValue({
      profile: { display_name: 'Test User' },
      loading: false,
    });

    mockUsePeriodTracking.mockReturnValue({
      floEntries: {},
      loading: false,
      toggleFloDay: vi.fn(),
    });

    mockUseExistingUsers.mockReturnValue({
      userProfiles: [],
    });

    mockUseCalendarNavigation.mockReturnValue({
      currentDate: defaultDate,
      navigateMonth: vi.fn(),
    });
  });
  it('shows loading feedback while data is fetched', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      signOut: vi.fn(),
      loading: true,
    });

    render(<Calendar />);

    // CalendarSkeleton renders visual skeletons, not text
    const skeletons = screen.getAllByText('', { selector: '.skeleton' });
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('toggles privacy mode', async () => {
    localStorage.setItem('privacy_user-1', 'true');

    render(<Calendar />);

    // In private mode, we see "Make Public" buttons
    const makePublicButtons = screen.getAllByRole('button', {
      name: /make public/i,
    });
    expect(makePublicButtons.length).toBeGreaterThan(0);

    // Click one to toggle
    fireEvent.click(makePublicButtons[0]);

    // Now we should see "Make Private" buttons
    const makePrivateButtons = await screen.findAllByRole('button', {
      name: /make private/i,
    });
    expect(makePrivateButtons.length).toBeGreaterThan(0);
  });

  it('displays the provided month and forwards navigation actions', () => {
    const navigateMonth = vi.fn();
    mockUseCalendarNavigation.mockReturnValue({
      currentDate: defaultDate,
      navigateMonth,
    });

    render(<Calendar />);

    expect(screen.getByTestId('calendar-current-month')).toHaveTextContent(
      'January 2024'
    );

    fireEvent.click(screen.getByRole('button', { name: /next month/i }));
    expect(navigateMonth).toHaveBeenCalledWith('next');

    fireEvent.click(screen.getByRole('button', { name: /previous month/i }));
    expect(navigateMonth).toHaveBeenCalledWith('prev');
  });
});
