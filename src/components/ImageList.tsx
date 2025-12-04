/**
 * ImageList Component
 * Displays thumbnails of uploaded images with file info and drag-to-reorder
 * Requirements: 1.5, 1.6
 */

import React, { useCallback, useState } from 'react';
import type { UploadedImage } from '@/types';
import { formatFileSize } from '@/utils/validation';

export interface ImageListProps {
  images: UploadedImage[];
  selectedImageId: string | null;
  onSelectImage: (imageId: string) => void;
  onRemoveImage?: (imageId: string) => void;
  onReorderImages?: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

export function ImageList({
  images,
  selectedImageId,
  onSelectImage,
  onRemoveImage,
  onReorderImages,
  className = '',
}: ImageListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex && onReorderImages) {
      onReorderImages(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, onReorderImages]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

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
        {onReorderImages && (
          <span className="text-xs text-gray-400">Drag to reorder</span>
        )}
      </div>
      
      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
        {images.map((image, index) => (
          <ImageListItem
            key={image.id}
            image={image}
            index={index}
            isSelected={image.id === selectedImageId}
            isDragging={draggedIndex === index}
            isDragOver={dragOverIndex === index}
            onSelect={() => onSelectImage(image.id)}
            onRemove={onRemoveImage ? () => onRemoveImage(image.id) : undefined}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            draggable={!!onReorderImages}
          />
        ))}
      </div>
    </div>
  );
}

interface ImageListItemProps {
  image: UploadedImage;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onSelect: () => void;
  onRemove?: (() => void) | undefined;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  draggable: boolean;
}

function ImageListItem({
  image,
  index,
  isSelected,
  isDragging,
  isDragOver,
  onSelect,
  onRemove,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  draggable,
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
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`
        flex items-center gap-2 p-2 rounded-lg cursor-pointer
        transition-all duration-150
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isDragOver ? 'border-t-2 border-blue-500 mt-1' : ''}
        ${isSelected 
          ? 'bg-blue-100 border-2 border-blue-500' 
          : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
      `}
      aria-selected={isSelected}
      aria-label={`${image.name}, ${image.width}x${image.height}, ${formatFileSize(image.size)}`}
    >
      {/* Drag Handle */}
      {draggable && (
        <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        </div>
      )}

      {/* Index Number */}
      <div className="flex-shrink-0 w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-600">{index + 1}</span>
      </div>

      {/* Thumbnail */}
      <div className="flex-shrink-0 w-10 h-10 rounded overflow-hidden bg-gray-100">
        <img
          src={image.dataUrl}
          alt={image.name}
          className="w-full h-full object-cover"
          loading="lazy"
          draggable={false}
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
