/**
 * Property-Based Tests for WatermarkRenderer Service
 * 
 * Tests Properties 3, 4, 5, 6, and 8 from the design document
 */

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  normalizeOpacity,
  degreesToRadians,
  calculateScaledDimensions,
  calculateTileCount,
  renderTextWatermark,
} from './WatermarkRenderer';
import {
  arbTextWatermarkConfig,
  arbOpacity,
  arbScale,
  arbRotation,
  arbCanvasDimensions,
  arbWatermarkDimensions,
} from '@/test/helpers';

// Mock canvas context for testing
function createMockContext(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ 
      width: 100,
      actualBoundingBoxAscent: 12,
      actualBoundingBoxDescent: 4,
    })),
    font: '',
    fillStyle: '',
    strokeStyle: '',
    globalAlpha: 1,
    textBaseline: 'alphabetic',
    lineWidth: 1,
    lineJoin: 'miter',
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('Property 3: Text Watermark Configuration Consistency', () => {
  /**
   * **Feature: manga-watermark-tool, Property 3: Text Watermark Configuration Consistency**
   * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
   * 
   * For any text watermark configuration with valid text, font family, font size, 
   * and color, the rendered watermark SHALL reflect all specified properties accurately.
   */
  it('should apply font configuration correctly', () => {
    fc.assert(
      fc.property(arbTextWatermarkConfig, (config) => {
        const ctx = createMockContext();
        
        renderTextWatermark(ctx, config, { x: 0, y: 0 }, 0);
        
        // Font should be set with correct family, size, and weight
        const expectedFont = `${config.fontWeight} ${config.fontSize}px ${config.fontFamily}`;
        expect(ctx.font).toBe(expectedFont);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 3: Text Watermark Configuration Consistency**
   * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
   * 
   * For any text watermark, the fill color SHALL match the configured color.
   */
  it('should apply text color correctly', () => {
    fc.assert(
      fc.property(arbTextWatermarkConfig, (config) => {
        const ctx = createMockContext();
        
        renderTextWatermark(ctx, config, { x: 0, y: 0 }, 0);
        
        expect(ctx.fillStyle).toBe(config.color);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 3: Text Watermark Configuration Consistency**
   * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
   * 
   * When outline is enabled, stroke style and width SHALL match configuration.
   */
  it('should apply outline configuration when enabled', () => {
    fc.assert(
      fc.property(
        arbTextWatermarkConfig.filter(c => c.outlineEnabled && c.outlineWidth > 0),
        (config) => {
          const ctx = createMockContext();
          
          renderTextWatermark(ctx, config, { x: 0, y: 0 }, 0);
          
          expect(ctx.strokeStyle).toBe(config.outlineColor);
          expect(ctx.lineWidth).toBe(config.outlineWidth);
          expect(ctx.strokeText).toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 3: Text Watermark Configuration Consistency**
   * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
   * 
   * fillText SHALL be called with the exact text from configuration.
   */
  it('should render the exact text from configuration', () => {
    fc.assert(
      fc.property(arbTextWatermarkConfig, (config) => {
        const ctx = createMockContext();
        const position = { x: 50, y: 100 };
        
        renderTextWatermark(ctx, config, position, 0);
        
        expect(ctx.fillText).toHaveBeenCalledWith(config.text, position.x, position.y);
      }),
      { numRuns: 100 }
    );
  });
});


describe('Property 4: Opacity Application', () => {
  /**
   * **Feature: manga-watermark-tool, Property 4: Opacity Application**
   * **Validates: Requirements 2.6, 3.4**
   * 
   * For any watermark with opacity value between 0 and 100, the rendered watermark 
   * SHALL have transparency proportional to the specified opacity value.
   */
  it('should normalize opacity from 0-100 to 0-1 scale', () => {
    fc.assert(
      fc.property(arbOpacity, (opacity) => {
        const normalized = normalizeOpacity(opacity);
        
        // Normalized value should be in 0-1 range
        expect(normalized).toBeGreaterThanOrEqual(0);
        expect(normalized).toBeLessThanOrEqual(1);
        
        // Should be proportional: opacity/100
        expect(normalized).toBeCloseTo(opacity / 100, 10);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 4: Opacity Application**
   * **Validates: Requirements 2.6, 3.4**
   * 
   * Opacity values outside 0-100 SHALL be clamped to valid range.
   */
  it('should clamp opacity values outside valid range', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 1000 }),
        (opacity) => {
          const normalized = normalizeOpacity(opacity);
          
          expect(normalized).toBeGreaterThanOrEqual(0);
          expect(normalized).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 4: Opacity Application**
   * **Validates: Requirements 2.6, 3.4**
   * 
   * globalAlpha SHALL be set to normalized opacity when rendering text watermark.
   */
  it('should apply opacity to canvas context when rendering', () => {
    fc.assert(
      fc.property(arbTextWatermarkConfig, (config) => {
        const ctx = createMockContext();
        
        renderTextWatermark(ctx, config, { x: 0, y: 0 }, 0);
        
        const expectedAlpha = normalizeOpacity(config.opacity);
        expect(ctx.globalAlpha).toBeCloseTo(expectedAlpha, 10);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 5: Image Watermark Scaling', () => {
  /**
   * **Feature: manga-watermark-tool, Property 5: Image Watermark Scaling**
   * **Validates: Requirements 3.3**
   * 
   * For any image watermark with scale factor S, the rendered watermark dimensions 
   * SHALL equal the original dimensions multiplied by S.
   */
  it('should calculate scaled dimensions correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5000 }),
        fc.integer({ min: 1, max: 5000 }),
        arbScale,
        (width, height, scale) => {
          const scaled = calculateScaledDimensions(width, height, scale);
          
          expect(scaled.width).toBeCloseTo(width * scale, 5);
          expect(scaled.height).toBeCloseTo(height * scale, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 5: Image Watermark Scaling**
   * **Validates: Requirements 3.3**
   * 
   * Scaling SHALL preserve aspect ratio.
   */
  it('should preserve aspect ratio when scaling', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5000 }),
        fc.integer({ min: 1, max: 5000 }),
        arbScale,
        (width, height, scale) => {
          const originalAspectRatio = width / height;
          const scaled = calculateScaledDimensions(width, height, scale);
          const scaledAspectRatio = scaled.width / scaled.height;
          
          expect(scaledAspectRatio).toBeCloseTo(originalAspectRatio, 5);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 6: Tiling Calculation', () => {
  /**
   * **Feature: manga-watermark-tool, Property 6: Tiling Calculation**
   * **Validates: Requirements 3.5**
   * 
   * For any canvas of size (W, H) and watermark of size (w, h) with tiling enabled 
   * and spacing (sx, sy), the number of watermark repetitions SHALL equal 
   * ceil(W / (w + sx)) * ceil(H / (h + sy)).
   */
  it('should calculate correct tile count', () => {
    fc.assert(
      fc.property(
        arbCanvasDimensions,
        arbWatermarkDimensions,
        fc.integer({ min: 0, max: 200 }),
        fc.integer({ min: 0, max: 200 }),
        (canvasSize, watermarkSize, spacingX, spacingY) => {
          const result = calculateTileCount(canvasSize, watermarkSize, spacingX, spacingY);
          
          const expectedTilesX = Math.ceil(canvasSize.width / (watermarkSize.width + spacingX));
          const expectedTilesY = Math.ceil(canvasSize.height / (watermarkSize.height + spacingY));
          const expectedTotal = expectedTilesX * expectedTilesY;
          
          expect(result.tilesX).toBe(expectedTilesX);
          expect(result.tilesY).toBe(expectedTilesY);
          expect(result.totalTiles).toBe(expectedTotal);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 6: Tiling Calculation**
   * **Validates: Requirements 3.5**
   * 
   * Tile count SHALL always be at least 1 in each direction.
   */
  it('should always have at least one tile in each direction', () => {
    fc.assert(
      fc.property(
        arbCanvasDimensions,
        arbWatermarkDimensions,
        fc.integer({ min: 0, max: 200 }),
        fc.integer({ min: 0, max: 200 }),
        (canvasSize, watermarkSize, spacingX, spacingY) => {
          const result = calculateTileCount(canvasSize, watermarkSize, spacingX, spacingY);
          
          expect(result.tilesX).toBeGreaterThanOrEqual(1);
          expect(result.tilesY).toBeGreaterThanOrEqual(1);
          expect(result.totalTiles).toBeGreaterThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 8: Rotation Application', () => {
  /**
   * **Feature: manga-watermark-tool, Property 8: Rotation Application**
   * **Validates: Requirements 4.4**
   * 
   * For any rotation angle between 0 and 360 degrees, the watermark SHALL be 
   * rotated around its center point by exactly the specified angle.
   */
  it('should convert degrees to radians correctly', () => {
    fc.assert(
      fc.property(arbRotation, (degrees) => {
        const radians = degreesToRadians(degrees);
        const expectedRadians = (degrees * Math.PI) / 180;
        
        expect(radians).toBeCloseTo(expectedRadians, 10);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 8: Rotation Application**
   * **Validates: Requirements 4.4**
   * 
   * Rotation of 0 degrees SHALL not call rotate on context.
   */
  it('should not rotate when angle is 0', () => {
    fc.assert(
      fc.property(arbTextWatermarkConfig, (config) => {
        const ctx = createMockContext();
        
        renderTextWatermark(ctx, config, { x: 0, y: 0 }, 0);
        
        expect(ctx.rotate).not.toHaveBeenCalled();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 8: Rotation Application**
   * **Validates: Requirements 4.4**
   * 
   * Non-zero rotation SHALL call rotate with correct radians.
   */
  it('should apply rotation when angle is non-zero', () => {
    fc.assert(
      fc.property(
        arbTextWatermarkConfig,
        fc.integer({ min: 1, max: 360 }),
        (config, rotation) => {
          const ctx = createMockContext();
          
          renderTextWatermark(ctx, config, { x: 0, y: 0 }, rotation);
          
          const expectedRadians = degreesToRadians(rotation);
          expect(ctx.rotate).toHaveBeenCalledWith(expectedRadians);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 8: Rotation Application**
   * **Validates: Requirements 4.4**
   * 
   * Full rotation (360 degrees) SHALL be equivalent to no rotation mathematically.
   */
  it('should handle full rotation (360 degrees)', () => {
    const radians360 = degreesToRadians(360);
    const radians0 = degreesToRadians(0);
    
    // 360 degrees = 2π radians, which is equivalent to 0 rotation
    expect(Math.cos(radians360)).toBeCloseTo(Math.cos(radians0), 10);
    expect(Math.sin(radians360)).toBeCloseTo(Math.sin(radians0), 10);
  });
});
