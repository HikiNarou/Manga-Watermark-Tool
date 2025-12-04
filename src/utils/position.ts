/**
 * Position Calculation Utilities
 * Requirements: 4.1, 4.3, 4.5
 */

import type { PresetPosition, WatermarkPosition } from '@/types';

/**
 * Represents a 2D point/coordinate
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents dimensions of a rectangle
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Represents margin values for all four sides
 */
export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Calculate the position coordinates for a preset position
 * Requirements: 4.1, 4.3
 * 
 * @param presetPosition - The preset position (e.g., 'top-left', 'center', 'bottom-right')
 * @param canvasSize - The dimensions of the canvas
 * @param watermarkSize - The dimensions of the watermark
 * @returns The calculated x, y coordinates for the watermark's top-left corner
 */
export function calculatePresetPosition(
  presetPosition: PresetPosition,
  canvasSize: Dimensions,
  watermarkSize: Dimensions
): Point {
  const { width: canvasWidth, height: canvasHeight } = canvasSize;
  const { width: wmWidth, height: wmHeight } = watermarkSize;

  // Calculate horizontal position
  let x: number;
  if (presetPosition.includes('left')) {
    x = 0;
  } else if (presetPosition.includes('right')) {
    x = canvasWidth - wmWidth;
  } else {
    // center
    x = (canvasWidth - wmWidth) / 2;
  }

  // Calculate vertical position
  let y: number;
  if (presetPosition.includes('top')) {
    y = 0;
  } else if (presetPosition.includes('bottom')) {
    y = canvasHeight - wmHeight;
  } else {
    // middle
    y = (canvasHeight - wmHeight) / 2;
  }

  return { x, y };
}

/**
 * Apply margins to a position, ensuring the watermark stays within margin bounds
 * Requirements: 4.5
 * 
 * @param position - The current position
 * @param margins - The margin values to apply
 * @param canvasSize - The dimensions of the canvas
 * @param watermarkSize - The dimensions of the watermark
 * @returns The adjusted position with margins applied
 */
export function applyMargins(
  position: Point,
  margins: Margins,
  canvasSize: Dimensions,
  watermarkSize: Dimensions
): Point {
  const { width: canvasWidth, height: canvasHeight } = canvasSize;
  const { width: wmWidth, height: wmHeight } = watermarkSize;

  // Calculate the valid bounds considering margins
  const minX = margins.left;
  const maxX = canvasWidth - wmWidth - margins.right;
  const minY = margins.top;
  const maxY = canvasHeight - wmHeight - margins.bottom;

  // Clamp position to margin bounds
  return {
    x: Math.max(minX, Math.min(maxX, position.x)),
    y: Math.max(minY, Math.min(maxY, position.y)),
  };
}

/**
 * Clamp a position to ensure the watermark stays within canvas bounds
 * Requirements: 4.5
 * 
 * @param position - The current position
 * @param canvasSize - The dimensions of the canvas
 * @param watermarkSize - The dimensions of the watermark
 * @returns The clamped position within canvas bounds
 */
export function clampToCanvas(
  position: Point,
  canvasSize: Dimensions,
  watermarkSize: Dimensions
): Point {
  const { width: canvasWidth, height: canvasHeight } = canvasSize;
  const { width: wmWidth, height: wmHeight } = watermarkSize;

  return {
    x: Math.max(0, Math.min(canvasWidth - wmWidth, position.x)),
    y: Math.max(0, Math.min(canvasHeight - wmHeight, position.y)),
  };
}

/**
 * Calculate the final watermark position considering preset, offsets, and margins
 * 
 * @param watermarkPosition - The complete watermark position configuration
 * @param canvasSize - The dimensions of the canvas
 * @param watermarkSize - The dimensions of the watermark
 * @returns The final calculated position
 */
export function calculateFinalPosition(
  watermarkPosition: WatermarkPosition,
  canvasSize: Dimensions,
  watermarkSize: Dimensions
): Point {
  let position: Point;

  // Start with preset position or custom offset
  if (watermarkPosition.presetPosition === 'custom') {
    position = {
      x: watermarkPosition.offsetX,
      y: watermarkPosition.offsetY,
    };
  } else {
    position = calculatePresetPosition(
      watermarkPosition.presetPosition,
      canvasSize,
      watermarkSize
    );
    // Apply offsets to preset position
    position = {
      x: position.x + watermarkPosition.offsetX,
      y: position.y + watermarkPosition.offsetY,
    };
  }

  // Apply margins
  const margins: Margins = {
    top: watermarkPosition.marginTop,
    right: watermarkPosition.marginRight,
    bottom: watermarkPosition.marginBottom,
    left: watermarkPosition.marginLeft,
  };

  position = applyMargins(position, margins, canvasSize, watermarkSize);

  return position;
}

/**
 * Check if a watermark at the given position would be fully visible on the canvas
 * 
 * @param position - The watermark position
 * @param canvasSize - The dimensions of the canvas
 * @param watermarkSize - The dimensions of the watermark
 * @returns true if the watermark is fully visible
 */
export function isFullyVisible(
  position: Point,
  canvasSize: Dimensions,
  watermarkSize: Dimensions
): boolean {
  const { width: canvasWidth, height: canvasHeight } = canvasSize;
  const { width: wmWidth, height: wmHeight } = watermarkSize;

  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x + wmWidth <= canvasWidth &&
    position.y + wmHeight <= canvasHeight
  );
}

/**
 * Check if a position respects the given margins
 * 
 * @param position - The watermark position
 * @param margins - The margin values
 * @param canvasSize - The dimensions of the canvas
 * @param watermarkSize - The dimensions of the watermark
 * @returns true if the position respects all margins
 */
export function respectsMargins(
  position: Point,
  margins: Margins,
  canvasSize: Dimensions,
  watermarkSize: Dimensions
): boolean {
  const { width: canvasWidth, height: canvasHeight } = canvasSize;
  const { width: wmWidth, height: wmHeight } = watermarkSize;

  return (
    position.x >= margins.left &&
    position.y >= margins.top &&
    position.x + wmWidth <= canvasWidth - margins.right &&
    position.y + wmHeight <= canvasHeight - margins.bottom
  );
}
