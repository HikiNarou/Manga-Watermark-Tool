/**
 * useImages Hook
 * Provides image management state and actions
 * Requirements: 1.1-1.6
 */

import { useCallback } from 'react';
import { useAppContext } from '@/context';
import type { UploadedImage } from '@/types';
import { loadImage, loadImages } from '@/services/ImageProcessor';

export interface UseImagesReturn {
  // State
  images: UploadedImage[];
  selectedImageId: string | null;
  selectedImage: UploadedImage | null;
  hasImages: boolean;
  imageCount: number;

  // Actions
  addImages: (images: UploadedImage[]) => void;
  removeImage: (imageId: string) => void;
  clearImages: () => void;
  selectImage: (imageId: string | null) => void;
  markProcessed: (imageId: string) => void;

  // File loading helpers
  loadFromFiles: (files: File[], onProgress?: (loaded: number, total: number) => void) => Promise<{
    successful: UploadedImage[];
    failed: Array<{ file: File; error: Error }>;
  }>;
  loadFromFile: (file: File) => Promise<UploadedImage>;

  // Navigation helpers
  selectNext: () => void;
  selectPrevious: () => void;
  selectFirst: () => void;
  selectLast: () => void;
}

export function useImages(): UseImagesReturn {
  const { state, dispatch, selectedImage } = useAppContext();
  const { images, selectedImageId } = state;

  // Derived state
  const hasImages = images.length > 0;
  const imageCount = images.length;

  // Base actions
  const addImages = useCallback((newImages: UploadedImage[]) => {
    dispatch({ type: 'ADD_IMAGES', payload: newImages });
  }, [dispatch]);

  const removeImage = useCallback((imageId: string) => {
    dispatch({ type: 'REMOVE_IMAGE', payload: imageId });
  }, [dispatch]);

  const clearImages = useCallback(() => {
    dispatch({ type: 'CLEAR_IMAGES' });
  }, [dispatch]);

  const selectImage = useCallback((imageId: string | null) => {
    dispatch({ type: 'SELECT_IMAGE', payload: imageId });
  }, [dispatch]);

  const markProcessed = useCallback((imageId: string) => {
    dispatch({ type: 'MARK_IMAGE_PROCESSED', payload: imageId });
  }, [dispatch]);

  // File loading helpers
  const loadFromFiles = useCallback(async (
    files: File[],
    onProgress?: (loaded: number, total: number) => void
  ) => {
    const results = await loadImages(files, onProgress);
    
    const successful: UploadedImage[] = [];
    const failed: Array<{ file: File; error: Error }> = [];

    for (const { file, result } of results) {
      if (result instanceof Error) {
        failed.push({ file, error: result });
      } else {
        successful.push(result);
      }
    }

    if (successful.length > 0) {
      addImages(successful);
    }

    return { successful, failed };
  }, [addImages]);

  const loadFromFile = useCallback(async (file: File) => {
    const image = await loadImage(file);
    addImages([image]);
    return image;
  }, [addImages]);

  // Navigation helpers
  const selectNext = useCallback(() => {
    if (images.length === 0) return;
    
    const currentIndex = images.findIndex(img => img.id === selectedImageId);
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    const nextImage = images[nextIndex];
    if (nextImage) {
      selectImage(nextImage.id);
    }
  }, [images, selectedImageId, selectImage]);

  const selectPrevious = useCallback(() => {
    if (images.length === 0) return;
    
    const currentIndex = images.findIndex(img => img.id === selectedImageId);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    const prevImage = images[prevIndex];
    if (prevImage) {
      selectImage(prevImage.id);
    }
  }, [images, selectedImageId, selectImage]);

  const selectFirst = useCallback(() => {
    const firstImage = images[0];
    if (firstImage) {
      selectImage(firstImage.id);
    }
  }, [images, selectImage]);

  const selectLast = useCallback(() => {
    const lastImage = images[images.length - 1];
    if (lastImage) {
      selectImage(lastImage.id);
    }
  }, [images, selectImage]);

  return {
    // State
    images,
    selectedImageId,
    selectedImage,
    hasImages,
    imageCount,

    // Actions
    addImages,
    removeImage,
    clearImages,
    selectImage,
    markProcessed,

    // File loading helpers
    loadFromFiles,
    loadFromFile,

    // Navigation helpers
    selectNext,
    selectPrevious,
    selectFirst,
    selectLast,
  };
}
