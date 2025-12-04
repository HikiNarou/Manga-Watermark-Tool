/**
 * Property-Based Tests for Position Calculation Utilities
 * 
 * **Feature: manga-watermark-tool, Property 7: Position Calculation**
 * **Validates: Requirements 4.1, 4.3**
 * 
 * **Feature: manga-watermark-tool, Property 9: Margin Constraints**
 * **Validates: Requirements 4.5**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculatePresetPosition,
  applyMargins,
  clampToCanvas,
  respectsMargins,
  type Point,
  type Dimensions,
} from './position';
import { arbPresetPosition } from '@/test/helpers';

// Arbitrary for valid canvas dimensions (must be positive)
const arbCanvasDimensions = fc.record({
  width: fc.integer({ min: 100, max: 4000 }),
  height: fc.integer({ min: 100, max: 4000 }),
});



// Arbitrary for margins (reasonable values)
const arbMargins = fc.record({
  top: fc.integer({ min: 0, max: 100 }),
  right: fc.integer({ min: 0, max: 100 }),
  bottom: fc.integer({ min: 0, max: 100 }),
  left: fc.integer({ min: 0, max: 100 }),
});

describe('Property 7: Position Calculation', () => {
  /**
   * **Feature: manga-watermark-tool, Property 7: Position Calculation**
   * **Validates: Requirements 4.1, 4.3**
   * 
   * For any preset position and canvas dimensions, the calculated watermark 
   * coordinates SHALL place the watermark at the correct location according 
   * to the position grid.
   */
  it('should place watermark at correct position for all preset positions', () => {
    fc.assert(
      fc.property(
        arbCanvasDimensions,
        fc.integer({ min: 10, max: 500 }),
        fc.integer({ min: 10, max: 500 }),
        arbPresetPosition,
        (canvas, wmWidth, wmHeight, presetPosition) => {
          // Ensure watermark fits in canvas
          const watermark: Dimensions = {
            width: Math.min(wmWidth, canvas.width - 1),
            height: Math.min(wmHeight, canvas.height - 1),
          };

          const result = calculatePresetPosition(presetPosition, canvas, watermark);

          // Verify horizontal position
          if (presetPosition.includes('left')) {
            expect(result.x).toBe(0);
          } else if (presetPosition.includes('right')) {
            expect(result.x).toBe(canvas.width - watermark.width);
          } else {
            // center
            expect(result.x).toBe((canvas.width - watermark.width) / 2);
          }

          // Verify vertical position
          if (presetPosition.includes('top')) {
            expect(result.y).toBe(0);
          } else if (presetPosition.includes('bottom')) {
            expect(result.y).toBe(canvas.height - watermark.height);
          } else {
            // middle
            expect(result.y).toBe((canvas.height - watermark.height) / 2);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 7: Position Calculation**
   * **Validates: Requirements 4.1, 4.3**
   * 
   * For 'bottom-right' position, the watermark SHALL be placed at 
   * (canvasWidth - watermarkWidth, canvasHeight - watermarkHeight).
   */
  it('should correctly calculate bottom-right position', () => {
    fc.assert(
      fc.property(
        arbCanvasDimensions,
        fc.integer({ min: 10, max: 500 }),
        fc.integer({ min: 10, max: 500 }),
        (canvas, wmWidth, wmHeight) => {
          const watermark: Dimensions = {
            width: Math.min(wmWidth, canvas.width - 1),
            height: Math.min(wmHeight, canvas.height - 1),
          };

          const result = calculatePresetPosition('bottom-right', canvas, watermark);

          expect(result.x).toBe(canvas.width - watermark.width);
          expect(result.y).toBe(canvas.height - watermark.height);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 7: Position Calculation**
   * **Validates: Requirements 4.1, 4.3**
   * 
   * For 'center' position, the watermark SHALL be centered both horizontally 
   * and vertically.
   */
  it('should correctly calculate center position', () => {
    fc.assert(
      fc.property(
        arbCanvasDimensions,
        fc.integer({ min: 10, max: 500 }),
        fc.integer({ min: 10, max: 500 }),
        (canvas, wmWidth, wmHeight) => {
          const watermark: Dimensions = {
            width: Math.min(wmWidth, canvas.width - 1),
            height: Math.min(wmHeight, canvas.height - 1),
          };

          const result = calculatePresetPosition('center', canvas, watermark);

          expect(result.x).toBe((canvas.width - watermark.width) / 2);
          expect(result.y).toBe((canvas.height - watermark.height) / 2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 7: Position Calculation**
   * **Validates: Requirements 4.1, 4.3**
   * 
   * For any preset position, the resulting position SHALL keep the watermark 
   * fully within canvas bounds (when watermark fits in canvas).
   */
  it('should keep watermark within canvas bounds for all preset positions', () => {
    fc.assert(
      fc.property(
        arbCanvasDimensions,
        fc.integer({ min: 10, max: 500 }),
        fc.integer({ min: 10, max: 500 }),
        arbPresetPosition,
        (canvas, wmWidth, wmHeight, presetPosition) => {
          const watermark: Dimensions = {
            width: Math.min(wmWidth, canvas.width - 1),
            height: Math.min(wmHeight, canvas.height - 1),
          };

          const result = calculatePresetPosition(presetPosition, canvas, watermark);

          // Watermark should be within canvas bounds
          expect(result.x).toBeGreaterThanOrEqual(0);
          expect(result.y).toBeGreaterThanOrEqual(0);
          expect(result.x + watermark.width).toBeLessThanOrEqual(canvas.width);
          expect(result.y + watermark.height).toBeLessThanOrEqual(canvas.height);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 9: Margin Constraints', () => {
  /**
   * **Feature: manga-watermark-tool, Property 9: Margin Constraints**
   * **Validates: Requirements 4.5**
   * 
   * For any watermark position with margins specified, the watermark bounds 
   * SHALL not extend beyond (margin) pixels from any edge of the canvas.
   */
  it('should enforce margin constraints on all edges', () => {
    fc.assert(
      fc.property(
        arbCanvasDimensions,
        arbMargins,
        fc.integer({ min: -500, max: 500 }),
        fc.integer({ min: -500, max: 500 }),
        (canvas, margins, startX, startY) => {
          // Ensure there's room for watermark after margins
          const availableWidth = canvas.width - margins.left - margins.right;
          const availableHeight = canvas.height - margins.top - margins.bottom;
          
          // Skip if margins are too large for canvas
          if (availableWidth < 10 || availableHeight < 10) {
            return;
          }

          const watermark: Dimensions = {
            width: Math.min(50, availableWidth - 1),
            height: Math.min(50, availableHeight - 1),
          };

          const startPosition: Point = { x: startX, y: startY };
          const result = applyMargins(startPosition, margins, canvas, watermark);

          // Verify margin constraints
          expect(result.x).toBeGreaterThanOrEqual(margins.left);
          expect(result.y).toBeGreaterThanOrEqual(margins.top);
          expect(result.x + watermark.width).toBeLessThanOrEqual(canvas.width - margins.right);
          expect(result.y + watermark.height).toBeLessThanOrEqual(canvas.height - margins.bottom);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 9: Margin Constraints**
   * **Validates: Requirements 4.5**
   * 
   * After applying margins, the position SHALL respect all margin constraints.
   */
  it('should produce positions that pass respectsMargins check', () => {
    fc.assert(
      fc.property(
        arbCanvasDimensions,
        arbMargins,
        fc.integer({ min: -500, max: 500 }),
        fc.integer({ min: -500, max: 500 }),
        (canvas, margins, startX, startY) => {
          // Ensure there's room for watermark after margins
          const availableWidth = canvas.width - margins.left - margins.right;
          const availableHeight = canvas.height - margins.top - margins.bottom;
          
          if (availableWidth < 10 || availableHeight < 10) {
            return;
          }

          const watermark: Dimensions = {
            width: Math.min(50, availableWidth - 1),
            height: Math.min(50, availableHeight - 1),
          };

          const startPosition: Point = { x: startX, y: startY };
          const result = applyMargins(startPosition, margins, canvas, watermark);

          // The result should respect margins
          expect(respectsMargins(result, margins, canvas, watermark)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 9: Margin Constraints**
   * **Validates: Requirements 4.5**
   * 
   * clampToCanvas SHALL ensure watermark stays within canvas bounds (0 margin).
   */
  it('should clamp positions to canvas bounds', () => {
    fc.assert(
      fc.property(
        arbCanvasDimensions,
        fc.integer({ min: -1000, max: 5000 }),
        fc.integer({ min: -1000, max: 5000 }),
        fc.integer({ min: 10, max: 500 }),
        fc.integer({ min: 10, max: 500 }),
        (canvas, startX, startY, wmWidth, wmHeight) => {
          const watermark: Dimensions = {
            width: Math.min(wmWidth, canvas.width - 1),
            height: Math.min(wmHeight, canvas.height - 1),
          };

          const startPosition: Point = { x: startX, y: startY };
          const result = clampToCanvas(startPosition, canvas, watermark);

          // Result should be within canvas bounds
          expect(result.x).toBeGreaterThanOrEqual(0);
          expect(result.y).toBeGreaterThanOrEqual(0);
          expect(result.x + watermark.width).toBeLessThanOrEqual(canvas.width);
          expect(result.y + watermark.height).toBeLessThanOrEqual(canvas.height);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 9: Margin Constraints**
   * **Validates: Requirements 4.5**
   * 
   * If a position already respects margins, applyMargins SHALL not change it.
   */
  it('should not change positions that already respect margins', () => {
    fc.assert(
      fc.property(
        arbCanvasDimensions,
        arbMargins,
        (canvas, margins) => {
          // Ensure there's room for watermark after margins
          const availableWidth = canvas.width - margins.left - margins.right;
          const availableHeight = canvas.height - margins.top - margins.bottom;
          
          if (availableWidth < 20 || availableHeight < 20) {
            return;
          }

          const watermark: Dimensions = {
            width: Math.min(50, availableWidth - 10),
            height: Math.min(50, availableHeight - 10),
          };

          // Create a position that already respects margins
          const validPosition: Point = {
            x: margins.left + 5,
            y: margins.top + 5,
          };

          const result = applyMargins(validPosition, margins, canvas, watermark);

          // Position should remain unchanged
          expect(result.x).toBe(validPosition.x);
          expect(result.y).toBe(validPosition.y);
        }
      ),
      { numRuns: 100 }
    );
  });
});
