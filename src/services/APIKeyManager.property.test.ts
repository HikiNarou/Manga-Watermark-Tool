/**
 * Property-Based Tests for APIKeyManager
 * Feature: ai-image-editing
 * Tests Properties 1-2 from design document
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { APIKeyManager, obfuscate, deobfuscate } from './APIKeyManager';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('APIKeyManager Property Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  /**
   * **Feature: ai-image-editing, Property 1: API Key Storage Round-Trip**
   * **Validates: Requirements 1.2**
   * 
   * For any valid API key string, storing it with APIKeyManager and then
   * retrieving it SHALL return the original key value.
   */
  describe('Property 1: API Key Storage Round-Trip', () => {
    it('should preserve API key after store and retrieve', () => {
      fc.assert(
        fc.property(
          // Generate valid API key format strings
          fc.string({ minLength: 30, maxLength: 50 }).map(s => {
            // Ensure it starts with AIza and contains only valid chars
            const validChars = s.replace(/[^A-Za-z0-9_-]/g, 'x');
            return 'AIza' + validChars.slice(0, 35);
          }),
          (apiKey) => {
            // Store the key
            APIKeyManager.store(apiKey);
            
            // Retrieve the key
            const retrieved = APIKeyManager.retrieve();
            
            // Should match original
            expect(retrieved).toBe(apiKey);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle any non-empty string for storage', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (apiKey) => {
            // Store the key
            APIKeyManager.store(apiKey);
            
            // Retrieve the key
            const retrieved = APIKeyManager.retrieve();
            
            // Should match original
            expect(retrieved).toBe(apiKey);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('obfuscate and deobfuscate should be inverse operations', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (original) => {
            const obfuscated = obfuscate(original);
            const deobfuscated = deobfuscate(obfuscated);
            expect(deobfuscated).toBe(original);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: ai-image-editing, Property 2: Invalid API Key Rejection**
   * **Validates: Requirements 1.3**
   * 
   * For any string that does not match the Gemini API key format
   * (not starting with "AIza"), validateFormat SHALL return false.
   */
  describe('Property 2: Invalid API Key Rejection', () => {
    it('should reject strings not starting with AIza', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.startsWith('AIza')),
          (invalidKey) => {
            const isValid = APIKeyManager.validateFormat(invalidKey);
            expect(isValid).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject empty strings', () => {
      expect(APIKeyManager.validateFormat('')).toBe(false);
    });

    it('should reject null and undefined', () => {
      expect(APIKeyManager.validateFormat(null as unknown as string)).toBe(false);
      expect(APIKeyManager.validateFormat(undefined as unknown as string)).toBe(false);
    });

    it('should reject keys that are too short', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 25 }),
          (length) => {
            const shortKey = 'AIza' + 'x'.repeat(length);
            const isValid = APIKeyManager.validateFormat(shortKey);
            expect(isValid).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject keys that are too long', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 51, max: 100 }),
          (length) => {
            const longKey = 'AIza' + 'x'.repeat(length);
            const isValid = APIKeyManager.validateFormat(longKey);
            expect(isValid).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject keys with invalid characters', () => {
      const invalidChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', ' ', '.', ','];
      
      invalidChars.forEach(char => {
        // Use length 29 so total is 33 (within valid range) but has invalid char
        const keyWithInvalidChar = 'AIza' + 'x'.repeat(26) + char + 'xx';
        expect(APIKeyManager.validateFormat(keyWithInvalidChar)).toBe(false);
      });
    });

    it('should accept valid API key format', () => {
      fc.assert(
        fc.property(
          // Generate valid length (26-46 chars after AIza prefix to make total 30-50)
          fc.integer({ min: 26, max: 46 }),
          fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'),
          (length, charSet) => {
            const validKey = 'AIza' + charSet.repeat(length).slice(0, length);
            const isValid = APIKeyManager.validateFormat(validKey);
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('APIKeyManager Additional Tests', () => {
    it('should clear stored key', () => {
      APIKeyManager.store('AIza' + 'x'.repeat(35));
      expect(APIKeyManager.hasStoredKey()).toBe(true);
      
      APIKeyManager.clear();
      expect(APIKeyManager.hasStoredKey()).toBe(false);
      expect(APIKeyManager.retrieve()).toBeNull();
    });

    it('should return null when no key is stored', () => {
      expect(APIKeyManager.retrieve()).toBeNull();
    });

    it('should report correct stored key status', () => {
      expect(APIKeyManager.hasStoredKey()).toBe(false);
      
      APIKeyManager.store('AIza' + 'x'.repeat(35));
      expect(APIKeyManager.hasStoredKey()).toBe(true);
    });

    it('should return correct expected prefix', () => {
      expect(APIKeyManager.getExpectedPrefix()).toBe('AIza');
    });
  });
});
