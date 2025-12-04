/**
 * Manga Watermark Tool - Type Definitions
 * Based on design document specifications
 */

// Re-export new feature types
export * from './crop';
export * from './compression';
export * from './rename';

// ============================================
// Watermark Types
// ============================================

export interface TextWatermarkConfig {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  opacity: number;
  outlineEnabled: boolean;
  outlineColor: string;
  outlineWidth: number;
}

export interface ImageWatermarkConfig {
  type: 'image';
  imageData: string; // base64
  scale: number;
  opacity: number;
  tileEnabled: boolean;
  tileSpacingX: number;
  tileSpacingY: number;
}

export type WatermarkConfig = TextWatermarkConfig | ImageWatermarkConfig;

// ============================================
// Position Types
// ============================================

export type PresetPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface WatermarkPosition {
  presetPosition: PresetPosition | 'custom';
  offsetX: number;
  offsetY: number;
  rotation: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
}


// ============================================
// Complete Watermark Settings
// ============================================

export interface WatermarkSettings {
  config: WatermarkConfig;
  position: WatermarkPosition;
  enabled: boolean;
}

// ============================================
// Preset Types
// ============================================

export interface Preset {
  id: string;
  name: string;
  settings: WatermarkSettings;
  createdAt: number;
  updatedAt: number;
}

// ============================================
// Image Types
// ============================================

export interface UploadedImage {
  id: string;
  file: File;
  name: string;
  width: number;
  height: number;
  size: number;
  dataUrl: string;
  processed: boolean;
}

// ============================================
// Export Types
// ============================================

export type ExportFormat = 'jpg' | 'png' | 'webp';

export interface ExportSettings {
  format: ExportFormat;
  quality: number; // 0-100
  filenamePrefix: string;
  filenameSuffix: string;
  preserveOriginalName: boolean;
}

// ============================================
// Processing Types
// ============================================

export interface ProcessingResult {
  imageId: string;
  success: boolean;
  error?: string;
  outputBlob?: Blob;
  outputFilename?: string;
}

export interface BatchProcessingProgress {
  total: number;
  completed: number;
  failed: number;
  currentImage: string;
  results: ProcessingResult[];
}

// ============================================
// Error Types
// ============================================

export interface ErrorResponse {
  code: string;
  message: string;
  recoverable: boolean;
  suggestedAction?: string;
}

export const ErrorCodes = {
  INVALID_FILE_FORMAT: 'E001',
  FILE_TOO_LARGE: 'E002',
  CORRUPTED_IMAGE: 'E003',
  EMPTY_WATERMARK_TEXT: 'E004',
  INVALID_CONFIG_VALUE: 'E005',
  CANVAS_RENDER_FAILED: 'E006',
  MEMORY_OVERFLOW: 'E007',
  EXPORT_FAILED: 'E008',
  STORAGE_FULL: 'E009',
  INVALID_PRESET_JSON: 'E010',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];


// ============================================
// App State Types
// ============================================

export interface AppState {
  // Images
  images: UploadedImage[];
  selectedImageId: string | null;

  // Watermark
  watermarkSettings: WatermarkSettings;

  // Presets
  presets: Preset[];
  selectedPresetId: string | null;

  // Export
  exportSettings: ExportSettings;

  // UI State
  isProcessing: boolean;
  processingProgress: BatchProcessingProgress | null;
  previewZoom: number;
  previewPan: { x: number; y: number };
  watermarkVisible: boolean;
}

// ============================================
// Storage Types
// ============================================

export interface StoredData {
  presets: Preset[];
  lastExportSettings: ExportSettings;
  lastWatermarkSettings: WatermarkSettings;
}

// ============================================
// Constants
// ============================================

export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const;
export type SupportedImageFormat = typeof SUPPORTED_IMAGE_FORMATS[number];

export const PRESET_POSITIONS: PresetPosition[] = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

export const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Impact',
  'Comic Sans MS',
] as const;

export type FontFamily = typeof FONT_FAMILIES[number];


// ============================================
// Type Guards for Runtime Validation
// ============================================

/**
 * Check if a value is a valid PresetPosition
 */
export function isPresetPosition(value: unknown): value is PresetPosition {
  return typeof value === 'string' && PRESET_POSITIONS.includes(value as PresetPosition);
}

/**
 * Check if a value is a valid ExportFormat
 */
export function isExportFormat(value: unknown): value is ExportFormat {
  return value === 'jpg' || value === 'png' || value === 'webp';
}

/**
 * Check if a value is a valid SupportedImageFormat
 */
export function isSupportedImageFormat(value: unknown): value is SupportedImageFormat {
  return typeof value === 'string' && 
    SUPPORTED_IMAGE_FORMATS.includes(value.toLowerCase() as SupportedImageFormat);
}

/**
 * Check if a value is a valid TextWatermarkConfig
 */
export function isTextWatermarkConfig(value: unknown): value is TextWatermarkConfig {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  
  return (
    obj['type'] === 'text' &&
    typeof obj['text'] === 'string' &&
    typeof obj['fontFamily'] === 'string' &&
    typeof obj['fontSize'] === 'number' &&
    (obj['fontWeight'] === 'normal' || obj['fontWeight'] === 'bold') &&
    typeof obj['color'] === 'string' &&
    typeof obj['opacity'] === 'number' &&
    typeof obj['outlineEnabled'] === 'boolean' &&
    typeof obj['outlineColor'] === 'string' &&
    typeof obj['outlineWidth'] === 'number'
  );
}

/**
 * Check if a value is a valid ImageWatermarkConfig
 */
export function isImageWatermarkConfig(value: unknown): value is ImageWatermarkConfig {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  
  return (
    obj['type'] === 'image' &&
    typeof obj['imageData'] === 'string' &&
    typeof obj['scale'] === 'number' &&
    typeof obj['opacity'] === 'number' &&
    typeof obj['tileEnabled'] === 'boolean' &&
    typeof obj['tileSpacingX'] === 'number' &&
    typeof obj['tileSpacingY'] === 'number'
  );
}

/**
 * Check if a value is a valid WatermarkConfig
 */
export function isWatermarkConfig(value: unknown): value is WatermarkConfig {
  return isTextWatermarkConfig(value) || isImageWatermarkConfig(value);
}

/**
 * Check if a value is a valid WatermarkPosition
 */
export function isWatermarkPosition(value: unknown): value is WatermarkPosition {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  
  const presetPos = obj['presetPosition'];
  const isValidPresetPos = presetPos === 'custom' || isPresetPosition(presetPos);
  
  return (
    isValidPresetPos &&
    typeof obj['offsetX'] === 'number' &&
    typeof obj['offsetY'] === 'number' &&
    typeof obj['rotation'] === 'number' &&
    typeof obj['marginTop'] === 'number' &&
    typeof obj['marginRight'] === 'number' &&
    typeof obj['marginBottom'] === 'number' &&
    typeof obj['marginLeft'] === 'number'
  );
}

/**
 * Check if a value is a valid WatermarkSettings
 */
export function isWatermarkSettings(value: unknown): value is WatermarkSettings {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  
  return (
    isWatermarkConfig(obj['config']) &&
    isWatermarkPosition(obj['position']) &&
    typeof obj['enabled'] === 'boolean'
  );
}

/**
 * Check if a value is a valid Preset
 */
export function isPreset(value: unknown): value is Preset {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj['id'] === 'string' &&
    typeof obj['name'] === 'string' &&
    isWatermarkSettings(obj['settings']) &&
    typeof obj['createdAt'] === 'number' &&
    typeof obj['updatedAt'] === 'number'
  );
}

/**
 * Check if a value is a valid ExportSettings
 */
export function isExportSettings(value: unknown): value is ExportSettings {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  
  return (
    isExportFormat(obj['format']) &&
    typeof obj['quality'] === 'number' &&
    obj['quality'] >= 0 &&
    obj['quality'] <= 100 &&
    typeof obj['filenamePrefix'] === 'string' &&
    typeof obj['filenameSuffix'] === 'string' &&
    typeof obj['preserveOriginalName'] === 'boolean'
  );
}

/**
 * Validate opacity value (0-100)
 */
export function isValidOpacity(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && value <= 100;
}

/**
 * Validate rotation value (0-360)
 */
export function isValidRotation(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && value <= 360;
}

/**
 * Validate scale value (positive number)
 */
export function isValidScale(value: unknown): value is number {
  return typeof value === 'number' && value > 0;
}

/**
 * Validate hex color string
 */
export function isValidHexColor(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

/**
 * Validate font size (positive integer)
 */
export function isValidFontSize(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}


// ============================================
// Default Values Factory Functions
// ============================================

/**
 * Create default text watermark config
 */
export function createDefaultTextWatermarkConfig(): TextWatermarkConfig {
  return {
    type: 'text',
    text: 'Watermark',
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 'normal',
    color: '#000000',
    opacity: 50,
    outlineEnabled: false,
    outlineColor: '#ffffff',
    outlineWidth: 2,
  };
}

/**
 * Create default image watermark config
 */
export function createDefaultImageWatermarkConfig(): ImageWatermarkConfig {
  return {
    type: 'image',
    imageData: '',
    scale: 1,
    opacity: 50,
    tileEnabled: false,
    tileSpacingX: 50,
    tileSpacingY: 50,
  };
}

/**
 * Create default watermark position
 */
export function createDefaultWatermarkPosition(): WatermarkPosition {
  return {
    presetPosition: 'bottom-right',
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    marginTop: 10,
    marginRight: 10,
    marginBottom: 10,
    marginLeft: 10,
  };
}

/**
 * Create default watermark settings
 */
export function createDefaultWatermarkSettings(): WatermarkSettings {
  return {
    config: createDefaultTextWatermarkConfig(),
    position: createDefaultWatermarkPosition(),
    enabled: true,
  };
}

/**
 * Create default export settings
 */
export function createDefaultExportSettings(): ExportSettings {
  return {
    format: 'png',
    quality: 90,
    filenamePrefix: '',
    filenameSuffix: '_watermarked',
    preserveOriginalName: true,
  };
}

/**
 * Create default app state
 */
export function createDefaultAppState(): AppState {
  return {
    images: [],
    selectedImageId: null,
    watermarkSettings: createDefaultWatermarkSettings(),
    presets: [],
    selectedPresetId: null,
    exportSettings: createDefaultExportSettings(),
    isProcessing: false,
    processingProgress: null,
    previewZoom: 1,
    previewPan: { x: 0, y: 0 },
    watermarkVisible: true,
  };
}
