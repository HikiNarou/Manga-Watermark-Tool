/**
 * AI Editor Panel Component
 * Main panel for AI image editing operations
 * Requirements: 3.1-3.7, 4.1-4.6, 5.1-5.6, 6.1-6.7, 7.1-7.7
 */

import { useState, useCallback } from 'react';
import { GeminiService } from '@/services/GeminiService';
import {
  type AIEditMode,
  type EnhanceType,
  type EnhanceOptions,
  type RemoveBgOptions,
  type BackgroundReplacement,
  AI_MODE_LABELS,
  ENHANCE_TYPE_LABELS,
} from '@/types';

interface AIEditorPanelProps {
  imageDataUrl: string | null;
  maskDataUrl: string | null;
  apiKey: string;
  onImageEdited: (newImageDataUrl: string) => void;
  onProcessingChange: (isProcessing: boolean) => void;
}

interface AIResult {
  originalUrl: string;
  editedUrl: string;
  mode: AIEditMode;
}

export function AIEditorPanel({
  imageDataUrl,
  maskDataUrl,
  apiKey,
  onImageEdited,
  onProcessingChange,
}: AIEditorPanelProps) {
  const [currentMode, setCurrentMode] = useState<AIEditMode>('enhance');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);
  
  // Enhancement options
  const [enhanceType, setEnhanceType] = useState<EnhanceType>('auto');
  
  // Background removal options
  const [bgReplacement, setBgReplacement] = useState<BackgroundReplacement>('transparent');
  const [bgColor, setBgColor] = useState('#ffffff');
  
  // Prompt for AI edit
  const [prompt, setPrompt] = useState('');

  const handleProcess = useCallback(async () => {
    if (!imageDataUrl || !apiKey) return;
    
    // Validate requirements
    if (currentMode === 'inpaint' && !maskDataUrl) {
      setError('Please draw a mask on the image first');
      return;
    }
    
    if (currentMode === 'prompt-edit' && !prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);
    onProcessingChange(true);

    try {
      const service = new GeminiService(apiKey);
      
      const enhanceOptions: EnhanceOptions = {
        type: enhanceType,
      };
      
      const removeBgOptions: RemoveBgOptions = bgReplacement === 'color'
        ? { replaceWith: bgReplacement, backgroundColor: bgColor }
        : { replaceWith: bgReplacement };

      const options: {
        maskDataUrl?: string;
        prompt?: string;
        enhanceOptions?: EnhanceOptions;
        removeBgOptions?: RemoveBgOptions;
      } = {
        enhanceOptions,
        removeBgOptions,
      };
      
      if (maskDataUrl) {
        options.maskDataUrl = maskDataUrl;
      }
      
      const trimmedPrompt = prompt.trim();
      if (trimmedPrompt) {
        options.prompt = trimmedPrompt;
      }

      const editedImageUrl = await service.edit(currentMode, imageDataUrl, options);

      setResult({
        originalUrl: imageDataUrl,
        editedUrl: editedImageUrl,
        mode: currentMode,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI processing failed';
      setError(message);
    } finally {
      setIsProcessing(false);
      onProcessingChange(false);
    }
  }, [
    imageDataUrl,
    maskDataUrl,
    apiKey,
    currentMode,
    enhanceType,
    bgReplacement,
    bgColor,
    prompt,
    onProcessingChange,
  ]);

  const handleApply = useCallback(() => {
    if (result?.editedUrl) {
      onImageEdited(result.editedUrl);
      setResult(null);
    }
  }, [result, onImageEdited]);

  const handleDiscard = useCallback(() => {
    setResult(null);
  }, []);

  const handleRegenerate = useCallback(() => {
    handleProcess();
  }, [handleProcess]);

  const modes: AIEditMode[] = ['enhance', 'remove-bg', 'inpaint', 'prompt-edit'];

  const enhanceTypes: EnhanceType[] = ['auto', 'upscale', 'denoise', 'sharpen'];

  const bgOptions: { value: BackgroundReplacement; label: string }[] = [
    { value: 'transparent', label: 'Transparent' },
    { value: 'color', label: 'Solid Color' },
  ];

  const examplePrompts = [
    'Remove the text in the marked area',
    'Make the background darker',
    'Add more detail to the hair',
    'Clean up the line art',
    'Remove noise and artifacts',
  ];

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Edit Mode
        </label>
        <div className="grid grid-cols-2 gap-1">
          {modes.map((mode) => (
            <button
              key={mode}
              onClick={() => setCurrentMode(mode)}
              disabled={isProcessing}
              className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                currentMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {AI_MODE_LABELS[mode]}
            </button>
          ))}
        </div>
      </div>

      {/* Mode-specific Options */}
      {currentMode === 'enhance' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enhancement Type
          </label>
          <div className="grid grid-cols-2 gap-1">
            {enhanceTypes.map((type) => (
              <button
                key={type}
                onClick={() => setEnhanceType(type)}
                disabled={isProcessing}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  enhanceType === type
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {ENHANCE_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentMode === 'remove-bg' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Replace Background With
            </label>
            <div className="flex gap-2">
              {bgOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBgReplacement(opt.value)}
                  disabled={isProcessing}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    bgReplacement === opt.value
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
          {bgReplacement === 'color' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Color:</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                disabled={isProcessing}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-500">{bgColor}</span>
            </div>
          )}
        </div>
      )}

      {currentMode === 'inpaint' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Draw a mask on the image to mark areas you want to remove/fill.
          </p>
          {!maskDataUrl && (
            <p className="text-sm text-amber-600">
              ⚠️ No mask drawn. Please use the mask tools above.
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Instructions (optional)
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Fill with manga screentone"
              disabled={isProcessing}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {currentMode === 'prompt-edit' && (
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Edit Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to change..."
              disabled={isProcessing}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Examples:</p>
            <div className="flex flex-wrap gap-1">
              {examplePrompts.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(ex)}
                  disabled={isProcessing}
                  className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
          
          {maskDataUrl && (
            <p className="text-sm text-green-600">
              ✓ Mask detected. Edit will be applied to masked area only.
            </p>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Process Button */}
      {!result && (
        <button
          onClick={handleProcess}
          disabled={isProcessing || !imageDataUrl || !apiKey}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing with AI...
            </span>
          ) : (
            '🚀 Process with AI'
          )}
        </button>
      )}

      {/* Result Preview */}
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Original</p>
              <img
                src={result.originalUrl}
                alt="Original"
                className="w-full h-auto border border-gray-200 rounded"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Result</p>
              <img
                src={result.editedUrl}
                alt="Result"
                className="w-full h-auto border border-gray-200 rounded"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              ✓ Apply
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isProcessing}
              className="px-3 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 disabled:opacity-50 transition-colors"
            >
              🔄
            </button>
            <button
              onClick={handleDiscard}
              className="px-3 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
            >
              ✗
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!imageDataUrl && (
        <p className="text-sm text-gray-500 text-center">
          Select an image to start AI editing
        </p>
      )}
      
      {!apiKey && (
        <p className="text-sm text-amber-600 text-center">
          Please enter your API key above to use AI features
        </p>
      )}
    </div>
  );
}
