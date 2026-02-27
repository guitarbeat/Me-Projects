/**
 * Sharing-related Types
 *
 * Types for calendar sharing functionality.
 * Uses BaseUserProfile for user data consistency.
 */

import type { BaseUserProfile } from './user';

/**
 * User data for sharing features.
 * Extends BaseUserProfile but requires username for display.
 */
export interface SharedUser extends Omit<BaseUserProfile, 'username'> {
  username: string;
}

/**
 * Record of a share relationship where the current user is the owner.
 */
export interface ShareRecord {
  id: string;
  owner_id: string;
  shared_with_id: string;
  created_at: string;
  shared_with: SharedUser;
}

/**
 * Record of a share relationship where someone shared with the current user.
 */
export interface SharedWithMeRecord {
  id: string;
  owner_id: string;
  shared_with_id: string;
  created_at: string;
  owner: SharedUser;
}
