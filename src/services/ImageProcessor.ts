/**
 * ImageProcessor Service
 * Handles image loading, metadata extraction, batch processing, and export
 * Requirements: 1.1, 1.2, 1.5, 1.6, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.4
 */

import type { 
  UploadedImage, 
  WatermarkSettings, 
  ExportSettings, 
  ProcessingResult, 
  BatchProcessingProgress,
  ExportFormat 
} from '@/types';
import { isValidImageFormat } from '@/utils/validation';
import { render, loadImageFromDataUrl } from './WatermarkRenderer';

/**
 * Generate a unique ID for images
 */
function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Error thrown when image loading fails
 */
export class ImageLoadError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'ImageLoadError';
  }
}

/**
 * Load an image file and extract metadata
 * Requirements: 1.1, 1.2, 1.5, 1.6
 * 
 * @param file - The File object to load
 * @returns Promise resolving to UploadedImage with metadata
 * @throws ImageLoadError if file is invalid or cannot be loaded
 */
export async function loadImage(file: File): Promise<UploadedImage> {
  // Validate file format
  if (!isValidImageFormat(file)) {
    throw new ImageLoadError(`Unsupported file format: ${file.name}`);
  }

  // Read file as data URL
  const dataUrl = await readFileAsDataUrl(file);

  // Load image to extract dimensions
  const { width, height } = await getImageDimensions(dataUrl);

  return {
    id: generateImageId(),
    file,
    name: file.name,
    width,
    height,
    size: file.size,
    dataUrl,
    processed: false,
  };
}

/**
 * Read a file as a data URL
 * @param file - The File to read
 * @returns Promise resolving to data URL string
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new ImageLoadError('Failed to read file as data URL'));
      }
    };
    
    reader.onerror = () => {
      reject(new ImageLoadError('Failed to read file', reader.error ?? undefined));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions from a data URL
 * @param dataUrl - The data URL of the image
 * @returns Promise resolving to width and height
 */
export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    
    img.onerror = () => {
      reject(new ImageLoadError('Failed to load image for dimension extraction'));
    };
    
    img.src = dataUrl;
  });
}

/**
 * Load multiple images
 * Requirements: 1.1, 1.2
 * 
 * @param files - Array of File objects to load
 * @param onProgress - Optional callback for progress updates
 * @returns Promise resolving to array of results (success or error for each)
 */
export async function loadImages(
  files: File[],
  onProgress?: (loaded: number, total: number) => void
): Promise<Array<{ file: File; result: UploadedImage | Error }>> {
  const results: Array<{ file: File; result: UploadedImage | Error }> = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) continue;
    try {
      const image = await loadImage(file);
      results.push({ file, result: image });
    } catch (error) {
      results.push({ 
        file, 
        result: error instanceof Error ? error : new ImageLoadError('Unknown error') 
      });
    }
    
    onProgress?.(i + 1, files.length);
  }
  
  return results;
}

/**
 * Extract metadata from an UploadedImage
 * Requirements: 1.5
 * 
 * @param image - The UploadedImage to extract metadata from
 * @returns Object containing metadata
 */
export function extractMetadata(image: UploadedImage): {
  name: string;
  width: number;
  height: number;
  size: number;
  aspectRatio: number;
} {
  return {
    name: image.name,
    width: image.width,
    height: image.height,
    size: image.size,
    aspectRatio: image.width / image.height,
  };
}

// ============================================
// Batch Processing
// Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
// ============================================

/**
 * Batch processor state for cancellation support
 */
let batchCancelled = false;

/**
 * Cancel ongoing batch processing
 * Requirements: 6.5
 */
export function cancelBatch(): void {
  batchCancelled = true;
}

/**
 * Reset batch cancellation state
 */
export function resetBatchCancellation(): void {
  batchCancelled = false;
}

/**
 * Check if batch processing is cancelled
 */
export function isBatchCancelled(): boolean {
  return batchCancelled;
}

/**
 * Apply watermark to a single image and return the result as a Blob
 * Requirements: 6.1
 * 
 * @param image - The uploaded image to process
 * @param settings - Watermark settings to apply
 * @returns Promise resolving to Blob with watermarked image
 */
export async function applyWatermark(
  image: UploadedImage,
  settings: WatermarkSettings
): Promise<Blob> {
  // Create canvas with image dimensions
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new ImageLoadError('Failed to create canvas context');
  }

  // Load and draw the base image
  const img = await loadImageFromDataUrl(image.dataUrl);
  ctx.drawImage(img, 0, 0, image.width, image.height);

  // Load watermark image if needed
  let watermarkImage: HTMLImageElement | undefined;
  if (settings.config.type === 'image' && settings.config.imageData) {
    watermarkImage = await loadImageFromDataUrl(settings.config.imageData);
  }

  // Render watermark
  await render(ctx, settings, { width: image.width, height: image.height }, watermarkImage);

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new ImageLoadError('Failed to convert canvas to blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Process a single image and return the result
 * @param image - Image to process
 * @param settings - Watermark settings
 * @param exportSettings - Export settings
 * @returns Processing result
 */
async function processSingleImage(
  image: UploadedImage,
  settings: WatermarkSettings,
  exportSettings: ExportSettings
): Promise<ProcessingResult> {
  try {
    // Apply watermark
    const watermarkedBlob = await applyWatermark(image, settings);
    
    // Export with format conversion
    const outputBlob = await exportImage(
      watermarkedBlob,
      image.name,
      exportSettings.format,
      exportSettings.quality
    );
    
    // Generate output filename
    const outputFilename = generateOutputFilename(
      image.name,
      exportSettings.filenamePrefix,
      exportSettings.filenameSuffix,
      exportSettings.format
    );

    return {
      imageId: image.id,
      success: true,
      outputBlob,
      outputFilename,
    };
  } catch (error) {
    return {
      imageId: image.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch process multiple images with watermark
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 * 
 * @param images - Array of images to process
 * @param settings - Watermark settings to apply
 * @param exportSettings - Export settings
 * @param onProgress - Callback for progress updates
 * @returns Promise resolving to array of processing results
 */
export async function batchProcess(
  images: UploadedImage[],
  settings: WatermarkSettings,
  exportSettings: ExportSettings,
  onProgress?: (progress: BatchProcessingProgress) => void
): Promise<ProcessingResult[]> {
  // Reset cancellation state
  resetBatchCancellation();
  
  const results: ProcessingResult[] = [];
  const total = images.length;
  let completed = 0;
  let failed = 0;

  for (const image of images) {
    // Check for cancellation
    if (batchCancelled) {
      break;
    }

    // Report progress before processing
    onProgress?.({
      total,
      completed,
      failed,
      currentImage: image.name,
      results: [...results],
    });

    // Process the image
    const result = await processSingleImage(image, settings, exportSettings);
    results.push(result);
    
    completed++;
    if (!result.success) {
      failed++;
    }

    // Report progress after processing
    onProgress?.({
      total,
      completed,
      failed,
      currentImage: image.name,
      results: [...results],
    });
  }

  // Final progress report
  onProgress?.({
    total,
    completed,
    failed,
    currentImage: '',
    results: [...results],
  });

  return results;
}

// ============================================
// Export Functionality
// Requirements: 7.1, 7.2, 7.4
// ============================================

/**
 * Get MIME type for export format
 * @param format - Export format
 * @returns MIME type string
 */
export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'jpg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/png';
  }
}

/**
 * Get file extension for export format
 * @param format - Export format
 * @returns File extension with dot
 */
export function getExtensionForFormat(format: ExportFormat): string {
  switch (format) {
    case 'jpg':
      return '.jpg';
    case 'png':
      return '.png';
    case 'webp':
      return '.webp';
    default:
      return '.png';
  }
}

/**
 * Export image with format conversion and quality settings
 * Requirements: 7.1, 7.2
 * 
 * @param blob - Source blob to convert
 * @param filename - Original filename
 * @param format - Target format
 * @param quality - Quality setting (0-100)
 * @returns Promise resolving to converted Blob
 */
export async function exportImage(
  blob: Blob,
  _filename: string,
  format: ExportFormat,
  quality: number
): Promise<Blob> {
  // Create image from blob
  const url = URL.createObjectURL(blob);
  
  try {
    const img = await loadImageFromUrl(url);
    
    // Create canvas and draw image
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new ImageLoadError('Failed to create canvas context');
    }
    
    ctx.drawImage(img, 0, 0);
    
    // Convert to target format
    const mimeType = getMimeType(format);
    const normalizedQuality = quality / 100; // Convert 0-100 to 0-1
    
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (resultBlob) => {
          if (resultBlob) {
            resolve(resultBlob);
          } else {
            reject(new ImageLoadError('Failed to export image'));
          }
        },
        mimeType,
        normalizedQuality
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Load image from object URL
 * @param url - Object URL
 * @returns Promise resolving to HTMLImageElement
 */
function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new ImageLoadError('Failed to load image from URL'));
    img.src = url;
  });
}

/**
 * Generate output filename with prefix and suffix
 * Requirements: 7.4
 * 
 * @param originalName - Original filename
 * @param prefix - Filename prefix
 * @param suffix - Filename suffix
 * @param format - Export format
 * @returns Modified filename
 */
export function generateOutputFilename(
  originalName: string,
  prefix: string,
  suffix: string,
  format: ExportFormat
): string {
  // Remove original extension
  const lastDotIndex = originalName.lastIndexOf('.');
  const baseName = lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;
  
  // Get new extension
  const extension = getExtensionForFormat(format);
  
  // Combine prefix + baseName + suffix + extension
  return `${prefix}${baseName}${suffix}${extension}`;
}

// ============================================
// ZIP Packaging
// Requirements: 7.6
// ============================================

/**
 * Export multiple processed images as a ZIP archive
 * Requirements: 7.6
 * 
 * @param results - Array of processing results with blobs
 * @param zipFilename - Name for the ZIP file (without extension)
 * @returns Promise resolving to ZIP Blob
 */
export async function exportAsZip(
  results: ProcessingResult[],
  _zipFilename: string = 'watermarked_images'
): Promise<Blob> {
  // Dynamically import JSZip to avoid bundling issues
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  
  // Add each successful result to the ZIP
  for (const result of results) {
    if (result.success && result.outputBlob && result.outputFilename) {
      zip.file(result.outputFilename, result.outputBlob);
    }
  }
  
  // Generate the ZIP file
  const zipBlob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  
  return zipBlob;
}

/**
 * Get the count of files that would be included in a ZIP
 * @param results - Array of processing results
 * @returns Number of successful results with blobs
 */
export function getZipFileCount(results: ProcessingResult[]): number {
  return results.filter(r => r.success && r.outputBlob && r.outputFilename).length;
}

/**
 * Download a blob as a file
 * @param blob - Blob to download
 * @param filename - Filename for the download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
