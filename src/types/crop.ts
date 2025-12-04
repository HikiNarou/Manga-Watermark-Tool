/**
 * Crop Types
 * Types for image cropping functionality
 */

export interface CropRegion {
  x: number;      // Left position (px)
  y: number;      // Top position (px)
  width: number;  // Width (px)
  height: number; // Height (px)
}

export type AspectRatio = '16:9' | '4:3' | '1:1' | '3:4' | '9:16' | 'free';

export interface CropSettings {
  enabled: boolean;
  region: CropRegion | null;
  aspectRatio: AspectRatio;
  originalDimensions: { width: number; height: number } | null;
}

export const ASPECT_RATIOS: { value: AspectRatio; label: string; ratio: number | null }[] = [
  { value: 'free', label: 'Free', ratio: null },
  { value: '16:9', label: '16:9', ratio: 16 / 9 },
  { value: '4:3', label: '4:3', ratio: 4 / 3 },
  { value: '1:1', label: '1:1', ratio: 1 },
  { value: '3:4', label: '3:4', ratio: 3 / 4 },
  { value: '9:16', label: '9:16', ratio: 9 / 16 },
];

export function createDefaultCropSettings(): CropSettings {
  return {
    enabled: false,
    region: null,
    aspectRatio: 'free',
    originalDimensions: null,
  };
}

export function getAspectRatioValue(aspectRatio: AspectRatio): number | null {
  const found = ASPECT_RATIOS.find(ar => ar.value === aspectRatio);
  return found?.ratio ?? null;
}
