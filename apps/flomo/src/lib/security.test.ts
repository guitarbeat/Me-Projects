import { describe, it, expect } from 'vitest';
import { hashPin, legacyHashPin, verifyPin } from './security';

describe('Security Utils', () => {
  const userId = 'user-123';
  const pin = '1234';

  describe('legacyHashPin', () => {
    it('should match the old implementation', () => {
      // Using the exact implementation logic to verify backward compatibility
      // pin '1234' results in 'pin_170842'
      const hash = legacyHashPin(pin);
      expect(hash).toBe('pin_170842');
    });
  });

  describe('hashPin', () => {
    it('should return a SHA-256 hex string', async () => {
      const hash = await hashPin(pin, userId);
      // SHA-256 hex string is 64 characters long
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should be deterministic with same salt', async () => {
      const hash1 = await hashPin(pin, userId);
      const hash2 = await hashPin(pin, userId);
      expect(hash1).toBe(hash2);
    });

    it('should be different with different salt', async () => {
      const hash1 = await hashPin(pin, userId);
      const hash2 = await hashPin(pin, 'other-user');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPin', () => {
    it('should verify legacy hash', async () => {
      const legacyHash = legacyHashPin(pin);
      const isValid = await verifyPin(pin, legacyHash, userId);
      expect(isValid).toBe(true);
    });

    it('should verify secure hash', async () => {
      const secureHash = await hashPin(pin, userId);
      const isValid = await verifyPin(pin, secureHash, userId);
      expect(isValid).toBe(true);
    });

    it('should fail with wrong pin for legacy hash', async () => {
      const legacyHash = legacyHashPin(pin);
      const isValid = await verifyPin('0000', legacyHash, userId);
      expect(isValid).toBe(false);
    });

    it('should fail with wrong pin for secure hash', async () => {
      const secureHash = await hashPin(pin, userId);
      const isValid = await verifyPin('0000', secureHash, userId);
      expect(isValid).toBe(false);
    });

    it('should fail if stored hash is empty', async () => {
      const isValid = await verifyPin(pin, '', userId);
      expect(isValid).toBe(false);
    });
  });
});
