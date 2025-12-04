/**
 * AI Image Editing Types
 * Types and interfaces for Gemini AI integration
 * Requirements: 3.1, 4.1, 5.1, 6.1
 */

// ============================================
// AI Edit Modes
// ============================================

export type AIEditMode = 'enhance' | 'remove-bg' | 'inpaint' | 'prompt-edit';

// ============================================
// Enhancement Types
// ============================================

export type EnhanceType = 'upscale' | 'denoise' | 'sharpen' | 'auto';

export interface EnhanceOptions {
  type: EnhanceType;
  strength?: number; // 1-100, default 50
}

// ============================================
// Background Removal Types
// ============================================

export type BackgroundReplacement = 'transparent' | 'color' | 'image';

export interface RemoveBgOptions {
  replaceWith: BackgroundReplacement;
  backgroundColor?: string; // hex color when replaceWith is 'color'
  backgroundImageUrl?: string; // data URL when replaceWith is 'image'
}

// ============================================
// Mask Tool Types
// ============================================

export type MaskToolType = 'brush' | 'rectangle' | 'lasso' | 'eraser';

export interface MaskTool {
  type: MaskToolType;
  size: number; // 5-100px for brush/eraser
}

export interface MaskState {
  isDrawing: boolean;
  currentTool: MaskTool;
  canUndo: boolean;
  canRedo: boolean;
  hasMask: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawOperation {
  type: MaskToolType;
  points: Point[];
  size: number;
}

// ============================================
// AI Edit Request/Response Types
// ============================================

export interface AIEditRequest {
  mode: AIEditMode;
  imageDataUrl: string;
  maskDataUrl?: string;
  prompt?: string;
  enhanceOptions?: EnhanceOptions;
  removeBgOptions?: RemoveBgOptions;
}

export interface AIEditResult {
  success: boolean;
  originalImageUrl: string;
  editedImageUrl?: string;
  mode: AIEditMode;
  prompt?: string;
  error?: string;
  timestamp: number;
}

// ============================================
// AI Edit State
// ============================================

export interface AIEditState {
  isEnabled: boolean;
  apiKeyValid: boolean;
  currentMode: AIEditMode | null;
  isProcessing: boolean;
  processingMessage: string;
  error: string | null;
  result: AIEditResult | null;
}

// ============================================
// API Error Types
// ============================================

export type GeminiErrorCode = 
  | 'INVALID_API_KEY'
  | 'RATE_LIMITED'
  | 'CONTENT_FILTERED'
  | 'GENERATION_FAILED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface GeminiError {
  code: GeminiErrorCode;
  message: string;
  retryable: boolean;
}

// ============================================
// Default Values
// ============================================

export const DEFAULT_MASK_TOOL: MaskTool = {
  type: 'brush',
  size: 25,
};

export const DEFAULT_MASK_STATE: MaskState = {
  isDrawing: false,
  currentTool: DEFAULT_MASK_TOOL,
  canUndo: false,
  canRedo: false,
  hasMask: false,
};

export const DEFAULT_AI_EDIT_STATE: AIEditState = {
  isEnabled: false,
  apiKeyValid: false,
  currentMode: null,
  isProcessing: false,
  processingMessage: '',
  error: null,
  result: null,
};

export const DEFAULT_ENHANCE_OPTIONS: EnhanceOptions = {
  type: 'auto',
  strength: 50,
};

export const DEFAULT_REMOVE_BG_OPTIONS: RemoveBgOptions = {
  replaceWith: 'transparent',
};

// ============================================
// Constants
// ============================================

export const MIN_BRUSH_SIZE = 5;
export const MAX_BRUSH_SIZE = 100;
export const MASK_COLOR = 'rgba(255, 0, 0, 0.5)'; // Semi-transparent red

export const ENHANCE_TYPE_LABELS: Record<EnhanceType, string> = {
  upscale: 'Upscale 2x',
  denoise: 'Denoise',
  sharpen: 'Sharpen',
  auto: 'Auto Enhance',
};

export const AI_MODE_LABELS: Record<AIEditMode, string> = {
  enhance: 'Enhance',
  'remove-bg': 'Remove BG',
  inpaint: 'Inpaint',
  'prompt-edit': 'AI Edit',
};

export const MASK_TOOL_LABELS: Record<MaskToolType, string> = {
  brush: '🖌️ Brush',
  rectangle: '▢ Rectangle',
  lasso: '✏️ Lasso',
  eraser: '🧹 Eraser',
};
