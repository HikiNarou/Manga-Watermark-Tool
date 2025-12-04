/**
 * Main Application Component
 * Assembles all components with proper layout
 * Requirements: All
 */

import { useState, useCallback, useEffect } from 'react';
import { AppProvider } from '@/context';
import {
  ImageUploader,
  ImageList,
  TextWatermarkPanel,
  ImageWatermarkPanel,
  PositionPanel,
  PreviewCanvas,
  PresetPanel,
  ExportPanel,
  CropPanel,
  CompressionPresetPanel,
  BatchRenamePanel,
} from '@/components';
import {
  type PresetName,
  type CompressionPreset,
  type RenamePattern,
  createDefaultRenamePattern,
} from '@/types';
import { useImages, useWatermarkSettings, usePresets } from '@/hooks';

type WatermarkTab = 'text' | 'image';
type SidebarTab = 'watermark' | 'presets' | 'export' | 'tools';

function AppContent() {
  const {
    images,
    selectedImageId,
    loadFromFiles,
    selectImage,
    removeImage,
    clearImages,
  } = useImages();
  const { isTextWatermark, switchToText, switchToImage } = useWatermarkSettings();
  // usePresets hook handles loading presets from localStorage on mount
  usePresets();

  // Local UI state
  const [uploadProgress, setUploadProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [watermarkTab, setWatermarkTab] = useState<WatermarkTab>(isTextWatermark ? 'text' : 'image');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('watermark');
  
  // New features state
  const [selectedPreset, setSelectedPreset] = useState<PresetName>('custom');
  const [renameEnabled, setRenameEnabled] = useState(false);
  const [renamePattern, setRenamePattern] = useState<RenamePattern>(createDefaultRenamePattern());

  // Sync watermark tab with actual config type
  useEffect(() => {
    setWatermarkTab(isTextWatermark ? 'text' : 'image');
  }, [isTextWatermark]);

  // Handle watermark type switch
  const handleWatermarkTabChange = useCallback((tab: WatermarkTab) => {
    setWatermarkTab(tab);
    if (tab === 'text') {
      switchToText();
    } else {
      switchToImage();
    }
  }, [switchToText, switchToImage]);

  // Handle file upload
  const handleFilesSelected = useCallback(async (files: File[]) => {
    setIsLoading(true);
    setUploadProgress({ loaded: 0, total: files.length });

    try {
      await loadFromFiles(files, (loaded, total) => {
        setUploadProgress({ loaded, total });
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
    }
  }, [loadFromFiles]);

  // Preset persistence is handled by usePresets hook - Requirement 5.5
  // The hook loads presets from localStorage on mount and saves on changes

  // Handle compression preset change
  const handlePresetChange = useCallback((preset: PresetName) => {
    setSelectedPreset(preset);
  }, []);

  // Handle compression preset apply
  const handlePresetApply = useCallback((_preset: CompressionPreset) => {
    // Settings will be applied during export
  }, []);

  // Handle crop applied
  const handleCropApplied = useCallback((croppedDataUrl: string, newWidth: number, newHeight: number) => {
    // TODO: Update the selected image with cropped data
    console.log('Crop applied:', { newWidth, newHeight, dataUrlLength: croppedDataUrl.length });
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h1 className="text-xl font-bold text-gray-900">Manga Watermark Tool</h1>
          </div>
          <div className="flex items-center gap-2">
            {images.length > 0 && (
              <span className="text-sm text-gray-500">
                {images.length} image{images.length !== 1 ? 's' : ''} loaded
              </span>
            )}
            {images.length > 0 && (
              <button
                onClick={clearImages}
                className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Image Management */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Upload Images</h2>
            <ImageUploader
              onFilesSelected={handleFilesSelected}
              isLoading={isLoading}
              progress={uploadProgress}
            />
          </div>

          {images.length > 0 && (
            <div className="flex-1 overflow-y-auto p-4">
              <ImageList
                images={images}
                selectedImageId={selectedImageId}
                onSelectImage={selectImage}
                onRemoveImage={removeImage}
              />
            </div>
          )}

          {images.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-sm text-gray-400 text-center">
                Upload images to get started
              </p>
            </div>
          )}
        </aside>

        {/* Main Preview Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <PreviewCanvas className="flex-1 m-4" />
        </main>

        {/* Right Sidebar - Configuration Panels */}
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSidebarTab('watermark')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                sidebarTab === 'watermark'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Watermark
            </button>
            <button
              onClick={() => setSidebarTab('presets')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                sidebarTab === 'presets'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Presets
            </button>
            <button
              onClick={() => setSidebarTab('tools')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                sidebarTab === 'tools'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Tools
            </button>
            <button
              onClick={() => setSidebarTab('export')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                sidebarTab === 'export'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Export
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Watermark Configuration Tab */}
            {sidebarTab === 'watermark' && (
              <div className="p-4">
                {/* Watermark Type Tabs */}
                <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleWatermarkTabChange('text')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      watermarkTab === 'text'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => handleWatermarkTabChange('image')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      watermarkTab === 'image'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Image
                  </button>
                </div>

                {/* Watermark Config Panel */}
                {watermarkTab === 'text' ? (
                  <TextWatermarkPanel />
                ) : (
                  <ImageWatermarkPanel />
                )}

                {/* Position Panel */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Position</h3>
                  <PositionPanel />
                </div>
              </div>
            )}

            {/* Presets Tab */}
            {sidebarTab === 'presets' && (
              <div className="p-4">
                <PresetPanel />
              </div>
            )}

            {/* Tools Tab - New Features */}
            {sidebarTab === 'tools' && (
              <div className="p-4 space-y-6">
                {/* Image Cropping */}
                <div className="pb-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Image Cropping</h3>
                  <CropPanel onCropApplied={handleCropApplied} />
                </div>

                {/* Compression Presets */}
                <div className="pb-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Compression Presets</h3>
                  <CompressionPresetPanel
                    selectedPreset={selectedPreset}
                    onPresetChange={handlePresetChange}
                    onSettingsApply={handlePresetApply}
                  />
                </div>

                {/* Batch Rename */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Batch Rename</h3>
                  <BatchRenamePanel
                    enabled={renameEnabled}
                    onEnabledChange={setRenameEnabled}
                    pattern={renamePattern}
                    onPatternChange={setRenamePattern}
                  />
                </div>
              </div>
            )}

            {/* Export Tab */}
            {sidebarTab === 'export' && (
              <div className="p-4">
                <ExportPanel />
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
