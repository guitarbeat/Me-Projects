import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getDisplayName } from '@/lib/profileUtils';
import type { FloEntry } from '@/types/calendar';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface SharedCalendarData {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  entries: Record<string, boolean>;
}

export const useSharedCalendar = () => {
  const { user } = useAuth();
  const [sharedCalendar, setSharedCalendar] =
    useState<SharedCalendarData | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { loading, setLoading } = useLoadingState({ initialLoading: false });
  const { isOnline } = useNetworkStatus();

  const fetchSharedCalendar = useCallback(
    async (targetUserId: string) => {
      if (!user) {
        return null;
      }

      // Check if offline
      if (!isOnline) {
        setConnectionError('Shared calendars are unavailable offline.');
        return null;
      }

      setLoading(true);
      setActiveUserId(targetUserId);
      setConnectionError(null);

      try {
        // First verify we have access (they shared with us)
        const { data: shareRecord, error: shareError } = await supabase
          .from('flo_shares')
          .select('id')
          .eq('owner_id', targetUserId)
          .eq('shared_with_id', user.id)
          .maybeSingle();

        if (shareError || !shareRecord) {
          console.error('No access to this calendar');
          setActiveUserId(null);
          return null;
        }

        // Fetch the user's profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .eq('id', targetUserId)
          .single();

        if (profileError || !profile) {
          console.error('Error fetching profile:', profileError);
          setActiveUserId(null);
          return null;
        }

        // Fetch their calendar entries
        const { data: entries, error: entriesError } = await supabase
          .from('flo_entries')
          .select('date, is_period_day')
          .eq('user_id', targetUserId);

        if (entriesError) {
          console.error('Error fetching entries:', entriesError);
          setActiveUserId(null);
          return null;
        }

        const entriesMap: Record<string, boolean> = {};
        entries?.forEach((entry) => {
          entriesMap[entry.date] = entry.is_period_day;
        });

        const calendarData: SharedCalendarData = {
          userId: profile.id,
          username: profile.username || '',
          displayName: getDisplayName(profile),
          avatarUrl: profile.avatar_url,
          entries: entriesMap,
        };

        setSharedCalendar(calendarData);
        return calendarData;
      } catch (err) {
        console.error('Error fetching shared calendar:', err);
        setConnectionError('Unable to load shared calendar. Please try again.');
        setActiveUserId(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, setLoading, isOnline]
  );

  // Real-time sync for the active shared calendar
  useEffect(() => {
    if (!activeUserId || !user || !isOnline) {
      return;
    }

    const channel = supabase
      .channel(`shared_calendar_${activeUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flo_entries',
          filter: `user_id=eq.${activeUserId}`,
        },
        (payload: RealtimePostgresChangesPayload<FloEntry>) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          // Increment update counter for badge notification
          setUpdateCount((prev) => prev + 1);

          setSharedCalendar((prev) => {
            if (!prev) {
              return prev;
            }

            const updated = { ...prev, entries: { ...prev.entries } };

            if (eventType === 'INSERT' || eventType === 'UPDATE') {
              const record = newRecord as FloEntry;
              if (record?.date) {
                updated.entries[record.date] = record.is_period_day;
              }
            } else if (eventType === 'DELETE') {
              const record = oldRecord as FloEntry;
              if (record?.date) {
                delete updated.entries[record.date];
              }
            }

            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeUserId, user, isOnline]);

  const clearSharedCalendar = useCallback(() => {
    setSharedCalendar(null);
    setActiveUserId(null);
    setUpdateCount(0);
    setConnectionError(null);
  }, []);

  const clearUpdateCount = useCallback(() => {
    setUpdateCount(0);
  }, []);

  return {
    sharedCalendar,
    loading,
    updateCount,
    connectionError,
    fetchSharedCalendar,
    clearSharedCalendar,
    clearUpdateCount,
  };
};
