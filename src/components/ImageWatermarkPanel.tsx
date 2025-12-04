/**
 * ImageWatermarkPanel Component
 * Configuration panel for image watermark settings
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import React, { useCallback, useRef, useState } from 'react';
import { useWatermarkSettings } from '@/hooks';
import type { ImageWatermarkConfig } from '@/types';

export interface ImageWatermarkPanelProps {
  className?: string;
}

export function ImageWatermarkPanel({ className = '' }: ImageWatermarkPanelProps) {
  const {
    config,
    isImageWatermark,
    setImageData,
    setImageScale,
    setImageOpacity,
    setTileEnabled,
    setTileSpacing,
  } = useWatermarkSettings();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Only render if we have an image watermark config
  if (!isImageWatermark) {
    return null;
  }

  const imageConfig = config as ImageWatermarkConfig;

  // Handle image upload - Requirement 3.1
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate PNG format
    if (!file.type.includes('png') && !file.type.includes('image')) {
      setError('Please upload a PNG image for best transparency support');
    } else {
      setError(null);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setImageData(result);
      }
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  }, [setImageData]);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClearImage = useCallback(() => {
    setImageData('');
    setError(null);
  }, [setImageData]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Image Upload - Requirements 3.1, 3.2 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Watermark Image
        </label>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/*"
          onChange={handleImageUpload}
          className="hidden"
          aria-label="Upload watermark image"
        />

        {imageConfig.imageData ? (
          <div className="space-y-2">
            {/* Image Preview */}
            <div className="relative inline-block">
              <div className="w-24 h-24 border border-gray-300 rounded-lg overflow-hidden bg-gray-100 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTVlN2ViIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlNWU3ZWIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]">
                <img
                  src={imageConfig.imageData}
                  alt="Watermark preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Remove watermark image"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <button
              type="button"
              onClick={handleBrowseClick}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Change image
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleBrowseClick}
            className="w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <div className="flex flex-col items-center text-gray-500">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Upload Image</span>
              <span className="text-xs mt-1">PNG recommended for transparency</span>
            </div>
          </button>
        )}

        {error && (
          <p className="mt-1 text-sm text-amber-600">{error}</p>
        )}
      </div>

      {/* Scale Slider - Requirement 3.3 */}
      <div>
        <label htmlFor="image-scale" className="block text-sm font-medium text-gray-700 mb-1">
          Scale: {Math.round(imageConfig.scale * 100)}%
        </label>
        <input
          id="image-scale"
          type="range"
          min="10"
          max="200"
          value={imageConfig.scale * 100}
          onChange={(e) => setImageScale(Number(e.target.value) / 100)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10%</span>
          <span>200%</span>
        </div>
      </div>

      {/* Opacity Slider - Requirement 3.4 */}
      <div>
        <label htmlFor="image-opacity" className="block text-sm font-medium text-gray-700 mb-1">
          Opacity: {imageConfig.opacity}%
        </label>
        <input
          id="image-opacity"
          type="range"
          min="0"
          max="100"
          value={imageConfig.opacity}
          onChange={(e) => setImageOpacity(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Tile Toggle and Settings - Requirement 3.5 */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <label htmlFor="tile-enabled" className="text-sm font-medium text-gray-700">
            Tile Watermark
          </label>
          <button
            id="tile-enabled"
            type="button"
            role="switch"
            aria-checked={imageConfig.tileEnabled}
            onClick={() => setTileEnabled(!imageConfig.tileEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              imageConfig.tileEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                imageConfig.tileEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {imageConfig.tileEnabled && (
          <div className="space-y-3 pl-2 border-l-2 border-blue-200">
            {/* Horizontal Spacing */}
            <div>
              <label htmlFor="tile-spacing-x" className="block text-sm font-medium text-gray-600 mb-1">
                Horizontal Spacing: {imageConfig.tileSpacingX}px
              </label>
              <input
                id="tile-spacing-x"
                type="range"
                min="0"
                max="200"
                value={imageConfig.tileSpacingX}
                onChange={(e) => setTileSpacing(Number(e.target.value), imageConfig.tileSpacingY)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0px</span>
                <span>200px</span>
              </div>
            </div>

            {/* Vertical Spacing */}
            <div>
              <label htmlFor="tile-spacing-y" className="block text-sm font-medium text-gray-600 mb-1">
                Vertical Spacing: {imageConfig.tileSpacingY}px
              </label>
              <input
                id="tile-spacing-y"
                type="range"
                min="0"
                max="200"
                value={imageConfig.tileSpacingY}
                onChange={(e) => setTileSpacing(imageConfig.tileSpacingX, Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0px</span>
                <span>200px</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageWatermarkPanel;
