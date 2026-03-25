/**
 * User and Profile Types
 *
 * Centralized type definitions for user-related data structures.
 * All user/profile types should extend or use these base types.
 */

/**
 * Base user profile with common fields used across the app.
 * This is the minimal profile representation used for display purposes.
 */
export interface BaseUserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

/**
 * Full user profile with all database fields.
 * Extends BaseUserProfile with additional metadata.
 */
export interface UserProfile extends BaseUserProfile {
  email: string | null;
  first_name: string | null;
  created_at: string;
  is_private: boolean;
  has_custom_password: boolean;
  pin_hash?: string | null;
}

/**
 * Profile data for bubble display and sharing features.
 * Uses required id and username for display purposes.
 */
export interface UserBubbleProfile {
  id: string;
  username: string;
  display_name?: string | undefined;
  avatar_url: string | null;
}

/**
 * Authenticated user object from Supabase Auth.
 */
export interface AuthUser {
  id: string;
  user_metadata?: {
    username?: string;
    display_name?: string;
    first_name?: string;
    avatar_url?: string;
    original_user_id?: string;
    original_username?: string;
  };
}

/**
 * Local user representation for localStorage persistence.
 * Uses camelCase to match JavaScript conventions.
 */
export interface LocalUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}
