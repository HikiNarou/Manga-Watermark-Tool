/**
 * Gemini Service
 * Handles all AI image editing operations using Google Gemini 3 Pro Image Preview (Nano Banana Pro) API
 * Requirements: 1.4, 3.2-3.5, 4.2-4.5, 5.2-5.6, 6.2-6.6, 8.1
 */

import {
  type AIEditMode,
  type EnhanceOptions,
  type RemoveBgOptions,
  type GeminiError,
  type GeminiErrorCode,
} from '@/types';

/**
 * System instructions optimized for manga/comic image editing
 * Requirements: 8.1
 */
export const MANGA_SYSTEM_INSTRUCTIONS = `You are an AI assistant specialized in editing manga and comic images.

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
10. When uncertain, prioritize preserving the original image quality over making changes`;

/**
 * Gemini API endpoint
 */
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Convert data URL to base64 string (without prefix)
 */
function dataUrlToBase64(dataUrl: string): string {
  const base64Match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
  return base64Match?.[1] ?? dataUrl;
}

/**
 * Get MIME type from data URL
 */
function getMimeType(dataUrl: string): string {
  const mimeMatch = dataUrl.match(/^data:(image\/\w+);base64,/);
  return mimeMatch?.[1] ?? 'image/png';
}

/**
 * Combine original image with mask overlay for better AI understanding
 * Creates a single image with red highlight on masked areas
 */
async function createMaskedPreview(
  imageDataUrl: string,
  maskDataUrl: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to create canvas context'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Load and overlay mask
      const maskImg = new Image();
      maskImg.onload = () => {
        // Create temporary canvas for mask processing
        const maskCanvas = document.createElement('canvas');
        const maskCtx = maskCanvas.getContext('2d');
        if (!maskCtx) {
          reject(new Error('Failed to create mask canvas context'));
          return;
        }
        
        maskCanvas.width = img.width;
        maskCanvas.height = img.height;
        maskCtx.drawImage(maskImg, 0, 0, img.width, img.height);
        
        // Get mask data and create red overlay
        const maskData = maskCtx.getImageData(0, 0, img.width, img.height);
        const overlayData = ctx.getImageData(0, 0, img.width, img.height);
        
        // Apply semi-transparent red overlay where mask is white
        for (let i = 0; i < maskData.data.length; i += 4) {
          // Check if pixel is white (masked area)
          if (maskData.data[i]! > 200 && maskData.data[i + 1]! > 200 && maskData.data[i + 2]! > 200) {
            // Blend with red color (semi-transparent)
            overlayData.data[i] = Math.min(255, overlayData.data[i]! * 0.5 + 255 * 0.5);     // R
            overlayData.data[i + 1] = Math.floor(overlayData.data[i + 1]! * 0.5);            // G
            overlayData.data[i + 2] = Math.floor(overlayData.data[i + 2]! * 0.5);            // B
          }
        }
        
        ctx.putImageData(overlayData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      maskImg.onerror = () => reject(new Error('Failed to load mask image'));
      maskImg.src = maskDataUrl;
    };
    img.onerror = () => reject(new Error('Failed to load original image'));
    img.src = imageDataUrl;
  });
}

/**
 * Create Gemini error from response
 */
function createGeminiError(code: GeminiErrorCode, message: string, retryable: boolean = false): GeminiError {
  return { code, message, retryable };
}

/**
 * Parse error from API response
 */
function parseApiError(status: number, errorData: Record<string, unknown>): GeminiError {
  const message = (errorData?.error as Record<string, unknown>)?.message as string || `HTTP ${status}`;
  
  if (status === 400 || status === 401 || status === 403) {
    return createGeminiError('INVALID_API_KEY', message, false);
  }
  if (status === 429) {
    return createGeminiError('RATE_LIMITED', 'Rate limited - please try again later', true);
  }
  if (status === 500 || status === 503) {
    return createGeminiError('GENERATION_FAILED', message, true);
  }
  
  return createGeminiError('UNKNOWN_ERROR', message, false);
}

/**
 * Build request payload for Gemini 3 Pro Image Preview API (Nano Banana Pro)
 * State-of-the-art image generation and editing model
 */
export function buildRequestPayload(
  imageBase64: string,
  imageMimeType: string,
  prompt: string,
  maskBase64?: string
): Record<string, unknown> {
  const parts: Record<string, unknown>[] = [];
  
  // Build the full prompt with clear instructions
  let fullPrompt = prompt;
  
  if (maskBase64) {
    // When mask is provided, be very explicit about what to do
    fullPrompt = `I am providing you with two images:
1. The first image is the original manga/comic image to edit.
2. The second image is a binary mask where WHITE areas indicate the regions that need to be edited/modified.

Your task: ${prompt}

IMPORTANT: Only modify the WHITE masked areas. Keep all BLACK/unmasked areas exactly as they are in the original image.
Output the complete edited image.`;
  }
  
  // Add system context
  parts.push({ text: `${MANGA_SYSTEM_INSTRUCTIONS}\n\n${fullPrompt}` });
  
  // Add original image
  parts.push({
    inlineData: {
      mimeType: imageMimeType,
      data: imageBase64,
    },
  });
  
  // Add mask if provided
  if (maskBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: maskBase64,
      },
    });
  }
  
  return {
    contents: [{ parts }],
    generationConfig: {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseModalities: ['image', 'text'],
    },
  };
}

/**
 * GeminiService - Handles AI image editing operations
 */
export class GeminiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get the system instructions
   */
  getSystemInstructions(): string {
    return MANGA_SYSTEM_INSTRUCTIONS;
  }

  /**
   * Validate API key by making a test request
   * Requirements: 1.4
   */
  async validateKey(): Promise<boolean> {
    try {
      const response = await fetch(
        `${GEMINI_API_BASE}/models`,
        {
          method: 'GET',
          headers: {
            'x-goog-api-key': this.apiKey,
          },
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Make API request to Gemini 3 Pro Image Preview (Nano Banana Pro)
   * State-of-the-art image generation and editing model
   */
  private async makeRequest(payload: Record<string, unknown>): Promise<string> {
    // Use Gemini 3 Pro Image Preview (Nano Banana Pro) for image generation/editing
    const response = await fetch(
      `${GEMINI_API_BASE}/models/gemini-3-pro-image-preview:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = parseApiError(response.status, errorData as Record<string, unknown>);
      throw new Error(`${error.code}: ${error.message}`);
    }

    const data = await response.json();
    
    // Extract response from candidates
    const candidates = data.candidates as Array<{
      content?: {
        parts?: Array<{
          inlineData?: { data: string; mimeType: string };
          text?: string;
        }>;
      };
    }>;
    
    if (!candidates || candidates.length === 0) {
      throw new Error('GENERATION_FAILED: No response generated. Please try again.');
    }

    const parts = candidates[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      throw new Error('GENERATION_FAILED: No content in response. Please try again.');
    }

    // Check for image in response first
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }

    // If no image, check for text response
    for (const part of parts) {
      if (part.text) {
        // Model returned text - might be an explanation or error
        throw new Error(`AI_RESPONSE: ${part.text.substring(0, 300)}`);
      }
    }

    throw new Error('GENERATION_FAILED: No image in response. The model may not support this operation.');
  }

  /**
   * Enhance image quality
   * Requirements: 3.2, 3.3, 3.4, 3.5
   */
  async enhance(imageDataUrl: string, options: EnhanceOptions): Promise<string> {
    const imageBase64 = dataUrlToBase64(imageDataUrl);
    const mimeType = getMimeType(imageDataUrl);
    
    let prompt: string;
    switch (options.type) {
      case 'upscale':
        prompt = 'Upscale this manga/comic image to 2x resolution. Enhance details while preserving the original art style, line art quality, and screentone patterns. Do not add any new elements or change the composition.';
        break;
      case 'denoise':
        prompt = 'Remove noise and artifacts from this manga/comic image while preserving the original art style, line art, and screentone patterns. Clean up any compression artifacts or scan noise.';
        break;
      case 'sharpen':
        prompt = 'Sharpen this manga/comic image to improve clarity. Enhance line art definition while preserving screentones and avoiding over-sharpening artifacts.';
        break;
      case 'auto':
      default:
        prompt = 'Automatically enhance this manga/comic image. Improve overall quality, reduce noise, sharpen details, and optimize contrast while preserving the original art style and composition.';
        break;
    }
    
    if (options.strength && options.strength !== 50) {
      const intensity = options.strength > 50 ? 'strong' : 'subtle';
      prompt += ` Apply ${intensity} enhancement.`;
    }
    
    const payload = buildRequestPayload(imageBase64, mimeType, prompt);
    return this.makeRequest(payload);
  }

  /**
   * Remove background from image
   * Requirements: 4.2, 4.3, 4.4, 4.5
   */
  async removeBackground(
    imageDataUrl: string,
    maskDataUrl?: string,
    options?: RemoveBgOptions
  ): Promise<string> {
    const imageBase64 = dataUrlToBase64(imageDataUrl);
    const mimeType = getMimeType(imageDataUrl);
    const maskBase64 = maskDataUrl ? dataUrlToBase64(maskDataUrl) : undefined;
    
    let prompt = 'Remove the background from this manga/comic image. ';
    
    if (maskBase64) {
      prompt += 'The white areas in the provided mask indicate the foreground elements to preserve. ';
    } else {
      prompt += 'Automatically detect and preserve the main characters/subjects. ';
    }
    
    if (options?.replaceWith === 'transparent') {
      prompt += 'Replace the background with transparency (alpha channel).';
    } else if (options?.replaceWith === 'color' && options.backgroundColor) {
      prompt += `Replace the background with solid color ${options.backgroundColor}.`;
    } else {
      prompt += 'Replace the background with transparency.';
    }
    
    const payload = buildRequestPayload(imageBase64, mimeType, prompt, maskBase64);
    return this.makeRequest(payload);
  }

  /**
   * Inpaint (remove and fill) areas of the image
   * Requirements: 5.2, 5.3, 5.4, 5.5, 5.6
   */
  async inpaint(
    imageDataUrl: string,
    maskDataUrl: string,
    prompt?: string
  ): Promise<string> {
    // Create a preview image with red overlay showing masked areas
    const maskedPreview = await createMaskedPreview(imageDataUrl, maskDataUrl);
    const previewBase64 = dataUrlToBase64(maskedPreview);
    
    // Also send original image
    const imageBase64 = dataUrlToBase64(imageDataUrl);
    const mimeType = getMimeType(imageDataUrl);
    
    let fullPrompt = `INPAINTING TASK:

I am showing you an image with RED HIGHLIGHTED AREAS. These red areas mark the content that needs to be REMOVED and FILLED.

Your task:
1. Look at the RED highlighted areas in the first image
2. REMOVE/ERASE all content (text, SFX, objects) within those red areas
3. FILL those areas with appropriate background content that matches the surrounding area
4. The second image is the clean original - use it as reference for the art style

The result should look natural, as if the removed content was never there. Match the surrounding manga style, screentones, and shading.`;
    
    if (prompt) {
      fullPrompt += `\n\nAdditional instruction from user: ${prompt}`;
    }
    
    // Build payload with masked preview first, then original
    const parts: Record<string, unknown>[] = [];
    parts.push({ text: `${MANGA_SYSTEM_INSTRUCTIONS}\n\n${fullPrompt}` });
    
    // First image: masked preview with red highlights
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: previewBase64,
      },
    });
    
    // Second image: original clean image
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: imageBase64,
      },
    });
    
    const payload = {
      contents: [{ parts }],
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseModalities: ['image', 'text'],
      },
    };
    
    return this.makeRequest(payload);
  }

  /**
   * Edit image with natural language prompt
   * Requirements: 6.2, 6.3, 6.4, 6.5, 6.6
   */
  async editWithPrompt(
    imageDataUrl: string,
    prompt: string,
    maskDataUrl?: string
  ): Promise<string> {
    const imageBase64 = dataUrlToBase64(imageDataUrl);
    const mimeType = getMimeType(imageDataUrl);
    
    let fullPrompt: string;
    let parts: Record<string, unknown>[] = [];
    
    if (maskDataUrl) {
      // Create a preview image with red overlay showing masked areas
      const maskedPreview = await createMaskedPreview(imageDataUrl, maskDataUrl);
      const previewBase64 = dataUrlToBase64(maskedPreview);
      
      fullPrompt = `IMAGE EDITING TASK:

I am showing you an image with RED HIGHLIGHTED AREAS. These red areas mark WHERE to apply the edit.

User's edit request: "${prompt}"

Instructions:
1. Look at the RED highlighted areas in the first image
2. Apply the user's edit request ONLY to those red areas
3. Keep all non-red areas EXACTLY the same as the original
4. The second image is the clean original - use it as reference

Output the complete edited image.`;
      
      parts.push({ text: `${MANGA_SYSTEM_INSTRUCTIONS}\n\n${fullPrompt}` });
      
      // First image: masked preview with red highlights
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: previewBase64,
        },
      });
      
      // Second image: original clean image
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: imageBase64,
        },
      });
    } else {
      fullPrompt = `IMAGE EDITING TASK:

User's edit request: "${prompt}"

Apply this edit to the entire image while maintaining the manga/comic art style.
Output the complete edited image.`;
      
      parts.push({ text: `${MANGA_SYSTEM_INSTRUCTIONS}\n\n${fullPrompt}` });
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: imageBase64,
        },
      });
    }
    
    const payload = {
      contents: [{ parts }],
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseModalities: ['image', 'text'],
      },
    };
    
    return this.makeRequest(payload);
  }

  /**
   * Generic edit method that routes to specific methods based on mode
   */
  async edit(
    mode: AIEditMode,
    imageDataUrl: string,
    options: {
      maskDataUrl?: string;
      prompt?: string;
      enhanceOptions?: EnhanceOptions;
      removeBgOptions?: RemoveBgOptions;
    } = {}
  ): Promise<string> {
    switch (mode) {
      case 'enhance':
        return this.enhance(
          imageDataUrl,
          options.enhanceOptions || { type: 'auto' }
        );
      
      case 'remove-bg':
        return this.removeBackground(
          imageDataUrl,
          options.maskDataUrl,
          options.removeBgOptions
        );
      
      case 'inpaint':
        if (!options.maskDataUrl) {
          throw new Error('Mask is required for inpainting');
        }
        return this.inpaint(
          imageDataUrl,
          options.maskDataUrl,
          options.prompt
        );
      
      case 'prompt-edit':
        if (!options.prompt) {
          throw new Error('Prompt is required for AI edit');
        }
        return this.editWithPrompt(
          imageDataUrl,
          options.prompt,
          options.maskDataUrl
        );
      
      default:
        throw new Error(`Unknown edit mode: ${mode}`);
    }
  }
}
