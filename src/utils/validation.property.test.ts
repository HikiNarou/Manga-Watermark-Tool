/**
 * Property-Based Tests for File Validation Utilities
 * 
 * **Feature: manga-watermark-tool, Property 1: File Format Validation**
 * **Validates: Requirements 1.3, 1.4**
 * 
 * Property 1: File Format Validation
 * *For any* file uploaded to the system, the file SHALL be accepted if and only if 
 * its extension is one of the supported formats (jpg, jpeg, png, webp, gif), 
 * and rejected otherwise with an appropriate error.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { isValidImageFormat, getFileExtension } from './validation';
import { SUPPORTED_IMAGE_FORMATS } from '@/types';
import { 
  arbValidImageFilename, 
  arbInvalidImageFilename,
  createMockFile 
} from '@/test/helpers';

describe('Property 1: File Format Validation', () => {
  /**
   * **Feature: manga-watermark-tool, Property 1: File Format Validation**
   * **Validates: Requirements 1.3, 1.4**
   * 
   * For any filename with a supported extension (jpg, jpeg, png, webp, gif),
   * isValidImageFormat SHALL return true.
   */
  it('should accept all files with supported image extensions', () => {
    fc.assert(
      fc.property(arbValidImageFilename, (filename) => {
        const result = isValidImageFormat(filename);
        expect(result).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 1: File Format Validation**
   * **Validates: Requirements 1.3, 1.4**
   * 
   * For any filename with an unsupported extension,
   * isValidImageFormat SHALL return false.
   */
  it('should reject all files with unsupported extensions', () => {
    fc.assert(
      fc.property(arbInvalidImageFilename, (filename) => {
        const result = isValidImageFormat(filename);
        expect(result).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 1: File Format Validation**
   * **Validates: Requirements 1.3, 1.4**
   * 
   * For any supported format, a File object with that extension
   * SHALL be accepted by isValidImageFormat.
   */
  it('should accept File objects with supported extensions', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_IMAGE_FORMATS),
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0 && !s.includes('.')),
        (format, baseName) => {
          const filename = `${baseName}.${format}`;
          const file = createMockFile(filename, `image/${format === 'jpg' ? 'jpeg' : format}`);
          const result = isValidImageFormat(file);
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 1: File Format Validation**
   * **Validates: Requirements 1.3, 1.4**
   * 
   * Extension extraction is case-insensitive: uppercase and lowercase
   * extensions SHALL be treated equivalently.
   */
  it('should handle case-insensitive extension matching', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_IMAGE_FORMATS),
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0 && !s.includes('.')),
        fc.boolean(),
        (format, baseName, useUpperCase) => {
          const ext = useUpperCase ? format.toUpperCase() : format;
          const filename = `${baseName}.${ext}`;
          const result = isValidImageFormat(filename);
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 1: File Format Validation**
   * **Validates: Requirements 1.3, 1.4**
   * 
   * Files without extensions SHALL be rejected.
   */
  it('should reject files without extensions', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('.')),
        (filename) => {
          const result = isValidImageFormat(filename);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 1: File Format Validation**
   * **Validates: Requirements 1.3, 1.4**
   * 
   * getFileExtension SHALL correctly extract the extension from any filename.
   */
  it('should correctly extract file extensions', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0 && !s.includes('.')),
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0 && !s.includes('.')),
        (baseName, extension) => {
          const filename = `${baseName}.${extension}`;
          const result = getFileExtension(filename);
          expect(result).toBe(extension.toLowerCase());
        }
      ),
      { numRuns: 100 }
    );
  });
});
