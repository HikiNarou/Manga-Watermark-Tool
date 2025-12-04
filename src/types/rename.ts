/**
 * Batch Rename Types
 * Types for batch rename functionality
 */

export interface RenamePattern {
  pattern: string;    // e.g., "Chapter{chapter}_{page}"
  chapter: string;    // Chapter number/name
  startPage: number;  // Starting page number
  padLength: number;  // Zero-padding length (e.g., 3 = 001)
}

export interface RenameSettings {
  enabled: boolean;
  pattern: RenamePattern;
}

export const PATTERN_VARIABLES = [
  { variable: '{chapter}', description: 'Chapter number' },
  { variable: '{page}', description: 'Page number (zero-padded)' },
  { variable: '{original}', description: 'Original filename' },
  { variable: '{date}', description: 'Current date (YYYY-MM-DD)' },
  { variable: '{index}', description: 'Sequential index' },
] as const;

export function createDefaultRenamePattern(): RenamePattern {
  return {
    pattern: 'Chapter{chapter}_{page}',
    chapter: '01',
    startPage: 1,
    padLength: 3,
  };
}

export function createDefaultRenameSettings(): RenameSettings {
  return {
    enabled: false,
    pattern: createDefaultRenamePattern(),
  };
}

/**
 * Generate filename from pattern
 */
export function generateFilename(
  pattern: RenamePattern,
  originalName: string,
  index: number
): string {
  const pageNumber = pattern.startPage + index;
  const paddedPage = String(pageNumber).padStart(pattern.padLength, '0');
  const paddedIndex = String(index).padStart(pattern.padLength, '0');
  const date = new Date().toISOString().split('T')[0] ?? ''; // YYYY-MM-DD
  
  // Remove extension from original name
  const originalBase = originalName.replace(/\.[^/.]+$/, '');
  
  let result = pattern.pattern
    .replace(/{chapter}/g, pattern.chapter)
    .replace(/{page}/g, paddedPage)
    .replace(/{original}/g, originalBase)
    .replace(/{date}/g, date)
    .replace(/{index}/g, paddedIndex);
  
  return result;
}

/**
 * Preview all filenames
 */
export function previewFilenames(
  pattern: RenamePattern,
  originalNames: string[]
): string[] {
  return originalNames.map((name, index) => generateFilename(pattern, name, index));
}

/**
 * Validate pattern
 */
export function validatePattern(pattern: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!pattern || pattern.trim().length === 0) {
    errors.push('Pattern cannot be empty');
  }
  
  // Check for invalid characters in filename
  const invalidChars = /[<>:"/\\|?*]/g;
  if (invalidChars.test(pattern.replace(/{[^}]+}/g, ''))) {
    errors.push('Pattern contains invalid filename characters');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Ensure unique filenames by appending suffix
 */
export function ensureUnique(filenames: string[]): string[] {
  const seen = new Map<string, number>();
  const result: string[] = [];
  
  for (const filename of filenames) {
    const count = seen.get(filename) ?? 0;
    if (count > 0) {
      result.push(`${filename}_${count}`);
    } else {
      result.push(filename);
    }
    seen.set(filename, count + 1);
  }
  
  return result;
}
