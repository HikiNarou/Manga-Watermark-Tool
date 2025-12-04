/**
 * AI Tools Tab Component
 * Container component that composes all AI editing features
 * Requirements: All AI-related requirements
 */

import { useState, useCallback } from 'react';
import { APIKeyPanel } from './APIKeyPanel';
import { MaskEditorModal } from './MaskEditorModal';
import { AIEditorPanel } from './AIEditorPanel';
import { APIKeyManager } from '@/services/APIKeyManager';

interface AIToolsTabProps {
  selectedImageDataUrl: string | null;
  selectedImageWidth: number;
  selectedImageHeight: number;
  onImageEdited: (newImageDataUrl: string) => void;
}

export function AIToolsTab({
  selectedImageDataUrl,
  selectedImageWidth,
  selectedImageHeight,
  onImageEdited,
}: AIToolsTabProps) {
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const [maskEditorOpen, setMaskEditorOpen] = useState(false);
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleKeyValidated = useCallback((isValid: boolean) => {
    setApiKeyValid(isValid);
  }, []);

  const handleMaskSave = useCallback((mask: string | null) => {
    setMaskDataUrl(mask);
  }, []);

  const handleImageEdited = useCallback((newImageDataUrl: string) => {
    onImageEdited(newImageDataUrl);
    // Clear mask after applying edit
    setMaskDataUrl(null);
  }, [onImageEdited]);

  const handleProcessingChange = useCallback((processing: boolean) => {
    setIsProcessing(processing);
  }, []);

  const handleOpenMaskEditor = useCallback(() => {
    setMaskEditorOpen(true);
  }, []);

  const handleCloseMaskEditor = useCallback(() => {
    setMaskEditorOpen(false);
  }, []);

  const handleClearMask = useCallback(() => {
    setMaskDataUrl(null);
  }, []);

  const getApiKey = (): string => {
    return APIKeyManager.retrieve() || '';
  };

  return (
    <div className="space-y-6">
      {/* API Key Section */}
      <div className="pb-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>🔑</span>
          API Configuration
        </h3>
        <APIKeyPanel onKeyValidated={handleKeyValidated} />
      </div>

      {/* Mask Tools Section */}
      {apiKeyValid && selectedImageDataUrl && (
        <div className="pb-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>🎨</span>
            Mask Tools
          </h3>
          
          {/* Mask Status & Actions */}
          <div className="space-y-3">
            {maskDataUrl ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm text-green-700 font-medium">Mask Ready</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleOpenMaskEditor}
                      disabled={isProcessing}
                      className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={handleClearMask}
                      disabled={isProcessing}
                      className="px-3 py-1.5 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50 transition-colors"
                    >
                      🗑️ Clear
                    </button>
                  </div>
                </div>
                {/* Mask Preview */}
                <div className="mt-2 relative w-full h-20 bg-gray-100 rounded overflow-hidden">
                  <img
                    src={selectedImageDataUrl}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-contain opacity-50"
                  />
                  <img
                    src={maskDataUrl}
                    alt="Mask"
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">
                  Draw a mask to mark specific areas for AI editing.
                  Required for Inpaint mode.
                </p>
                <button
                  onClick={handleOpenMaskEditor}
                  disabled={isProcessing}
                  className="w-full px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <span>🎨</span>
                  Open Mask Editor
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mask Editor Modal */}
      {selectedImageDataUrl && (
        <MaskEditorModal
          isOpen={maskEditorOpen}
          imageDataUrl={selectedImageDataUrl}
          imageWidth={selectedImageWidth}
          imageHeight={selectedImageHeight}
          initialMaskDataUrl={maskDataUrl}
          onSave={handleMaskSave}
          onClose={handleCloseMaskEditor}
        />
      )}

      {/* AI Editor Section */}
      {apiKeyValid && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>🤖</span>
            AI Editor
          </h3>
          <AIEditorPanel
            imageDataUrl={selectedImageDataUrl}
            maskDataUrl={maskDataUrl}
            apiKey={getApiKey()}
            onImageEdited={handleImageEdited}
            onProcessingChange={handleProcessingChange}
          />
        </div>
      )}

      {/* Not Connected State */}
      {!apiKeyValid && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🔐</div>
          <p className="text-sm text-gray-600 mb-2">
            Enter your Gemini API key above to unlock AI features
          </p>
          <p className="text-xs text-gray-400">
            Your API key is stored locally and never sent to our servers
          </p>
        </div>
      )}

      {/* No Image Selected State */}
      {apiKeyValid && !selectedImageDataUrl && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🖼️</div>
          <p className="text-sm text-gray-600">
            Select an image from the left panel to start AI editing
          </p>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-4">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-blue-600 animate-spin mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Processing with AI
              </h3>
              <p className="text-sm text-gray-600 text-center">
                This may take a few seconds. Please wait...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
