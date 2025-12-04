/**
 * PreviewCanvas Component
 * Renders image with watermark overlay, supports zoom, pan, and draggable watermark
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useAppContext } from '@/context';
import { useWatermarkSettings, useImages } from '@/hooks';
import {
  render as renderWatermark,
  loadImageFromDataUrl,
  getTextWatermarkDimensions,
  calculateScaledDimensions,
  calculateWatermarkBounds,
  hitTest,
  type WatermarkBounds,
} from '@/services/WatermarkRenderer';
import type { Dimensions, Point } from '@/utils/position';
import type { TextWatermarkConfig, ImageWatermarkConfig } from '@/types';

export interface PreviewCanvasProps {
  className?: string;
}

// Zoom constraints
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_STEP = 0.1;

export function PreviewCanvas({ className = '' }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { state, dispatch } = useAppContext();
  const { selectedImage } = useImages();
  const { settings, setOffset, setPresetPosition } = useWatermarkSettings();
  
  const { previewZoom, previewPan, watermarkVisible } = state;
  
  // Local state
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingWatermark, setIsDraggingWatermark] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [watermarkBounds, setWatermarkBounds] = useState<WatermarkBounds | null>(null);


  // Load selected image when it changes
  useEffect(() => {
    if (!selectedImage) {
      setLoadedImage(null);
      return;
    }

    const img = new Image();
    img.onload = () => setLoadedImage(img);
    img.onerror = () => setLoadedImage(null);
    img.src = selectedImage.dataUrl;
  }, [selectedImage]);

  // Load watermark image when config changes
  useEffect(() => {
    if (settings.config.type !== 'image') {
      setWatermarkImage(null);
      return;
    }

    const imageConfig = settings.config as ImageWatermarkConfig;
    if (!imageConfig.imageData) {
      setWatermarkImage(null);
      return;
    }

    loadImageFromDataUrl(imageConfig.imageData)
      .then(setWatermarkImage)
      .catch(() => setWatermarkImage(null));
  }, [settings.config]);

  // Calculate watermark dimensions
  const watermarkDimensions = useMemo((): Dimensions | null => {
    if (!loadedImage) return null;
    
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (settings.config.type === 'text') {
      const textConfig = settings.config as TextWatermarkConfig;
      if (!textConfig.text) return null;
      return getTextWatermarkDimensions(ctx, textConfig);
    } else if (settings.config.type === 'image' && watermarkImage) {
      const imageConfig = settings.config as ImageWatermarkConfig;
      return calculateScaledDimensions(
        watermarkImage.naturalWidth,
        watermarkImage.naturalHeight,
        imageConfig.scale
      );
    }
    return null;
  }, [loadedImage, settings.config, watermarkImage]);

  // Render canvas - Requirement 8.1
  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = loadedImage.naturalWidth;
    canvas.height = loadedImage.naturalHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the image
    ctx.drawImage(loadedImage, 0, 0);

    // Draw watermark if visible - Requirement 8.4
    if (watermarkVisible && settings.enabled) {
      const canvasSize: Dimensions = {
        width: canvas.width,
        height: canvas.height,
      };

      await renderWatermark(ctx, settings, canvasSize, watermarkImage ?? undefined);

      // Update watermark bounds for hit testing
      if (watermarkDimensions) {
        const bounds = calculateWatermarkBounds(settings, canvasSize, watermarkDimensions);
        setWatermarkBounds(bounds);
      }
    } else {
      setWatermarkBounds(null);
    }
  }, [loadedImage, watermarkImage, settings, watermarkVisible, watermarkDimensions]);

  // Re-render when dependencies change - Requirement 8.1 (within 100ms)
  useEffect(() => {
    const timeoutId = setTimeout(renderCanvas, 16); // ~60fps
    return () => clearTimeout(timeoutId);
  }, [renderCanvas]);


  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number): Point => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };

    const rect = container.getBoundingClientRect();
    const x = (screenX - rect.left - previewPan.x) / previewZoom;
    const y = (screenY - rect.top - previewPan.y) / previewZoom;
    return { x, y };
  }, [previewZoom, previewPan]);

  // Handle zoom with scroll wheel - Requirement 8.2
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, previewZoom + delta));
    
    dispatch({ type: 'SET_PREVIEW_ZOOM', payload: newZoom });
  }, [previewZoom, dispatch]);

  // Handle mouse down for pan/drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvasPoint = screenToCanvas(e.clientX, e.clientY);
    
    // Check if clicking on watermark for dragging - Requirement 8.4 (draggable)
    if (watermarkBounds && hitTest(canvasPoint.x, canvasPoint.y, watermarkBounds)) {
      setIsDraggingWatermark(true);
      setDragStart({
        x: canvasPoint.x - watermarkBounds.x,
        y: canvasPoint.y - watermarkBounds.y,
      });
      return;
    }
    
    // Otherwise start panning - Requirement 8.3
    setIsDragging(true);
    setDragStart({ x: e.clientX - previewPan.x, y: e.clientY - previewPan.y });
  }, [screenToCanvas, watermarkBounds, previewPan]);

  // Handle mouse move for pan/drag
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingWatermark && loadedImage) {
      // Drag watermark - Requirement 4.2
      const canvasPoint = screenToCanvas(e.clientX, e.clientY);
      const newX = canvasPoint.x - dragStart.x;
      const newY = canvasPoint.y - dragStart.y;
      
      // Switch to custom position and set offset
      setPresetPosition('custom');
      setOffset(Math.round(newX), Math.round(newY));
    } else if (isDragging) {
      // Pan canvas - Requirement 8.3
      const newPan = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      dispatch({ type: 'SET_PREVIEW_PAN', payload: newPan });
    }
  }, [isDragging, isDraggingWatermark, dragStart, screenToCanvas, loadedImage, setPresetPosition, setOffset, dispatch]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsDraggingWatermark(false);
  }, []);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setIsDraggingWatermark(false);
  }, []);

  // Toggle watermark visibility - Requirement 8.4
  const toggleWatermarkVisibility = useCallback(() => {
    dispatch({ type: 'TOGGLE_WATERMARK_VISIBLE' });
  }, [dispatch]);

  // Reset zoom and pan
  const resetView = useCallback(() => {
    dispatch({ type: 'SET_PREVIEW_ZOOM', payload: 1 });
    dispatch({ type: 'SET_PREVIEW_PAN', payload: { x: 0, y: 0 } });
  }, [dispatch]);

  // Fit to container
  const fitToContainer = useCallback(() => {
    if (!loadedImage || !containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth - 40; // padding
    const containerHeight = container.clientHeight - 40;
    
    const scaleX = containerWidth / loadedImage.naturalWidth;
    const scaleY = containerHeight / loadedImage.naturalHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    dispatch({ type: 'SET_PREVIEW_ZOOM', payload: scale });
    dispatch({ type: 'SET_PREVIEW_PAN', payload: { x: 20, y: 20 } });
  }, [loadedImage, dispatch]);


  // Cursor style based on state
  const cursorStyle = useMemo(() => {
    if (isDraggingWatermark) return 'grabbing';
    if (isDragging) return 'grabbing';
    if (watermarkBounds) return 'grab';
    return 'default';
  }, [isDragging, isDraggingWatermark, watermarkBounds]);

  // No image selected state
  if (!selectedImage) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">No image selected</p>
          <p className="text-xs mt-1">Upload images to preview watermark</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_PREVIEW_ZOOM', payload: Math.max(MIN_ZOOM, previewZoom - ZOOM_STEP) })}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
            title="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-xs text-gray-600 min-w-[50px] text-center">
            {Math.round(previewZoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_PREVIEW_ZOOM', payload: Math.min(MAX_ZOOM, previewZoom + ZOOM_STEP) })}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
            title="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={resetView}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors text-xs"
            title="Reset view"
          >
            100%
          </button>
          <button
            type="button"
            onClick={fitToContainer}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
            title="Fit to view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Watermark visibility toggle - Requirement 8.4 */}
          <button
            type="button"
            onClick={toggleWatermarkVisibility}
            className={`p-1.5 rounded transition-colors ${
              watermarkVisible
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-400 hover:bg-gray-200'
            }`}
            title={watermarkVisible ? 'Hide watermark' : 'Show watermark'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {watermarkVisible ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              )}
            </svg>
          </button>

          {/* Image info */}
          <span className="text-xs text-gray-500">
            {selectedImage.width} × {selectedImage.height}
          </span>
        </div>
      </div>


      {/* Canvas container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-gray-200 rounded-b-lg relative"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: cursorStyle }}
      >
        {/* Checkerboard pattern for transparency */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #e5e5e5 25%, transparent 25%),
              linear-gradient(-45deg, #e5e5e5 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
              linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          }}
        />

        {/* Canvas with zoom and pan transform */}
        <canvas
          ref={canvasRef}
          className="absolute"
          style={{
            transform: `translate(${previewPan.x}px, ${previewPan.y}px) scale(${previewZoom})`,
            transformOrigin: '0 0',
          }}
        />

        {/* Loading state */}
        {selectedImage && !loadedImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading image...</p>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <span>{selectedImage.name}</span>
        <span>
          {watermarkVisible && settings.enabled
            ? `Watermark: ${settings.config.type}`
            : 'Watermark hidden'}
        </span>
      </div>
    </div>
  );
}

export default PreviewCanvas;
