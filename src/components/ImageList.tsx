/**
 * ImageList Component
 * Displays thumbnails of uploaded images with file info
 * Requirements: 1.5, 1.6
 */

import React, { useCallback } from 'react';
import type { UploadedImage } from '@/types';
import { formatFileSize } from '@/utils/validation';

export interface ImageListProps {
  images: UploadedImage[];
  selectedImageId: string | null;
  onSelectImage: (imageId: string) => void;
  onRemoveImage?: (imageId: string) => void;
  className?: string;
}

export function ImageList({
  images,
  selectedImageId,
  onSelectImage,
  onRemoveImage,
  className = '',
}: ImageListProps) {
  if (images.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <p className="text-sm">No images uploaded yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">
          Images ({images.length})
        </h3>
      </div>
      
      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
        {images.map((image) => (
          <ImageListItem
            key={image.id}
            image={image}
            isSelected={image.id === selectedImageId}
            onSelect={() => onSelectImage(image.id)}
            onRemove={onRemoveImage ? () => onRemoveImage(image.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

interface ImageListItemProps {
  image: UploadedImage;
  isSelected: boolean;
  onSelect: () => void;
  onRemove?: (() => void) | undefined;
}

function ImageListItem({
  image,
  isSelected,
  onSelect,
  onRemove,
}: ImageListItemProps) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  }, [onSelect]);

  const handleRemoveClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  }, [onRemove]);

  const handleRemoveKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onRemove?.();
    }
  }, [onRemove]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={`
        flex items-center gap-3 p-2 rounded-lg cursor-pointer
        transition-all duration-150
        ${isSelected 
          ? 'bg-blue-100 border-2 border-blue-500' 
          : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
      `}
      aria-selected={isSelected}
      aria-label={`${image.name}, ${image.width}x${image.height}, ${formatFileSize(image.size)}`}
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-gray-100">
        <img
          src={image.dataUrl}
          alt={image.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate" title={image.name}>
          {image.name}
        </p>
        <p className="text-xs text-gray-500">
          {image.width} × {image.height} • {formatFileSize(image.size)}
        </p>
        {image.processed && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
            Processed
          </span>
        )}
      </div>

      {/* Remove button */}
      {onRemove && (
        <button
          type="button"
          onClick={handleRemoveClick}
          onKeyDown={handleRemoveKeyDown}
          className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label={`Remove ${image.name}`}
          title="Remove image"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default ImageList;
