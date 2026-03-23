import { supabase } from '@/integrations/supabase/client';
import type { BaseUserProfile } from '@/types/user';

/**
 * Profile utility functions for fetching and managing user profiles.
 * This is the single source of truth for profile-related operations.
 */

/**
 * Normalize username for consistent comparison and storage.
 */
export const normalizeUsername = (username: string): string => {
  return username.trim().toLowerCase();
};

/**
 * Fetch a single profile by ID.
 */
export async function fetchProfileById(
  userId: string
): Promise<BaseUserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }
    return data;
  } catch (err) {
    console.error('Error fetching profile:', err);
    return null;
  }
}

/**
 * Fetch a profile by username (case-insensitive).
 */
export async function fetchProfileByUsername(
  username: string
): Promise<BaseUserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .ilike('username', username)
      .single();

    if (error) {
      throw error;
    }
    return data;
  } catch (err) {
    console.error('Error fetching profile by username:', err);
    return null;
  }
}

/**
 * Fetch available users for sharing (excludes current user and anonymous).
 */
export async function fetchAvailableProfiles(
  excludeUserId: string,
  limit = 50
): Promise<BaseUserProfile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .not('id', 'eq', excludeUserId)
      .not('username', 'is', null)
      .not('username', 'ilike', 'anonymous_%')
      .limit(limit);

    if (error) {
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('Error fetching available profiles:', err);
    return [];
  }
}

/**
 * Fetch public profiles for user lists (uses RPC for security).
 */
export async function fetchPublicProfiles(): Promise<BaseUserProfile[]> {
  try {
    const { data, error } = await supabase.rpc('get_existing_usernames');

    if (error) {
      throw error;
    }

    // Map RPC response to BaseUserProfile format
    return (data || []).map(
      (user: {
        username: string;
        display_name: string;
        avatar_url: string;
      }) => ({
        id: '', // RPC doesn't return ID for security
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
      })
    );
  } catch (err) {
    console.error('Error fetching public profiles:', err);
    return [];
  }
}

/**
 * Get display name with fallback to username.
 * Provides consistent display name resolution across the app.
 */
export function getDisplayName(profile: {
  display_name?: string | null;
  username?: string | null;
}): string {
  return profile.display_name || profile.username || 'Unknown';
}
