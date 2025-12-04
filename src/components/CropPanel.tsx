/**
 * CropPanel Component
 * UI for image cropping controls
 */

import { useState, useCallback } from 'react';
import { useImages } from '@/hooks';
import { ASPECT_RATIOS, type AspectRatio, type CropRegion } from '@/types';
import {
  calculateRegionFromAspectRatio,
  applyCrop,
  validateCropRegion,
} from '@/services/ImageCropper';

export interface CropPanelProps {
  className?: string;
  onCropApplied?: (croppedDataUrl: string, newWidth: number, newHeight: number) => void;
}

export function CropPanel({ className = '', onCropApplied }: CropPanelProps) {
  const { selectedImage } = useImages();
  
  const [cropEnabled, setCropEnabled] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('free');
  const [cropRegion, setCropRegion] = useState<CropRegion | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize crop region when enabled
  const handleEnableCrop = useCallback(() => {
    if (!selectedImage) return;
    
    setCropEnabled(true);
    const region = calculateRegionFromAspectRatio(
      selectedImage.width,
      selectedImage.height,
      aspectRatio
    );
    setCropRegion(region);
    setError(null);
  }, [selectedImage, aspectRatio]);

  // Disable crop
  const handleDisableCrop = useCallback(() => {
    setCropEnabled(false);
    setCropRegion(null);
    setError(null);
  }, []);

  // Change aspect ratio
  const handleAspectRatioChange = useCallback((newRatio: AspectRatio) => {
    setAspectRatio(newRatio);
    
    if (cropEnabled && selectedImage) {
      const region = calculateRegionFromAspectRatio(
        selectedImage.width,
        selectedImage.height,
        newRatio
      );
      setCropRegion(region);
    }
  }, [cropEnabled, selectedImage]);

  // Update crop region manually
  const handleRegionChange = useCallback((field: keyof CropRegion, value: number) => {
    if (!cropRegion) return;
    
    setCropRegion({
      ...cropRegion,
      [field]: Math.max(0, value),
    });
  }, [cropRegion]);

  // Apply crop
  const handleApplyCrop = useCallback(async () => {
    if (!selectedImage || !cropRegion) return;
    
    // Validate
    const validation = validateCropRegion(cropRegion, selectedImage.width, selectedImage.height);
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }
    
    setIsApplying(true);
    setError(null);
    
    try {
      const croppedDataUrl = await applyCrop(selectedImage.dataUrl, cropRegion);
      onCropApplied?.(croppedDataUrl, cropRegion.width, cropRegion.height);
      handleDisableCrop();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply crop');
    } finally {
      setIsApplying(false);
    }
  }, [selectedImage, cropRegion, onCropApplied, handleDisableCrop]);

  if (!selectedImage) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Select an image to enable cropping
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Image Crop</span>
        <button
          type="button"
          onClick={cropEnabled ? handleDisableCrop : handleEnableCrop}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            cropEnabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              cropEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {cropEnabled && (
        <>
          {/* Aspect Ratio Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-1">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.value}
                  type="button"
                  onClick={() => handleAspectRatioChange(ar.value)}
                  className={`px-2 py-1.5 text-xs rounded transition-colors ${
                    aspectRatio === ar.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Crop Region Inputs */}
          {cropRegion && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Crop Region (px)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">X</label>
                  <input
                    type="number"
                    value={cropRegion.x}
                    onChange={(e) => handleRegionChange('x', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Y</label>
                  <input
                    type="number"
                    value={cropRegion.y}
                    onChange={(e) => handleRegionChange('y', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Width</label>
                  <input
                    type="number"
                    value={cropRegion.width}
                    onChange={(e) => handleRegionChange('width', parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Height</label>
                  <input
                    type="number"
                    value={cropRegion.height}
                    onChange={(e) => handleRegionChange('height', parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Preview info */}
              <p className="text-xs text-gray-500 mt-2">
                Original: {selectedImage.width} × {selectedImage.height} → 
                Cropped: {cropRegion.width} × {cropRegion.height}
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApplyCrop}
              disabled={isApplying || !cropRegion}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplying ? 'Applying...' : 'Apply Crop'}
            </button>
            <button
              type="button"
              onClick={handleDisableCrop}
              className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CropPanel;
