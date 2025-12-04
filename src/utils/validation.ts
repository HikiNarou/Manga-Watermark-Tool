/**
 * File Validation Utilities
 * Requirements: 1.3, 1.4
 */

import { SUPPORTED_IMAGE_FORMATS, type SupportedImageFormat } from '@/types';

/**
 * Default maximum file size in bytes (50MB)
 */
export const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Extract file extension from filename (lowercase, without dot)
 * @param filename - The filename to extract extension from
 * @returns The file extension in lowercase, or empty string if no extension
 */
export function getFileExtension(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return '';
  }
  
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return '';
  }
  
  return filename.slice(lastDotIndex + 1).toLowerCase();
}

/**
 * Check if a file has a valid/supported image format
 * Validates: Requirements 1.3, 1.4
 * 
 * @param filename - The filename or File object to validate
 * @returns true if the file format is supported (jpg, jpeg, png, webp, gif)
 */
export function isValidImageFormat(filename: string | File): boolean {
  const name = typeof filename === 'string' ? filename : filename.name;
  const extension = getFileExtension(name);
  
  if (!extension) {
    return false;
  }
  
  return SUPPORTED_IMAGE_FORMATS.includes(extension as SupportedImageFormat);
}

/**
 * Validation result for file size check
 */
export interface FileSizeValidationResult {
  valid: boolean;
  size: number;
  maxSize: number;
  message?: string;
}

/**
 * Validate file size against maximum allowed size
 * @param file - The File object to validate
 * @param maxSize - Maximum allowed size in bytes (default: 50MB)
 * @returns Validation result with details
 */
export function validateFileSize(
  file: File,
  maxSize: number = DEFAULT_MAX_FILE_SIZE
): FileSizeValidationResult {
  const size = file.size;
  const valid = size <= maxSize;
  
  const result: FileSizeValidationResult = {
    valid,
    size,
    maxSize,
  };
  if (!valid) {
    result.message = `File size (${formatFileSize(size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`;
  }
  return result;
}

/**
 * Format file size to human-readable string
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Complete file validation result
 */
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a file for upload (format and size)
 * @param file - The File object to validate
 * @param maxSize - Maximum allowed size in bytes
 * @returns Complete validation result
 */
export function validateFile(
  file: File,
  maxSize: number = DEFAULT_MAX_FILE_SIZE
): FileValidationResult {
  const errors: string[] = [];
  
  if (!isValidImageFormat(file)) {
    const ext = getFileExtension(file.name);
    errors.push(
      ext 
        ? `Unsupported file format: .${ext}. Supported formats: ${SUPPORTED_IMAGE_FORMATS.join(', ')}`
        : `File has no extension. Supported formats: ${SUPPORTED_IMAGE_FORMATS.join(', ')}`
    );
  }
  
  const sizeResult = validateFileSize(file, maxSize);
  if (!sizeResult.valid && sizeResult.message) {
    errors.push(sizeResult.message);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
