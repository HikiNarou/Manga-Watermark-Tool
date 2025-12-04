/**
 * ImageCropper Service
 * Handles image cropping operations
 */

import type { CropRegion, AspectRatio } from '@/types';
import { getAspectRatioValue } from '@/types';

/**
 * Apply crop to image data URL
 * @param imageDataUrl - Source image as data URL
 * @param region - Crop region
 * @returns Promise resolving to cropped image data URL
 */
export async function applyCrop(
  imageDataUrl: string,
  region: CropRegion
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Create canvas with crop dimensions
      const canvas = document.createElement('canvas');
      canvas.width = region.width;
      canvas.height = region.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to create canvas context'));
        return;
      }
      
      // Draw cropped region
      ctx.drawImage(
        img,
        region.x, region.y, region.width, region.height,
        0, 0, region.width, region.height
      );
      
      // Convert to data URL
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for cropping'));
    };
    
    img.src = imageDataUrl;
  });
}

/**
 * Calculate crop region from aspect ratio
 * Centers the crop region within the image
 */
export function calculateRegionFromAspectRatio(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: AspectRatio
): CropRegion {
  const ratio = getAspectRatioValue(aspectRatio);
  
  // Free aspect ratio - use full image
  if (ratio === null) {
    return {
      x: 0,
      y: 0,
      width: imageWidth,
      height: imageHeight,
    };
  }
  
  // Calculate dimensions that fit within image while maintaining aspect ratio
  let cropWidth: number;
  let cropHeight: number;
  
  const imageRatio = imageWidth / imageHeight;
  
  if (imageRatio > ratio) {
    // Image is wider than target ratio - constrain by height
    cropHeight = imageHeight;
    cropWidth = cropHeight * ratio;
  } else {
    // Image is taller than target ratio - constrain by width
    cropWidth = imageWidth;
    cropHeight = cropWidth / ratio;
  }
  
  // Center the crop region
  const x = (imageWidth - cropWidth) / 2;
  const y = (imageHeight - cropHeight) / 2;
  
  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(cropWidth),
    height: Math.round(cropHeight),
  };
}

/**
 * Validate crop region
 */
export function validateCropRegion(
  region: CropRegion,
  imageWidth: number,
  imageHeight: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (region.x < 0) {
    errors.push('Crop region x cannot be negative');
  }
  if (region.y < 0) {
    errors.push('Crop region y cannot be negative');
  }
  if (region.width <= 0) {
    errors.push('Crop region width must be positive');
  }
  if (region.height <= 0) {
    errors.push('Crop region height must be positive');
  }
  if (region.x + region.width > imageWidth) {
    errors.push('Crop region exceeds image width');
  }
  if (region.y + region.height > imageHeight) {
    errors.push('Crop region exceeds image height');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Clamp crop region to image bounds
 */
export function clampCropRegion(
  region: CropRegion,
  imageWidth: number,
  imageHeight: number
): CropRegion {
  const x = Math.max(0, Math.min(region.x, imageWidth - 1));
  const y = Math.max(0, Math.min(region.y, imageHeight - 1));
  const width = Math.max(1, Math.min(region.width, imageWidth - x));
  const height = Math.max(1, Math.min(region.height, imageHeight - y));
  
  return { x, y, width, height };
}

/**
 * Constrain crop region to aspect ratio while keeping it within bounds
 */
export function constrainToAspectRatio(
  region: CropRegion,
  aspectRatio: AspectRatio,
  imageWidth: number,
  imageHeight: number
): CropRegion {
  const ratio = getAspectRatioValue(aspectRatio);
  
  if (ratio === null) {
    return region;
  }
  
  let { x, y, width, height } = region;
  const currentRatio = width / height;
  
  if (currentRatio > ratio) {
    // Too wide - reduce width
    width = height * ratio;
  } else {
    // Too tall - reduce height
    height = width / ratio;
  }
  
  // Ensure within bounds
  if (x + width > imageWidth) {
    x = imageWidth - width;
  }
  if (y + height > imageHeight) {
    y = imageHeight - height;
  }
  
  return clampCropRegion(
    { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) },
    imageWidth,
    imageHeight
  );
}
