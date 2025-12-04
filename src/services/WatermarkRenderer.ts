/**
 * WatermarkRenderer Service
 * Handles rendering of text and image watermarks on canvas
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 4.4
 */

import type {
  WatermarkSettings,
  TextWatermarkConfig,
  ImageWatermarkConfig,
} from '@/types';
import { calculateFinalPosition, type Dimensions, type Point } from '@/utils/position';

/**
 * Watermark bounds for hit testing and positioning
 */
export interface WatermarkBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Convert opacity from 0-100 scale to 0-1 scale for canvas
 * @param opacity - Opacity value from 0-100
 * @returns Opacity value from 0-1
 */
export function normalizeOpacity(opacity: number): number {
  return Math.max(0, Math.min(100, opacity)) / 100;
}

/**
 * Convert rotation from degrees to radians
 * @param degrees - Rotation in degrees
 * @returns Rotation in radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Measure text dimensions using canvas context
 * @param ctx - Canvas 2D context
 * @param text - Text to measure
 * @param fontFamily - Font family
 * @param fontSize - Font size in pixels
 * @param fontWeight - Font weight
 * @returns Text dimensions
 */
export function measureText(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  fontSize: number,
  fontWeight: 'normal' | 'bold'
): Dimensions {
  ctx.save();
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text);
  ctx.restore();

  // Calculate height based on font metrics
  const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent || fontSize;
  
  return {
    width: metrics.width,
    height,
  };
}

/**
 * Render text watermark on canvas
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 * 
 * @param ctx - Canvas 2D rendering context
 * @param config - Text watermark configuration
 * @param position - Position on canvas
 * @param rotation - Rotation in degrees
 */
export function renderTextWatermark(
  ctx: CanvasRenderingContext2D,
  config: TextWatermarkConfig,
  position: Point,
  rotation: number = 0
): void {
  if (!config.text || config.text.trim().length === 0) {
    return;
  }

  ctx.save();

  // Set font
  ctx.font = `${config.fontWeight} ${config.fontSize}px ${config.fontFamily}`;
  ctx.textBaseline = 'top';

  // Measure text for rotation center
  const textMetrics = ctx.measureText(config.text);
  const textWidth = textMetrics.width;
  const textHeight = config.fontSize;

  // Calculate center point for rotation
  const centerX = position.x + textWidth / 2;
  const centerY = position.y + textHeight / 2;

  // Apply rotation around center
  if (rotation !== 0) {
    ctx.translate(centerX, centerY);
    ctx.rotate(degreesToRadians(rotation));
    ctx.translate(-centerX, -centerY);
  }

  // Set opacity
  ctx.globalAlpha = normalizeOpacity(config.opacity);

  // Draw outline if enabled
  if (config.outlineEnabled && config.outlineWidth > 0) {
    ctx.strokeStyle = config.outlineColor;
    ctx.lineWidth = config.outlineWidth;
    ctx.lineJoin = 'round';
    ctx.strokeText(config.text, position.x, position.y);
  }

  // Draw text fill
  ctx.fillStyle = config.color;
  ctx.fillText(config.text, position.x, position.y);

  ctx.restore();
}

/**
 * Get text watermark dimensions
 * @param ctx - Canvas 2D context
 * @param config - Text watermark configuration
 * @returns Dimensions of the text watermark
 */
export function getTextWatermarkDimensions(
  ctx: CanvasRenderingContext2D,
  config: TextWatermarkConfig
): Dimensions {
  return measureText(
    ctx,
    config.text,
    config.fontFamily,
    config.fontSize,
    config.fontWeight
  );
}


/**
 * Load an image from a data URL
 * @param dataUrl - Base64 data URL of the image
 * @returns Promise resolving to HTMLImageElement
 */
export function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load watermark image'));
    img.src = dataUrl;
  });
}

/**
 * Calculate scaled dimensions for image watermark
 * Requirements: 3.3
 * 
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param scale - Scale factor
 * @returns Scaled dimensions
 */
export function calculateScaledDimensions(
  originalWidth: number,
  originalHeight: number,
  scale: number
): Dimensions {
  return {
    width: originalWidth * scale,
    height: originalHeight * scale,
  };
}

/**
 * Calculate number of tiles needed for tiling
 * Requirements: 3.5
 * 
 * @param canvasSize - Canvas dimensions
 * @param watermarkSize - Watermark dimensions
 * @param spacingX - Horizontal spacing between tiles
 * @param spacingY - Vertical spacing between tiles
 * @returns Number of tiles in x and y directions
 */
export function calculateTileCount(
  canvasSize: Dimensions,
  watermarkSize: Dimensions,
  spacingX: number,
  spacingY: number
): { tilesX: number; tilesY: number; totalTiles: number } {
  const effectiveWidth = watermarkSize.width + spacingX;
  const effectiveHeight = watermarkSize.height + spacingY;
  
  const tilesX = Math.ceil(canvasSize.width / effectiveWidth);
  const tilesY = Math.ceil(canvasSize.height / effectiveHeight);
  
  return {
    tilesX,
    tilesY,
    totalTiles: tilesX * tilesY,
  };
}

/**
 * Render image watermark on canvas
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 * 
 * @param ctx - Canvas 2D rendering context
 * @param config - Image watermark configuration
 * @param image - Loaded HTMLImageElement
 * @param position - Position on canvas
 * @param canvasSize - Canvas dimensions (needed for tiling)
 * @param rotation - Rotation in degrees
 */
export function renderImageWatermark(
  ctx: CanvasRenderingContext2D,
  config: ImageWatermarkConfig,
  image: HTMLImageElement,
  position: Point,
  canvasSize: Dimensions,
  rotation: number = 0
): void {
  ctx.save();

  // Set opacity
  ctx.globalAlpha = normalizeOpacity(config.opacity);

  // Calculate scaled dimensions
  const scaledDimensions = calculateScaledDimensions(
    image.naturalWidth,
    image.naturalHeight,
    config.scale
  );

  if (config.tileEnabled) {
    // Render tiled watermarks
    renderTiledWatermark(
      ctx,
      image,
      scaledDimensions,
      canvasSize,
      config.tileSpacingX,
      config.tileSpacingY,
      rotation
    );
  } else {
    // Render single watermark
    renderSingleImageWatermark(
      ctx,
      image,
      position,
      scaledDimensions,
      rotation
    );
  }

  ctx.restore();
}

/**
 * Render a single image watermark
 * @param ctx - Canvas context
 * @param image - Image element
 * @param position - Position
 * @param dimensions - Scaled dimensions
 * @param rotation - Rotation in degrees
 */
function renderSingleImageWatermark(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  position: Point,
  dimensions: Dimensions,
  rotation: number
): void {
  const centerX = position.x + dimensions.width / 2;
  const centerY = position.y + dimensions.height / 2;

  if (rotation !== 0) {
    ctx.translate(centerX, centerY);
    ctx.rotate(degreesToRadians(rotation));
    ctx.translate(-centerX, -centerY);
  }

  ctx.drawImage(
    image,
    position.x,
    position.y,
    dimensions.width,
    dimensions.height
  );
}

/**
 * Render tiled watermarks across the canvas
 * Requirements: 3.5
 * 
 * @param ctx - Canvas context
 * @param image - Image element
 * @param dimensions - Scaled dimensions
 * @param canvasSize - Canvas dimensions
 * @param spacingX - Horizontal spacing
 * @param spacingY - Vertical spacing
 * @param rotation - Rotation in degrees
 */
function renderTiledWatermark(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  dimensions: Dimensions,
  canvasSize: Dimensions,
  spacingX: number,
  spacingY: number,
  rotation: number
): void {
  const { tilesX, tilesY } = calculateTileCount(
    canvasSize,
    dimensions,
    spacingX,
    spacingY
  );

  const effectiveWidth = dimensions.width + spacingX;
  const effectiveHeight = dimensions.height + spacingY;

  for (let row = 0; row < tilesY; row++) {
    for (let col = 0; col < tilesX; col++) {
      const x = col * effectiveWidth;
      const y = row * effectiveHeight;

      ctx.save();

      if (rotation !== 0) {
        const centerX = x + dimensions.width / 2;
        const centerY = y + dimensions.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(degreesToRadians(rotation));
        ctx.translate(-centerX, -centerY);
      }

      ctx.drawImage(image, x, y, dimensions.width, dimensions.height);
      ctx.restore();
    }
  }
}

/**
 * Calculate watermark bounds for hit testing
 * @param settings - Watermark settings
 * @param canvasSize - Canvas dimensions
 * @param watermarkSize - Watermark dimensions
 * @returns Watermark bounds
 */
export function calculateWatermarkBounds(
  settings: WatermarkSettings,
  canvasSize: Dimensions,
  watermarkSize: Dimensions
): WatermarkBounds {
  const position = calculateFinalPosition(
    settings.position,
    canvasSize,
    watermarkSize
  );

  return {
    x: position.x,
    y: position.y,
    width: watermarkSize.width,
    height: watermarkSize.height,
  };
}

/**
 * Check if a point is within watermark bounds
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param bounds - Watermark bounds
 * @returns true if point is within bounds
 */
export function hitTest(
  x: number,
  y: number,
  bounds: WatermarkBounds
): boolean {
  return (
    x >= bounds.x &&
    x <= bounds.x + bounds.width &&
    y >= bounds.y &&
    y <= bounds.y + bounds.height
  );
}

/**
 * Render watermark based on settings
 * Main entry point for watermark rendering
 * 
 * @param ctx - Canvas 2D context
 * @param settings - Complete watermark settings
 * @param canvasSize - Canvas dimensions
 * @param watermarkImage - Optional loaded image for image watermarks
 */
export async function render(
  ctx: CanvasRenderingContext2D,
  settings: WatermarkSettings,
  canvasSize: Dimensions,
  watermarkImage?: HTMLImageElement
): Promise<void> {
  if (!settings.enabled) {
    return;
  }

  const config = settings.config;

  if (config.type === 'text') {
    const dimensions = getTextWatermarkDimensions(ctx, config);
    const position = calculateFinalPosition(
      settings.position,
      canvasSize,
      dimensions
    );
    renderTextWatermark(ctx, config, position, settings.position.rotation);
  } else if (config.type === 'image' && watermarkImage) {
    const scaledDimensions = calculateScaledDimensions(
      watermarkImage.naturalWidth,
      watermarkImage.naturalHeight,
      config.scale
    );
    const position = calculateFinalPosition(
      settings.position,
      canvasSize,
      scaledDimensions
    );
    renderImageWatermark(
      ctx,
      config,
      watermarkImage,
      position,
      canvasSize,
      settings.position.rotation
    );
  }
}
