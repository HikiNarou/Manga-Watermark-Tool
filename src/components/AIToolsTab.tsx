/**
 * AI Tools Tab Component
 * Container component that composes all AI editing features
 * Requirements: All AI-related requirements
 */

import { useState, useCallback } from 'react';
import { APIKeyPanel } from './APIKeyPanel';
import { MaskCanvas } from './MaskCanvas';
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
  const [maskEnabled, setMaskEnabled] = useState(false);
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleKeyValidated = useCallback((isValid: boolean) => {
    setApiKeyValid(isValid);
  }, []);

  const handleMaskChange = useCallback((mask: string | null) => {
    setMaskDataUrl(mask);
  }, []);

  const handleImageEdited = useCallback((newImageDataUrl: string) => {
    onImageEdited(newImageDataUrl);
    // Clear mask after applying edit
    setMaskDataUrl(null);
    setMaskEnabled(false);
  }, [onImageEdited]);

  const handleProcessingChange = useCallback((processing: boolean) => {
    setIsProcessing(processing);
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span>🎨</span>
              Mask Tools
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={maskEnabled}
                onChange={(e) => setMaskEnabled(e.target.checked)}
                disabled={isProcessing}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Enable</span>
            </label>
          </div>
          
          {maskEnabled && (
            <MaskCanvas
              imageDataUrl={selectedImageDataUrl}
              width={selectedImageWidth}
              height={selectedImageHeight}
              enabled={maskEnabled && !isProcessing}
              onMaskChange={handleMaskChange}
            />
          )}
          
          {!maskEnabled && (
            <p className="text-sm text-gray-500">
              Enable mask tools to mark specific areas for AI editing.
              This is required for Inpaint mode and optional for other modes.
            </p>
          )}
        </div>
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
