/**
 * Gemini Service
 * Handles all AI image editing operations using Google Gemini 2.0 Flash API
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
 * Build request payload for Gemini API
 */
export function buildRequestPayload(
  imageBase64: string,
  imageMimeType: string,
  prompt: string,
  maskBase64?: string
): Record<string, unknown> {
  const contents: Record<string, unknown>[] = [];
  
  // Add image part
  const imagePart = {
    inlineData: {
      mimeType: imageMimeType,
      data: imageBase64,
    },
  };
  
  // Add mask if provided
  const parts: Record<string, unknown>[] = [imagePart];
  
  if (maskBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: maskBase64,
      },
    });
  }
  
  // Add text prompt
  parts.push({ text: prompt });
  
  contents.push({ parts });
  
  return {
    contents,
    systemInstruction: {
      parts: [{ text: MANGA_SYSTEM_INSTRUCTIONS }],
    },
    generationConfig: {
      responseModalities: ['image', 'text'],
      responseMimeType: 'image/png',
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
        `${GEMINI_API_BASE}/models?key=${this.apiKey}`,
        { method: 'GET' }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Make API request to Gemini
   */
  private async makeRequest(payload: Record<string, unknown>): Promise<string> {
    const response = await fetch(
      `${GEMINI_API_BASE}/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    
    // Extract image from response
    const candidates = data.candidates as Array<{
      content?: {
        parts?: Array<{
          inlineData?: { data: string; mimeType: string };
          text?: string;
        }>;
      };
    }>;
    
    if (!candidates || candidates.length === 0) {
      throw new Error('GENERATION_FAILED: No response generated');
    }

    const parts = candidates[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      throw new Error('GENERATION_FAILED: No content in response');
    }

    // Find image part
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error('GENERATION_FAILED: No image in response');
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
    const imageBase64 = dataUrlToBase64(imageDataUrl);
    const mimeType = getMimeType(imageDataUrl);
    const maskBase64 = dataUrlToBase64(maskDataUrl);
    
    let fullPrompt = 'Remove the content in the masked (white) areas and fill with appropriate manga-style content that matches the surrounding context. ';
    
    if (prompt) {
      fullPrompt += `Additional instructions: ${prompt}. `;
    }
    
    fullPrompt += 'Ensure seamless integration with the surrounding artwork, matching line art style, screentone patterns, and shading.';
    
    const payload = buildRequestPayload(imageBase64, mimeType, fullPrompt, maskBase64);
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
    const maskBase64 = maskDataUrl ? dataUrlToBase64(maskDataUrl) : undefined;
    
    let fullPrompt = prompt;
    
    if (maskBase64) {
      fullPrompt = `Apply the following edit only to the masked (white) areas: ${prompt}. Leave unmasked areas unchanged.`;
    }
    
    fullPrompt += ' Maintain the manga/comic art style and ensure the edit integrates seamlessly with the rest of the image.';
    
    const payload = buildRequestPayload(imageBase64, mimeType, fullPrompt, maskBase64);
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
