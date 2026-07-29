import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import type { FloEntry } from '@/types/calendar';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface PendingChange {
  dateStr: string;
  isFloDay: boolean;
  timestamp: number;
}

const CACHE_KEY_PREFIX = 'flo_entries_';
const PENDING_KEY = 'flo_pending_changes';

export const usePeriodTracking = () => {
  const { user } = useAuth();
  const [floEntries, setFloEntries] = useState<Record<string, boolean>>({});
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const { loading, setLoading } = useLoadingState({ initialLoading: true });
  const { isOnline, wasOffline } = useNetworkStatus();
  const syncingRef = useRef(false);
  const floEntriesRef = useRef(floEntries);

  // Sync ref with state
  useEffect(() => {
    floEntriesRef.current = floEntries;
  }, [floEntries]);

  // Load cached data for instant display
  const loadCachedData = useCallback(() => {
    if (!user) {
      return;
    }
    try {
      const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${user.id}`);
      if (cached) {
        setFloEntries(JSON.parse(cached));
      }
      const pending = localStorage.getItem(PENDING_KEY);
      if (pending) {
        setPendingChanges(JSON.parse(pending));
      }
    } catch (e) {
      console.warn('Failed to load cached data:', e);
    }
  }, [user]);

  // Save to cache
  const saveToCache = useCallback(
    (entries: Record<string, boolean>) => {
      if (!user) {
        return;
      }
      try {
        localStorage.setItem(
          `${CACHE_KEY_PREFIX}${user.id}`,
          JSON.stringify(entries)
        );
      } catch (e) {
        console.warn('Failed to save to cache:', e);
      }
    },
    [user]
  );

  // Queue offline change
  const queueOfflineChange = useCallback(
    (dateStr: string, isFloDay: boolean) => {
      const newChange: PendingChange = {
        dateStr,
        isFloDay,
        timestamp: Date.now(),
      };
      setPendingChanges((prev) => {
        // Replace existing change for same date
        const filtered = prev.filter((c) => c.dateStr !== dateStr);
        const updated = [...filtered, newChange];
        try {
          localStorage.setItem(PENDING_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to save pending changes:', e);
        }
        return updated;
      });
    },
    []
  );

  // Sync pending changes when back online
  const syncPendingChanges = useCallback(async () => {
    if (
      !user ||
      !isOnline ||
      syncingRef.current ||
      pendingChanges.length === 0
    ) {
      return;
    }

    syncingRef.current = true;
    const changesToSync = [...pendingChanges];

    for (const change of changesToSync) {
      try {
        if (change.isFloDay) {
          await supabase
            .from('flo_entries')
            .upsert(
              { user_id: user.id, date: change.dateStr, is_period_day: true },
              { onConflict: 'user_id,date' }
            );
        } else {
          await supabase
            .from('flo_entries')
            .delete()
            .eq('user_id', user.id)
            .eq('date', change.dateStr);
        }

        // Remove synced change
        setPendingChanges((prev) => {
          const updated = prev.filter(
            (c) =>
              c.dateStr !== change.dateStr || c.timestamp !== change.timestamp
          );
          localStorage.setItem(PENDING_KEY, JSON.stringify(updated));
          return updated;
        });
      } catch (error) {
        console.error('Failed to sync change:', change, error);
        break; // Stop syncing on error, will retry on next online event
      }
    }

    syncingRef.current = false;
  }, [user, isOnline, pendingChanges]);

  const loadPeriodData = useCallback(async () => {
    if (!user) {
      setFloEntries({});
      setLoading(false);
      return;
    }

    // Load cached data first for instant display
    loadCachedData();

    if (!isOnline) {
      setConnectionError('You are offline. Showing cached data.');
      setLoading(false);
      return;
    }

    try {
      setConnectionError(null);
      const { data, error } = await supabase
        .from('flo_entries')
        .select('date, is_period_day')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      const entries: Record<string, boolean> = {};
      data?.forEach((entry) => {
        entries[entry.date] = entry.is_period_day;
      });

      setFloEntries(entries);
      saveToCache(entries);
    } catch (error) {
      console.error('Error loading period data:', error);
      setConnectionError('Unable to reach server. Showing cached data.');
      // Keep cached data, don't clear entries
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, isOnline, loadCachedData, saveToCache]);

  // Sync when back online
  useEffect(() => {
    if (wasOffline && isOnline && user) {
      syncPendingChanges();
      loadPeriodData(); // Refresh from server
    }
  }, [wasOffline, isOnline, user, syncPendingChanges, loadPeriodData]);

  // Realtime subscription for cross-device sync
  useEffect(() => {
    if (!user) {
      setFloEntries({});
      setLoading(false);
      return;
    }

    loadPeriodData();

    if (!isOnline) {
      return;
    }

    const channel = supabase
      .channel(`flo_entries_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flo_entries',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: RealtimePostgresChangesPayload<FloEntry>) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          setFloEntries((prev) => {
            const updated = { ...prev };

            if (eventType === 'INSERT' || eventType === 'UPDATE') {
              const record = newRecord as FloEntry;
              if (record?.date) {
                updated[record.date] = record.is_period_day;
              }
            } else if (eventType === 'DELETE') {
              const record = oldRecord as FloEntry;
              if (record?.date) {
                delete updated[record.date];
              }
            }

            saveToCache(updated);
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadPeriodData, setLoading, isOnline, saveToCache]);

  const toggleFloDay = useCallback(
    async (dateStr: string, isFloDay: boolean) => {
      if (!user) {
        return;
      }

      // Use ref to avoid dependency on floEntries
      const currentEntries = floEntriesRef.current;

      // Optimistic update
      const previousEntries = { ...currentEntries };
      const newEntries = { ...currentEntries };
      if (isFloDay) {
        newEntries[dateStr] = true;
      } else {
        delete newEntries[dateStr];
      }
      setFloEntries(newEntries);
      saveToCache(newEntries);

      // If offline, queue the change
      if (!isOnline) {
        queueOfflineChange(dateStr, isFloDay);
        return;
      }

      try {
        if (isFloDay) {
          const { error } = await supabase
            .from('flo_entries')
            .upsert(
              { user_id: user.id, date: dateStr, is_period_day: true },
              { onConflict: 'user_id,date' }
            );
          if (error) {
            throw error;
          }
        } else {
          const { error } = await supabase
            .from('flo_entries')
            .delete()
            .eq('user_id', user.id)
            .eq('date', dateStr);
          if (error) {
            throw error;
          }
        }
      } catch (error) {
        console.error('Error updating flo entry:', error);
        // Rollback on error
        setFloEntries(previousEntries);
        saveToCache(previousEntries);
        setConnectionError('Failed to save. Change will be retried.');
        // Queue for retry
        queueOfflineChange(dateStr, isFloDay);
      }
    },
    [user, isOnline, queueOfflineChange, saveToCache]
  );

  return {
    floEntries,
    loading,
    connectionError,
    pendingChanges: pendingChanges.length,
    toggleFloDay,
    refreshData: loadPeriodData,
  };
};
