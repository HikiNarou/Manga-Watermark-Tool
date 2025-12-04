/**
 * CompressionPresetPanel Component
 * UI for selecting compression presets
 */

import { useCallback } from 'react';
import {
  type PresetName,
  type CompressionPreset,
  COMPRESSION_PRESETS,
  getAllPresets,
  estimateFileSize,
} from '@/types';
import { useImages } from '@/hooks';

export interface CompressionPresetPanelProps {
  selectedPreset: PresetName;
  onPresetChange: (preset: PresetName) => void;
  onSettingsApply: (preset: CompressionPreset) => void;
  className?: string;
}

export function CompressionPresetPanel({
  selectedPreset,
  onPresetChange,
  onSettingsApply,
  className = '',
}: CompressionPresetPanelProps) {
  const { selectedImage, images } = useImages();
  const presets = getAllPresets();
  const currentPreset = COMPRESSION_PRESETS[selectedPreset];

  // Calculate estimated file size
  const getEstimatedSize = useCallback(() => {
    if (!selectedImage) return null;
    
    const estimated = estimateFileSize(
      selectedImage.size,
      selectedImage.width,
      selectedImage.height,
      currentPreset
    );
    
    return formatBytes(estimated);
  }, [selectedImage, currentPreset]);

  // Calculate total estimated size for all images
  const getTotalEstimatedSize = useCallback(() => {
    if (images.length === 0) return null;
    
    let total = 0;
    for (const img of images) {
      total += estimateFileSize(img.size, img.width, img.height, currentPreset);
    }
    
    return formatBytes(total);
  }, [images, currentPreset]);

  const handlePresetSelect = useCallback((presetName: PresetName) => {
    onPresetChange(presetName);
    onSettingsApply(COMPRESSION_PRESETS[presetName]);
  }, [onPresetChange, onSettingsApply]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Compression Preset
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handlePresetSelect(preset.name)}
              className={`p-3 text-left rounded-lg border transition-all ${
                selectedPreset === preset.name
                  ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <PresetIcon preset={preset.name} />
                <span className="text-sm font-medium text-gray-800">
                  {preset.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Current Preset Details */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <h4 className="text-xs font-medium text-gray-600 mb-2">Preset Settings</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Format:</span>
            <span className="ml-1 font-medium text-gray-700 uppercase">
              {currentPreset.format}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Quality:</span>
            <span className="ml-1 font-medium text-gray-700">
              {currentPreset.quality}%
            </span>
          </div>
          <div>
            <span className="text-gray-500">Max Width:</span>
            <span className="ml-1 font-medium text-gray-700">
              {currentPreset.maxWidth ? `${currentPreset.maxWidth}px` : 'Original'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Max Height:</span>
            <span className="ml-1 font-medium text-gray-700">
              {currentPreset.maxHeight ? `${currentPreset.maxHeight}px` : 'Original'}
            </span>
          </div>
        </div>
      </div>

      {/* Estimated File Size */}
      {selectedImage && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="text-xs font-medium text-blue-700 mb-1">Estimated Output Size</h4>
          <div className="flex justify-between items-center">
            <span className="text-xs text-blue-600">Selected image:</span>
            <span className="text-sm font-medium text-blue-800">
              ~{getEstimatedSize()}
            </span>
          </div>
          {images.length > 1 && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-blue-600">All {images.length} images:</span>
              <span className="text-sm font-medium text-blue-800">
                ~{getTotalEstimatedSize()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Preset icon component
function PresetIcon({ preset }: { preset: PresetName }) {
  const iconClass = "w-4 h-4";
  
  switch (preset) {
    case 'web':
      return (
        <svg className={`${iconClass} text-blue-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
    case 'print':
      return (
        <svg className={`${iconClass} text-green-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      );
    case 'archive':
      return (
        <svg className={`${iconClass} text-purple-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      );
    case 'custom':
      return (
        <svg className={`${iconClass} text-gray-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
  }
}

// Format bytes to human readable
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default CompressionPresetPanel;
