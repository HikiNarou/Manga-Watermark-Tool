# Design Document - AI Image Editing

## Overview

Fitur AI Image Editing mengintegrasikan Google Gemini 2.0 Flash API ke dalam Manga Watermark Tool untuk memberikan kemampuan editing gambar berbasis AI. Fitur ini mencakup:

1. **API Key Management** - Input dan validasi API key user
2. **Mask Drawing Tools** - Tools untuk menandai area spesifik pada gambar
3. **AI Image Enhancement** - Upscale, denoise, sharpen gambar
4. **AI Background Removal** - Hapus background otomatis
5. **AI Inpainting** - Hapus objek/teks dengan AI fill
6. **AI Text-to-Image Edit** - Edit dengan prompt natural language

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           App.tsx                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      AI Tools Tab                              │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │  │
│  │  │ APIKeyPanel │  │ MaskCanvas  │  │   AIEditorPanel     │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Services Layer                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │ GeminiService   │  │ MaskProcessor   │  │ APIKeyManager       │  │
│  │ - enhance()     │  │ - exportMask()  │  │ - store()           │  │
│  │ - removeBackground()│ - clearMask() │  │ - retrieve()        │  │
│  │ - inpaint()     │  │ - undo()        │  │ - validate()        │  │
│  │ - editWithPrompt()│ └─────────────────┘  │ - encrypt()         │  │
│  └─────────────────┘                        └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Google Gemini 2.0 Flash API                      │
│                   (Image Generation & Editing)                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. APIKeyPanel Component

```typescript
interface APIKeyPanelProps {
  onKeyValidated: (isValid: boolean) => void;
}

// Displays:
// - API key input field (password type)
// - Test Connection button
// - Connection status indicator
// - Clear API Key button
```

### 2. MaskCanvas Component

```typescript
interface MaskCanvasProps {
  imageDataUrl: string;
  width: number;
  height: number;
  onMaskChange: (maskDataUrl: string | null) => void;
}

interface MaskTool {
  type: 'brush' | 'rectangle' | 'lasso' | 'eraser';
  size: number; // 5-100px for brush/eraser
}

// Features:
// - Overlay canvas on top of image
// - Drawing tools (brush, rectangle, lasso, eraser)
// - Undo/Redo stack
// - Clear all
// - Export mask as binary image
```

### 3. AIEditorPanel Component

```typescript
interface AIEditorPanelProps {
  imageDataUrl: string;
  maskDataUrl: string | null;
  onImageEdited: (newImageDataUrl: string) => void;
}

type AIEditMode = 'enhance' | 'remove-bg' | 'inpaint' | 'prompt-edit';

interface AIEditRequest {
  mode: AIEditMode;
  imageDataUrl: string;
  maskDataUrl?: string;
  prompt?: string;
  options?: EnhanceOptions | RemoveBgOptions;
}

interface EnhanceOptions {
  type: 'upscale' | 'denoise' | 'sharpen' | 'auto';
  strength?: number; // 1-100
}

interface RemoveBgOptions {
  replaceWith?: 'transparent' | 'color' | 'image';
  backgroundColor?: string;
  backgroundImage?: string;
}
```

### 4. GeminiService

```typescript
class GeminiService {
  private apiKey: string;
  private systemInstructions: string;

  constructor(apiKey: string);

  // Enhancement
  async enhance(
    imageDataUrl: string,
    options: EnhanceOptions
  ): Promise<string>;

  // Background Removal
  async removeBackground(
    imageDataUrl: string,
    maskDataUrl?: string,
    options?: RemoveBgOptions
  ): Promise<string>;

  // Inpainting
  async inpaint(
    imageDataUrl: string,
    maskDataUrl: string,
    prompt?: string
  ): Promise<string>;

  // Text-to-Image Edit
  async editWithPrompt(
    imageDataUrl: string,
    prompt: string,
    maskDataUrl?: string
  ): Promise<string>;

  // Validate API Key
  async validateKey(): Promise<boolean>;
}
```

### 5. MaskProcessor

```typescript
class MaskProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private history: ImageData[];
  private historyIndex: number;

  // Drawing
  startDraw(x: number, y: number, tool: MaskTool): void;
  continueDraw(x: number, y: number): void;
  endDraw(): void;

  // Rectangle tool
  drawRectangle(x1: number, y1: number, x2: number, y2: number): void;

  // Lasso tool
  startLasso(x: number, y: number): void;
  continueLasso(x: number, y: number): void;
  closeLasso(): void;

  // History
  undo(): boolean;
  redo(): boolean;
  clear(): void;

  // Export
  exportMask(): string; // Returns data URL of binary mask
  hasMask(): boolean;
}
```

### 6. APIKeyManager

```typescript
class APIKeyManager {
  private static STORAGE_KEY = 'gemini_api_key';

  // Store with basic obfuscation (not true encryption for browser)
  static store(apiKey: string): void;

  // Retrieve and decode
  static retrieve(): string | null;

  // Clear stored key
  static clear(): void;

  // Validate format (starts with correct prefix)
  static validateFormat(apiKey: string): boolean;

  // Test connection with Gemini API
  static async testConnection(apiKey: string): Promise<boolean>;
}
```

## Data Models

### AIEditState

```typescript
interface AIEditState {
  isEnabled: boolean;
  apiKeyValid: boolean;
  currentMode: AIEditMode | null;
  isProcessing: boolean;
  error: string | null;
  result: AIEditResult | null;
}

interface AIEditResult {
  originalImageUrl: string;
  editedImageUrl: string;
  mode: AIEditMode;
  prompt?: string;
  timestamp: number;
}
```

### MaskState

```typescript
interface MaskState {
  isDrawing: boolean;
  currentTool: MaskTool;
  brushSize: number;
  canUndo: boolean;
  canRedo: boolean;
  hasMask: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following properties can be tested:

### Property 1: API Key Storage Round-Trip
*For any* valid API key string, storing it with APIKeyManager and then retrieving it SHALL return the original key value.
**Validates: Requirements 1.2**

### Property 2: Invalid API Key Rejection
*For any* string that does not match the Gemini API key format (not starting with "AIza"), validateFormat SHALL return false.
**Validates: Requirements 1.3**

### Property 3: Mask Undo Restores Previous State
*For any* sequence of draw operations on MaskProcessor, calling undo SHALL restore the mask to its state before the last operation.
**Validates: Requirements 2.6**

### Property 4: Mask Clear Produces Empty Mask
*For any* MaskProcessor with any drawn content, calling clear SHALL result in hasMask() returning false.
**Validates: Requirements 2.7**

### Property 5: Brush Size Clamping
*For any* brush size value, setting it on MaskProcessor SHALL clamp the value to the range [5, 100].
**Validates: Requirements 2.8**

### Property 6: Mask Export Dimensions Match Source
*For any* MaskProcessor initialized with width W and height H, exportMask SHALL return an image with dimensions W x H.
**Validates: Requirements 2.9**

### Property 7: AI Request Includes System Instructions
*For any* AI edit request built by GeminiService, the request payload SHALL include the manga-optimized system instructions.
**Validates: Requirements 8.1**

## Error Handling

### API Errors
```typescript
class GeminiAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean
  ) {
    super(message);
  }
}

// Error codes:
// - INVALID_API_KEY: API key is invalid or expired
// - RATE_LIMITED: Too many requests
// - CONTENT_FILTERED: Content was blocked by safety filters
// - GENERATION_FAILED: AI failed to generate valid output
// - NETWORK_ERROR: Network connectivity issue
```

### Error Recovery
1. **INVALID_API_KEY**: Prompt user to re-enter API key
2. **RATE_LIMITED**: Show countdown timer, auto-retry after delay
3. **CONTENT_FILTERED**: Show message, suggest different prompt
4. **GENERATION_FAILED**: Offer regenerate option
5. **NETWORK_ERROR**: Show retry button

## Testing Strategy

### Unit Testing
- APIKeyManager: store/retrieve/clear/validateFormat
- MaskProcessor: drawing operations, undo/redo, export
- Request builders: verify payload structure

### Property-Based Testing
Using fast-check library (already in project):

1. **API Key Round-Trip**: Generate random valid API keys, verify storage round-trip
2. **Invalid Key Detection**: Generate invalid strings, verify rejection
3. **Mask Operations**: Generate random draw sequences, verify undo behavior
4. **Brush Size Clamping**: Generate random numbers, verify clamping
5. **Mask Dimensions**: Generate random dimensions, verify export matches

### Integration Testing (Manual)
- Test actual Gemini API calls with real API key
- Verify image quality of AI outputs
- Test mask accuracy with various drawing patterns

## System Instructions for Gemini

```typescript
const MANGA_SYSTEM_INSTRUCTIONS = `
You are an AI assistant specialized in editing manga and comic images.

Guidelines:
1. PRESERVE the original art style - maintain line art quality, shading style, and artistic consistency
2. MAINTAIN aspect ratio - never stretch or distort the image
3. For ENHANCEMENT: improve clarity without adding artifacts or changing the art style
4. For BACKGROUND REMOVAL: cleanly separate foreground characters/elements from backgrounds
5. For INPAINTING: fill removed areas with content that matches the surrounding manga style (screentones, backgrounds, etc.)
6. For EDITS: follow the user's prompt while respecting the manga aesthetic
7. OUTPUT high quality images suitable for print or digital distribution
8. AVOID adding watermarks, signatures, or any unwanted elements
9. PRESERVE text bubbles and sound effects unless specifically asked to remove them
10. When uncertain, prioritize preserving the original image quality over making changes
`;
```

## UI/UX Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Tools Tab                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ API Key: [••••••••••••••••] [Test] [Clear]  ✓ Connected │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Mode: [Enhance] [Remove BG] [Inpaint] [AI Edit]               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Mask Tools:                                              │   │
│  │ [🖌️ Brush] [▢ Rectangle] [✏️ Lasso] [🧹 Eraser]          │   │
│  │ Size: [────●────] 25px                                   │   │
│  │ [↩️ Undo] [↪️ Redo] [🗑️ Clear]                            │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Enhancement Options: (when Enhance mode selected)        │   │
│  │ [Upscale 2x] [Denoise] [Sharpen] [Auto Enhance]         │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Prompt: (when AI Edit mode selected)                     │   │
│  │ [Enter your editing instructions...                    ] │   │
│  │ Example: "Remove the text in the marked area"           │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  [🚀 Process with AI]                                          │
├─────────────────────────────────────────────────────────────────┤
│  Result Preview:                                                │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │    Original      │  │     Result       │                    │
│  │                  │  │                  │                    │
│  └──────────────────┘  └──────────────────┘                    │
│  [✓ Apply] [🔄 Regenerate] [✗ Discard]                         │
└─────────────────────────────────────────────────────────────────┘
```
