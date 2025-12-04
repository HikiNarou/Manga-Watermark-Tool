/**
 * Compression Preset Types
 * Types for compression presets functionality
 */

import type { ExportFormat } from './index';

export type PresetName = 'web' | 'print' | 'archive' | 'custom';

export interface CompressionPreset {
  name: PresetName;
  label: string;
  description: string;
  format: ExportFormat;
  quality: number;
  maxWidth: number | null;  // null = original
  maxHeight: number | null; // null = original
  preserveAspectRatio: boolean;
}

export const COMPRESSION_PRESETS: Record<PresetName, CompressionPreset> = {
  web: {
    name: 'web',
    label: 'Web',
    description: 'Optimized for web, smaller file size',
    format: 'webp',
    quality: 80,
    maxWidth: 1920,
    maxHeight: null,
    preserveAspectRatio: true,
  },
  print: {
    name: 'print',
    label: 'Print',
    description: 'High quality for printing',
    format: 'png',
    quality: 100,
    maxWidth: null,
    maxHeight: null,
    preserveAspectRatio: true,
  },
  archive: {
    name: 'archive',
    label: 'Archive',
    description: 'Lossless for archival',
    format: 'png',
    quality: 100,
    maxWidth: null,
    maxHeight: null,
    preserveAspectRatio: true,
  },
  custom: {
    name: 'custom',
    label: 'Custom',
    description: 'Manual configuration',
    format: 'jpg',
    quality: 90,
    maxWidth: null,
    maxHeight: null,
    preserveAspectRatio: true,
  },
};

export function getPreset(name: PresetName): CompressionPreset {
  return COMPRESSION_PRESETS[name];
}

export function getAllPresets(): CompressionPreset[] {
  return Object.values(COMPRESSION_PRESETS);
}

/**
 * Estimate file size based on preset
 * This is a rough estimation
 */
export function estimateFileSize(
  originalSize: number,
  width: number,
  _height: number,
  preset: CompressionPreset
): number {
  // Calculate dimension ratio if resizing
  let dimensionRatio = 1;
  if (preset.maxWidth && width > preset.maxWidth) {
    dimensionRatio = preset.maxWidth / width;
  }
  
  // Base compression ratios by format
  const formatRatios: Record<ExportFormat, number> = {
    jpg: 0.1,   // JPEG typically 10% of raw
    png: 0.5,   // PNG typically 50% of raw
    webp: 0.08, // WebP typically 8% of raw
  };
  
  const formatRatio = formatRatios[preset.format];
  const qualityRatio = preset.quality / 100;
  
  // Estimate: original * dimension^2 * format * quality
  const estimated = originalSize * (dimensionRatio * dimensionRatio) * formatRatio * qualityRatio;
  
  return Math.round(estimated);
}
