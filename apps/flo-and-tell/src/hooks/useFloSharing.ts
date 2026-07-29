import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/useToast';
import { useLoadingState } from '@/hooks/useLoadingState';
import { getDisplayName, fetchAvailableProfiles } from '@/lib/profileUtils';
import type { SharedUser } from '@/types/sharing';

export const useFloSharing = () => {
  const { user } = useAuth();
  const [sharedWith, setSharedWith] = useState<SharedUser[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<SharedUser[]>([]);
  const [availableUsers, setAvailableUsers] = useState<SharedUser[]>([]);
  const [availableUsersLoaded, setAvailableUsersLoaded] = useState(false);
  const { loading, setLoading } = useLoadingState({ initialLoading: true });

  // Fetch users I'm sharing with
  const fetchSharedWith = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      // Get share records first
      const { data: shares, error: sharesError } = await supabase
        .from('flo_shares')
        .select('id, shared_with_id')
        .eq('owner_id', user.id);

      if (sharesError) {
        throw sharesError;
      }
      if (!shares || shares.length === 0) {
        setSharedWith([]);
        return;
      }

      // Then fetch profiles for those users
      const userIds = shares.map((s) => s.shared_with_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        throw profilesError;
      }

      const users: SharedUser[] = (profiles || []).map((p) => ({
        id: p.id,
        username: p.username || '',
        display_name: p.display_name,
        avatar_url: p.avatar_url,
      }));

      setSharedWith(users);
    } catch (err) {
      console.error('Error fetching shared users:', err);
    }
  }, [user]);

  // Fetch users sharing with me
  const fetchSharedWithMe = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      // Get share records first
      const { data: shares, error: sharesError } = await supabase
        .from('flo_shares')
        .select('id, owner_id')
        .eq('shared_with_id', user.id);

      if (sharesError) {
        throw sharesError;
      }
      if (!shares || shares.length === 0) {
        setSharedWithMe([]);
        return;
      }

      // Then fetch profiles for those owners
      const ownerIds = shares.map((s) => s.owner_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', ownerIds);

      if (profilesError) {
        throw profilesError;
      }

      const users: SharedUser[] = (profiles || []).map((p) => ({
        id: p.id,
        username: p.username || '',
        display_name: p.display_name,
        avatar_url: p.avatar_url,
      }));

      setSharedWithMe(users);
    } catch (err) {
      console.error('Error fetching users sharing with me:', err);
    }
  }, [user]);

  // Lazy-load available users only when needed (e.g., when sharing dialog opens)
  const loadAvailableUsers = useCallback(async () => {
    if (!user || availableUsersLoaded) {
      return;
    }

    try {
      const profiles = await fetchAvailableProfiles(user.id, 50);
      setAvailableUsers(
        profiles.map((u) => ({
          id: u.id,
          username: u.username || '',
          display_name: u.display_name,
          avatar_url: u.avatar_url,
        }))
      );
      setAvailableUsersLoaded(true);
    } catch (err) {
      console.error('Error fetching available users:', err);
    }
  }, [user, availableUsersLoaded]);

  // Add a share
  const addShare = useCallback(
    async (targetUserId: string) => {
      if (!user) {
        return false;
      }

      try {
        const { error } = await supabase.from('flo_shares').insert({
          owner_id: user.id,
          shared_with_id: targetUserId,
        });

        if (error) {
          throw error;
        }

        await fetchSharedWith();
        return true;
      } catch (err) {
        console.error('Error adding share:', err);
        return false;
      }
    },
    [user, fetchSharedWith]
  );

  // Remove a share
  const removeShare = useCallback(
    async (targetUserId: string) => {
      if (!user) {
        return false;
      }

      try {
        const { error } = await supabase
          .from('flo_shares')
          .delete()
          .eq('owner_id', user.id)
          .eq('shared_with_id', targetUserId);

        if (error) {
          throw error;
        }

        await fetchSharedWith();
        return true;
      } catch (err) {
        console.error('Error removing share:', err);
        return false;
      }
    },
    [user, fetchSharedWith]
  );

  // Initial fetch - only load critical sharing data, not available users
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Only fetch sharing relationships on initial load
      // Available users are lazy-loaded when the sharing dialog opens
      await Promise.all([fetchSharedWith(), fetchSharedWithMe()]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user, fetchSharedWith, fetchSharedWithMe, setLoading]);

  // Track known share IDs to detect new ones
  const knownShareIds = useRef<Set<string>>(new Set());
  const initialLoadComplete = useRef(false);

  // Update known IDs when sharedWithMe changes
  useEffect(() => {
    if (!initialLoadComplete.current && !loading && sharedWithMe.length >= 0) {
      // Mark initial load complete and store current IDs
      sharedWithMe.forEach((u) => knownShareIds.current.add(u.id));
      initialLoadComplete.current = true;
    }
  }, [sharedWithMe, loading]);

  // Real-time subscription for shares with notifications
  useEffect(() => {
    if (!user) {
      return;
    }

    const channel = supabase
      .channel('flo-shares-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flo_shares',
          filter: `owner_id=eq.${user.id}`,
        },
        () => {
          fetchSharedWith();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'flo_shares',
          filter: `shared_with_id=eq.${user.id}`,
        },
        async (payload) => {
          // Fetch the owner's profile to show in notification
          const { data: ownerProfile } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('id', payload.new.owner_id)
            .maybeSingle();

          if (ownerProfile) {
            const name = getDisplayName(ownerProfile);
            toast({
              title: 'New Calendar Shared',
              description: `${name} is now sharing their calendar with you!`,
            });
          }

          fetchSharedWithMe();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'flo_shares',
          filter: `shared_with_id=eq.${user.id}`,
        },
        async (payload) => {
          const { data: ownerProfile } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('id', payload.old.owner_id)
            .maybeSingle();

          if (ownerProfile) {
            const name = getDisplayName(ownerProfile);
            toast({
              title: 'Calendar Unshared',
              description: `${name} stopped sharing their calendar with you.`,
            });
          }

          fetchSharedWithMe();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchSharedWith, fetchSharedWithMe]);

  return {
    sharedWith,
    sharedWithMe,
    availableUsers,
    loading,
    addShare,
    removeShare,
    loadAvailableUsers, // Exposed for lazy loading
    refresh: async () => {
      await Promise.all([fetchSharedWith(), fetchSharedWithMe()]);
    },
  };
};
