/**
 * API Key Manager Service
 * Handles storage, retrieval, and validation of Gemini API keys
 * Requirements: 1.1, 1.2, 1.3, 1.5
 */

const STORAGE_KEY = 'gemini_api_key_v1';
const API_KEY_PREFIX = 'AIza';

/**
 * Simple obfuscation for API key storage
 * Note: This is NOT encryption - just basic obfuscation to prevent casual viewing
 * For production, consider using more secure methods
 */
function obfuscate(value: string): string {
  // Base64 encode with a simple character shift
  const base64 = btoa(value);
  return base64.split('').map(char => {
    const code = char.charCodeAt(0);
    return String.fromCharCode(code + 3);
  }).join('');
}

/**
 * Reverse the obfuscation
 */
function deobfuscate(value: string): string {
  try {
    const shifted = value.split('').map(char => {
      const code = char.charCodeAt(0);
      return String.fromCharCode(code - 3);
    }).join('');
    return atob(shifted);
  } catch {
    return '';
  }
}

/**
 * API Key Manager - Static class for managing Gemini API keys
 */
export class APIKeyManager {
  /**
   * Store API key in localStorage with obfuscation
   * Requirements: 1.2
   */
  static store(apiKey: string): void {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Invalid API key: must be a non-empty string');
    }
    
    const obfuscated = obfuscate(apiKey);
    localStorage.setItem(STORAGE_KEY, obfuscated);
  }

  /**
   * Retrieve API key from localStorage
   * Requirements: 1.2
   */
  static retrieve(): string | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    
    const deobfuscated = deobfuscate(stored);
    return deobfuscated || null;
  }

  /**
   * Clear stored API key
   * Requirements: 1.5
   */
  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Check if an API key is stored
   */
  static hasStoredKey(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  /**
   * Validate API key format
   * Gemini API keys start with "AIza"
   * Requirements: 1.3
   */
  static validateFormat(apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }
    
    // Gemini API keys:
    // - Start with "AIza"
    // - Are typically 39 characters long
    // - Contain alphanumeric characters, underscores, and hyphens
    const trimmed = apiKey.trim();
    
    if (!trimmed.startsWith(API_KEY_PREFIX)) {
      return false;
    }
    
    if (trimmed.length < 30 || trimmed.length > 50) {
      return false;
    }
    
    // Check for valid characters
    const validPattern = /^[A-Za-z0-9_-]+$/;
    return validPattern.test(trimmed);
  }

  /**
   * Test connection with Gemini API
   * Requirements: 1.4
   */
  static async testConnection(apiKey: string): Promise<{ success: boolean; error?: string }> {
    if (!this.validateFormat(apiKey)) {
      return { success: false, error: 'Invalid API key format' };
    }

    try {
      // Use the Gemini API models endpoint to test the key
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        return { success: true };
      }

      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `HTTP ${response.status}`;
      
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        return { success: false, error: 'Invalid API key' };
      }
      
      if (response.status === 429) {
        return { success: false, error: 'Rate limited - please try again later' };
      }

      return { success: false, error: errorMessage };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error';
      return { success: false, error: `Connection failed: ${message}` };
    }
  }

  /**
   * Get the API key prefix for validation
   */
  static getExpectedPrefix(): string {
    return API_KEY_PREFIX;
  }
}

// Export helper functions for testing
export { obfuscate, deobfuscate };
