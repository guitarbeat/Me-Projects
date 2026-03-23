import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { eventEmitter, PROFILE_UPDATED_EVENT } from '@/lib/events';
import { useLoadingState } from '@/hooks/useLoadingState';
import type { UserBubbleProfile } from '@/types/user';

// Session cache for instant display on repeat visits
const CACHE_KEY = 'flo_user_profiles_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  profiles: UserBubbleProfile[];
  timestamp: number;
}

const getCachedProfiles = (): UserBubbleProfile[] | null => {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) {
      return null;
    }

    const data: CachedData = JSON.parse(cached);
    if (Date.now() - data.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data.profiles;
  } catch {
    return null;
  }
};

const setCachedProfiles = (profiles: UserBubbleProfile[]): void => {
  try {
    const data: CachedData = { profiles, timestamp: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable - ignore
  }
};

export const useExistingUsers = () => {
  // Try to use cached data for instant display
  const [userProfiles, setUserProfiles] = useState<UserBubbleProfile[]>(
    () => getCachedProfiles() || []
  );
  const { loading, setLoading } = useLoadingState({
    // Start with loading:false if we have cached data (stale-while-revalidate)
    initialLoading: !getCachedProfiles(),
  });

  const fetchUserProfiles = useCallback(async () => {
    // Only show loading spinner if we don't have cached data
    if (userProfiles.length === 0) {
      setLoading(true);
    }

    try {
      // Use profiles table - fetch essential fields + has_custom_password, limit to 10 for faster load
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, has_custom_password')
        .not('username', 'is', null)
        .not('username', 'ilike', 'anonymous_%')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      // Fast path: direct mapping without extra filtering when possible
      const profiles: UserBubbleProfile[] = (data || [])
        .filter(
          (p): p is typeof p & { id: string; username: string } =>
            p.id !== null && p.username !== null
        )
        .map((p) => ({
          id: p.id,
          username: p.username,
          display_name: p.display_name || undefined,
          avatar_url: p.avatar_url ?? null,
          has_custom_password: p.has_custom_password ?? false,
        }));

      setUserProfiles(profiles);
      setCachedProfiles(profiles); // Cache for next visit
    } catch {
      // Keep existing profiles on error (stale data is better than no data)
      if (userProfiles.length === 0) {
        setUserProfiles([]);
      }
    } finally {
      setLoading(false);
    }
  }, [setLoading, userProfiles.length]);

  useEffect(() => {
    fetchUserProfiles();

    const handleProfileUpdate = () => {
      fetchUserProfiles();
    };

    eventEmitter.on(PROFILE_UPDATED_EVENT, handleProfileUpdate);

    return () => {
      eventEmitter.off(PROFILE_UPDATED_EVENT, handleProfileUpdate);
    };
  }, [fetchUserProfiles]);

  return { userProfiles, loading, refresh: fetchUserProfiles };
};
