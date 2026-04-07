/**
 * Security utilities for PIN management and verification.
 */

/**
 * Legacy weak hash function (for backward compatibility).
 * Used to verify existing PINs before migrating to secure hash.
 */
export const legacyHashPin = (pin: string): string => {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `pin_${Math.abs(hash).toString(16)}`;
};

/**
 * Secure hash function using SHA-256.
 * Uses the user's ID as a salt to prevent rainbow table attacks.
 */
export const hashPin = async (pin: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  // Combine PIN and salt (userId)
  const data = encoder.encode(pin + salt);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
};

/**
 * Verify PIN against stored hash.
 * Handles both legacy (weak) hashes and new (secure) hashes.
 */
export const verifyPin = async (
  pin: string,
  storedHash: string,
  userId: string
): Promise<boolean> => {
  if (!storedHash) {
    return false;
  }

  // Check for legacy hash format
  if (storedHash.startsWith('pin_')) {
    return legacyHashPin(pin) === storedHash;
  }

  // Check secure hash
  const newHash = await hashPin(pin, userId);
  return newHash === storedHash;
};
