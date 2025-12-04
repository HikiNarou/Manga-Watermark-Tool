/**
 * Property-Based Tests for GeminiService
 * Feature: ai-image-editing
 * Tests Property 7 from design document
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { buildRequestPayload, MANGA_SYSTEM_INSTRUCTIONS, GeminiService } from './GeminiService';

describe('GeminiService Property Tests', () => {
  /**
   * **Feature: ai-image-editing, Property 7: AI Request Includes System Instructions**
   * **Validates: Requirements 8.1**
   * 
   * For any AI edit request built by GeminiService, the request payload
   * SHALL include the manga-optimized system instructions embedded in the prompt.
   */
  describe('Property 7: AI Request Includes System Instructions', () => {
    it('should include system instructions in prompt text', () => {
      fc.assert(
        fc.property(
          // Generate random base64-like strings for image
          fc.base64String({ minLength: 10, maxLength: 100 }),
          // Generate random MIME types
          fc.constantFrom('image/png', 'image/jpeg', 'image/webp'),
          // Generate random prompts
          fc.string({ minLength: 1, maxLength: 200 }),
          (imageBase64, mimeType, prompt) => {
            const payload = buildRequestPayload(imageBase64, mimeType, prompt);
            
            // Check that contents exists
            expect(payload).toHaveProperty('contents');
            
            const contents = payload.contents as Array<{
              parts?: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
            }>;
            
            expect(Array.isArray(contents)).toBe(true);
            expect(contents.length).toBeGreaterThan(0);
            
            const parts = contents[0]?.parts;
            expect(parts).toBeDefined();
            
            // Find text part that contains system instructions
            const textPart = parts?.find(p => p.text !== undefined);
            expect(textPart).toBeDefined();
            expect(textPart?.text).toContain(MANGA_SYSTEM_INSTRUCTIONS);
            expect(textPart?.text).toContain(prompt);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include system instructions even with mask', () => {
      fc.assert(
        fc.property(
          fc.base64String({ minLength: 10, maxLength: 100 }),
          fc.constantFrom('image/png', 'image/jpeg'),
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.base64String({ minLength: 10, maxLength: 100 }),
          (imageBase64, mimeType, prompt, maskBase64) => {
            const payload = buildRequestPayload(imageBase64, mimeType, prompt, maskBase64);
            
            const contents = payload.contents as Array<{
              parts?: Array<{ text?: string }>;
            }>;
            
            const parts = contents[0]?.parts;
            const textPart = parts?.find(p => p.text?.includes(MANGA_SYSTEM_INSTRUCTIONS));
            
            // System instruction should still be present in text
            expect(textPart).toBeDefined();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should include image data in request payload', () => {
      fc.assert(
        fc.property(
          fc.base64String({ minLength: 10, maxLength: 100 }),
          fc.constantFrom('image/png', 'image/jpeg', 'image/webp'),
          fc.string({ minLength: 1, maxLength: 100 }),
          (imageBase64, mimeType, prompt) => {
            const payload = buildRequestPayload(imageBase64, mimeType, prompt);
            
            // Check contents structure
            expect(payload).toHaveProperty('contents');
            const contents = payload.contents as Array<{
              parts?: Array<{
                inlineData?: { mimeType: string; data: string };
                text?: string;
              }>;
            }>;
            
            expect(Array.isArray(contents)).toBe(true);
            expect(contents.length).toBeGreaterThan(0);
            
            // Check that image is included
            const parts = contents[0]?.parts;
            expect(parts).toBeDefined();
            expect(parts?.length).toBeGreaterThanOrEqual(2); // text + image
            
            // Find image part
            const imagePart = parts?.find(p => p.inlineData !== undefined);
            expect(imagePart).toBeDefined();
            expect(imagePart?.inlineData?.mimeType).toBe(mimeType);
            expect(imagePart?.inlineData?.data).toBe(imageBase64);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should include prompt text in request payload', () => {
      fc.assert(
        fc.property(
          fc.base64String({ minLength: 10, maxLength: 50 }),
          fc.constantFrom('image/png'),
          fc.string({ minLength: 1, maxLength: 100 }),
          (imageBase64, mimeType, prompt) => {
            const payload = buildRequestPayload(imageBase64, mimeType, prompt);
            
            const contents = payload.contents as Array<{
              parts?: Array<{ text?: string }>;
            }>;
            
            const parts = contents[0]?.parts;
            
            // Find text part that contains the user prompt
            const textPart = parts?.find(p => p.text !== undefined);
            expect(textPart).toBeDefined();
            expect(textPart?.text).toContain(prompt);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should include generation config for image output', () => {
      const payload = buildRequestPayload('test', 'image/png', 'test prompt');
      
      expect(payload).toHaveProperty('generationConfig');
      
      const config = payload.generationConfig as {
        temperature?: number;
        topK?: number;
        topP?: number;
        maxOutputTokens?: number;
        responseModalities?: string[];
      };
      
      // Check generation config has required fields
      expect(config.temperature).toBeDefined();
      expect(config.maxOutputTokens).toBeDefined();
      expect(config.responseModalities).toContain('image');
    });
  });

  describe('GeminiService Instance Tests', () => {
    it('should return system instructions', () => {
      const service = new GeminiService('test-api-key');
      const instructions = service.getSystemInstructions();
      
      expect(instructions).toBe(MANGA_SYSTEM_INSTRUCTIONS);
      expect(instructions).toContain('manga');
      expect(instructions).toContain('PRESERVE');
    });

    it('system instructions should contain key guidelines', () => {
      const instructions = MANGA_SYSTEM_INSTRUCTIONS;
      
      // Check for important guidelines
      expect(instructions).toContain('art style');
      expect(instructions).toContain('aspect ratio');
      expect(instructions).toContain('ENHANCEMENT');
      expect(instructions).toContain('BACKGROUND REMOVAL');
      expect(instructions).toContain('INPAINTING');
      expect(instructions).toContain('line art');
    });
  });
});
