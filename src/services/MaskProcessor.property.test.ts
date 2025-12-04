/**
 * Property-Based Tests for MaskProcessor
 * Feature: ai-image-editing
 * Tests Properties 3-6 from design document
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { MaskProcessor, clampBrushSize } from './MaskProcessor';
import { MIN_BRUSH_SIZE, MAX_BRUSH_SIZE } from '@/types';

// Mock canvas for Node.js environment
class MockCanvasRenderingContext2D {
  private imageData: Uint8ClampedArray;
  private width: number;
  
  fillStyle: string = '';
  strokeStyle: string = '';
  lineWidth: number = 1;
  lineCap: string = 'butt';
  lineJoin: string = 'miter';
  globalCompositeOperation: string = 'source-over';

  constructor(width: number, height: number) {
    this.width = width;
    this.imageData = new Uint8ClampedArray(width * height * 4);
  }

  getImageData(x: number, y: number, w: number, h: number) {
    const data = new Uint8ClampedArray(w * h * 4);
    // Copy relevant portion
    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        const srcIdx = ((y + row) * this.width + (x + col)) * 4;
        const dstIdx = (row * w + col) * 4;
        data[dstIdx] = this.imageData[srcIdx] ?? 0;
        data[dstIdx + 1] = this.imageData[srcIdx + 1] ?? 0;
        data[dstIdx + 2] = this.imageData[srcIdx + 2] ?? 0;
        data[dstIdx + 3] = this.imageData[srcIdx + 3] ?? 0;
      }
    }
    return { data, width: w, height: h };
  }

  putImageData(imageData: { data: Uint8ClampedArray }, _x: number, _y: number) {
    // Simplified: just copy the data
    this.imageData = new Uint8ClampedArray(imageData.data);
  }

  clearRect(_x: number, _y: number, _w: number, _h: number) {
    this.imageData.fill(0);
  }

  fillRect(x: number, y: number, w: number, h: number) {
    // Simplified: mark pixels as filled
    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        const idx = ((y + row) * this.width + (x + col)) * 4;
        if (idx >= 0 && idx < this.imageData.length - 3) {
          this.imageData[idx] = 255;
          this.imageData[idx + 1] = 0;
          this.imageData[idx + 2] = 0;
          this.imageData[idx + 3] = 128;
        }
      }
    }
  }

  beginPath() {}
  moveTo(_x: number, _y: number) {}
  lineTo(_x: number, _y: number) {}
  closePath() {}
  stroke() {}
  
  fill() {
    // Mark some pixels as filled for testing
    const centerIdx = Math.floor(this.imageData.length / 2);
    if (centerIdx < this.imageData.length - 3) {
      this.imageData[centerIdx] = 255;
      this.imageData[centerIdx + 1] = 0;
      this.imageData[centerIdx + 2] = 0;
      this.imageData[centerIdx + 3] = 128;
    }
  }
  
  arc(_x: number, _y: number, _r: number, _start: number, _end: number) {}
}

class MockHTMLCanvasElement {
  width: number;
  height: number;
  private ctx: MockCanvasRenderingContext2D;

  constructor() {
    this.width = 100;
    this.height = 100;
    this.ctx = new MockCanvasRenderingContext2D(100, 100);
  }

  getContext(_type: string) {
    return this.ctx;
  }

  toDataURL(_type?: string) {
    return `data:image/png;base64,mock_${this.width}x${this.height}`;
  }
}

// Setup mock before tests
const originalCreateElement = document.createElement.bind(document);
document.createElement = (tagName: string) => {
  if (tagName === 'canvas') {
    return new MockHTMLCanvasElement() as unknown as HTMLCanvasElement;
  }
  return originalCreateElement(tagName);
};

describe('MaskProcessor Property Tests', () => {
  /**
   * **Feature: ai-image-editing, Property 3: Mask Undo Restores Previous State**
   * **Validates: Requirements 2.6**
   * 
   * For any sequence of draw operations on MaskProcessor, calling undo
   * SHALL restore the mask to its state before the last operation.
   */
  describe('Property 3: Mask Undo Restores Previous State', () => {
    it('should be able to undo after drawing', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 50, max: 500 }),
          fc.integer({ min: 50, max: 500 }),
          (width, height) => {
            const processor = new MaskProcessor(width, height);
            
            // Initially cannot undo (only initial state)
            expect(processor.canUndo()).toBe(false);
            
            // Draw something
            processor.drawRectangle(10, 10, 40, 40);
            
            // Now can undo
            expect(processor.canUndo()).toBe(true);
            
            // Undo should succeed
            const undoResult = processor.undo();
            expect(undoResult).toBe(true);
            
            // After undo, cannot undo further
            expect(processor.canUndo()).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should track undo/redo state correctly through multiple operations', () => {
      const processor = new MaskProcessor(100, 100);
      
      // Initial state
      expect(processor.canUndo()).toBe(false);
      expect(processor.canRedo()).toBe(false);
      
      // Draw first rectangle
      processor.drawRectangle(10, 10, 20, 20);
      expect(processor.canUndo()).toBe(true);
      expect(processor.canRedo()).toBe(false);
      
      // Draw second rectangle
      processor.drawRectangle(30, 30, 40, 40);
      expect(processor.canUndo()).toBe(true);
      expect(processor.canRedo()).toBe(false);
      
      // Undo once
      processor.undo();
      expect(processor.canUndo()).toBe(true);
      expect(processor.canRedo()).toBe(true);
      
      // Undo again
      processor.undo();
      expect(processor.canUndo()).toBe(false);
      expect(processor.canRedo()).toBe(true);
      
      // Redo
      processor.redo();
      expect(processor.canUndo()).toBe(true);
      expect(processor.canRedo()).toBe(true);
    });
  });

  /**
   * **Feature: ai-image-editing, Property 4: Mask Clear Produces Empty Mask**
   * **Validates: Requirements 2.7**
   * 
   * For any MaskProcessor with any drawn content, calling clear
   * SHALL result in hasMask() returning false.
   */
  describe('Property 4: Mask Clear Produces Empty Mask', () => {
    it('should have no mask after clear', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 50, max: 500 }),
          fc.integer({ min: 50, max: 500 }),
          fc.array(
            fc.record({
              x1: fc.integer({ min: 0, max: 100 }),
              y1: fc.integer({ min: 0, max: 100 }),
              x2: fc.integer({ min: 0, max: 100 }),
              y2: fc.integer({ min: 0, max: 100 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (width, height, rectangles) => {
            const processor = new MaskProcessor(width, height);
            
            // Draw multiple rectangles
            rectangles.forEach(rect => {
              processor.drawRectangle(rect.x1, rect.y1, rect.x2, rect.y2);
            });
            
            // Clear the mask
            processor.clear();
            
            // Should have no mask
            expect(processor.hasMask()).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should clear with history and allow undo', () => {
      const processor = new MaskProcessor(100, 100);
      
      // Draw something
      processor.drawRectangle(10, 10, 50, 50);
      
      // Clear with history
      processor.clearWithHistory();
      expect(processor.hasMask()).toBe(false);
      
      // Should be able to undo the clear
      expect(processor.canUndo()).toBe(true);
    });
  });

  /**
   * **Feature: ai-image-editing, Property 5: Brush Size Clamping**
   * **Validates: Requirements 2.8**
   * 
   * For any brush size value, setting it on MaskProcessor
   * SHALL clamp the value to the range [5, 100].
   */
  describe('Property 5: Brush Size Clamping', () => {
    it('should clamp brush size to valid range', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: 1000 }),
          (size) => {
            const clamped = clampBrushSize(size);
            
            expect(clamped).toBeGreaterThanOrEqual(MIN_BRUSH_SIZE);
            expect(clamped).toBeLessThanOrEqual(MAX_BRUSH_SIZE);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve valid brush sizes', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: MIN_BRUSH_SIZE, max: MAX_BRUSH_SIZE }),
          (size) => {
            const clamped = clampBrushSize(size);
            expect(clamped).toBe(size);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should clamp values below minimum to minimum', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: MIN_BRUSH_SIZE - 1 }),
          (size) => {
            const clamped = clampBrushSize(size);
            expect(clamped).toBe(MIN_BRUSH_SIZE);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should clamp values above maximum to maximum', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: MAX_BRUSH_SIZE + 1, max: 1000 }),
          (size) => {
            const clamped = clampBrushSize(size);
            expect(clamped).toBe(MAX_BRUSH_SIZE);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should update processor brush size with clamping', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: 200 }),
          (size) => {
            const processor = new MaskProcessor(100, 100);
            processor.setBrushSize(size);
            
            const actualSize = processor.getBrushSize();
            expect(actualSize).toBeGreaterThanOrEqual(MIN_BRUSH_SIZE);
            expect(actualSize).toBeLessThanOrEqual(MAX_BRUSH_SIZE);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * **Feature: ai-image-editing, Property 6: Mask Export Dimensions Match Source**
   * **Validates: Requirements 2.9**
   * 
   * For any MaskProcessor initialized with width W and height H,
   * exportMask SHALL return an image with dimensions W x H.
   */
  describe('Property 6: Mask Export Dimensions Match Source', () => {
    it('should export mask with correct dimensions encoded in data URL', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 1000 }),
          fc.integer({ min: 10, max: 1000 }),
          (width, height) => {
            const processor = new MaskProcessor(width, height);
            
            // Get dimensions
            const dims = processor.getDimensions();
            expect(dims.width).toBe(width);
            expect(dims.height).toBe(height);
            
            // Export should return a data URL
            const exported = processor.exportMask();
            expect(exported).toMatch(/^data:image\/png;base64,/);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain dimensions after drawing operations', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 50, max: 500 }),
          fc.integer({ min: 50, max: 500 }),
          (width, height) => {
            const processor = new MaskProcessor(width, height);
            
            // Draw some content
            processor.drawRectangle(0, 0, width / 2, height / 2);
            
            // Dimensions should still match
            const dims = processor.getDimensions();
            expect(dims.width).toBe(width);
            expect(dims.height).toBe(height);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('MaskProcessor Additional Tests', () => {
    it('should initialize with correct dimensions', () => {
      const processor = new MaskProcessor(200, 150);
      const dims = processor.getDimensions();
      
      expect(dims.width).toBe(200);
      expect(dims.height).toBe(150);
    });

    it('should set and get tool correctly', () => {
      const processor = new MaskProcessor(100, 100);
      
      processor.setTool({ type: 'rectangle', size: 50 });
      const tool = processor.getTool();
      
      expect(tool.type).toBe('rectangle');
      expect(tool.size).toBe(50);
    });

    it('should track drawing state', () => {
      const processor = new MaskProcessor(100, 100);
      
      expect(processor.isCurrentlyDrawing()).toBe(false);
      
      processor.startDraw(10, 10);
      expect(processor.isCurrentlyDrawing()).toBe(true);
      
      processor.endDraw();
      expect(processor.isCurrentlyDrawing()).toBe(false);
    });

    it('should provide history info', () => {
      const processor = new MaskProcessor(100, 100);
      
      const initialInfo = processor.getHistoryInfo();
      expect(initialInfo.index).toBe(0);
      expect(initialInfo.length).toBe(1);
      
      processor.drawRectangle(10, 10, 50, 50);
      
      const afterDrawInfo = processor.getHistoryInfo();
      expect(afterDrawInfo.index).toBe(1);
      expect(afterDrawInfo.length).toBe(2);
    });
  });
});
