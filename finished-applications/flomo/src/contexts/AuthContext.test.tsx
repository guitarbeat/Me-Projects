import { describe, it, expect } from 'vitest';
import { validateUsername } from './AuthContext';

describe('validateUsername', () => {
  it('should return null for valid usernames', () => {
    expect(validateUsername('user')).toBeNull();
    expect(validateUsername('user123')).toBeNull();
    expect(validateUsername('user-name')).toBeNull();
    expect(validateUsername('user_name')).toBeNull();
    expect(validateUsername('USER')).toBeNull(); // Should be case-insensitive (cleaned internally)
  });

  it('should return error for empty or whitespace-only usernames', () => {
    expect(validateUsername('')).toBe('Username is required');
    expect(validateUsername('   ')).toBe('Username is required');
  });

  it('should return error for usernames shorter than 2 characters', () => {
    expect(validateUsername('a')).toBe(
      'Username must be at least 2 characters'
    );
    expect(validateUsername('1')).toBe(
      'Username must be at least 2 characters'
    );
  });

  it('should return error for usernames longer than 50 characters', () => {
    const longName = 'a'.repeat(51);
    expect(validateUsername(longName)).toBe(
      'Username must be less than 50 characters'
    );
  });

  it('should return error for usernames with invalid characters', () => {
    expect(validateUsername('user name')).toBe(
      'Username can only contain letters, numbers, hyphens, and underscores'
    );
    expect(validateUsername('user.name')).toBe(
      'Username can only contain letters, numbers, hyphens, and underscores'
    );
    expect(validateUsername('user@name')).toBe(
      'Username can only contain letters, numbers, hyphens, and underscores'
    );
    expect(validateUsername('<script>')).toBe(
      'Username can only contain letters, numbers, hyphens, and underscores'
    );
    expect(validateUsername('user!')).toBe(
      'Username can only contain letters, numbers, hyphens, and underscores'
    );
  });
});
