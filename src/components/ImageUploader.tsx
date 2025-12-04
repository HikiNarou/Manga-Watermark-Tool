/**
 * ImageUploader Component
 * Handles drag & drop and file browser upload for images
 * Requirements: 1.1, 1.2
 */

import React, { useState, useCallback, useRef } from 'react';
import { isValidImageFormat } from '@/utils/validation';
import { SUPPORTED_IMAGE_FORMATS } from '@/types';

export interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
  isLoading?: boolean;
  progress?: { loaded: number; total: number } | null;
  disabled?: boolean;
  maxFiles?: number;
  className?: string;
}

export function ImageUploader({
  onFilesSelected,
  isLoading = false,
  progress = null,
  disabled = false,
  maxFiles,
  className = '',
}: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter valid files and report errors for invalid ones
  const processFiles = useCallback((fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    for (const file of files) {
      if (isValidImageFormat(file)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    }

    // Apply max files limit if specified
    const filesToUpload = maxFiles ? validFiles.slice(0, maxFiles) : validFiles;

    if (invalidFiles.length > 0) {
      setError(
        `Unsupported format: ${invalidFiles.slice(0, 3).join(', ')}${
          invalidFiles.length > 3 ? ` and ${invalidFiles.length - 3} more` : ''
        }. Supported: ${SUPPORTED_IMAGE_FORMATS.join(', ')}`
      );
    } else {
      setError(null);
    }

    if (filesToUpload.length > 0) {
      onFilesSelected(filesToUpload);
    }
  }, [onFilesSelected, maxFiles]);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isLoading) {
      setIsDragOver(true);
    }
  }, [disabled, isLoading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || isLoading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled, isLoading, processFiles]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [processFiles]);

  // Handle click to open file browser
  const handleClick = useCallback(() => {
    if (!disabled && !isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled, isLoading]);

  // Handle keyboard accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isLoading) {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }, [disabled, isLoading]);

  // Calculate progress percentage
  const progressPercent = progress 
    ? Math.round((progress.loaded / progress.total) * 100) 
    : 0;

  const acceptFormats = SUPPORTED_IMAGE_FORMATS.map(f => `.${f}`).join(',');

  return (
    <div className={`relative ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptFormats}
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isLoading}
        aria-label="Upload images"
      />

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled || isLoading ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center
          min-h-[200px] p-6 rounded-lg border-2 border-dashed
          transition-all duration-200 cursor-pointer
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
        aria-disabled={disabled || isLoading}
      >
        {/* Upload icon */}
        <svg
          className={`w-12 h-12 mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        {/* Text content */}
        {isLoading && progress ? (
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Loading images... {progress.loaded} / {progress.total}
            </p>
            {/* Progress bar */}
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progressPercent}%</p>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isDragOver ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-xs text-gray-500 mb-3">or</p>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={disabled || isLoading}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Browse Files
            </button>
            <p className="text-xs text-gray-400 mt-3">
              Supported: {SUPPORTED_IMAGE_FORMATS.join(', ').toUpperCase()}
            </p>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
