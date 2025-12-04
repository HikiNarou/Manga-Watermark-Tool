/**
 * BatchRenamePanel Component
 * UI for batch rename with pattern
 */

import { useState, useCallback, useMemo } from 'react';
import { useImages } from '@/hooks';
import {
  type RenamePattern,
  PATTERN_VARIABLES,
  createDefaultRenamePattern,
  previewFilenames,
  validatePattern,
  ensureUnique,
} from '@/types';

export interface BatchRenamePanelProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  pattern: RenamePattern;
  onPatternChange: (pattern: RenamePattern) => void;
  className?: string;
}

export function BatchRenamePanel({
  enabled,
  onEnabledChange,
  pattern,
  onPatternChange,
  className = '',
}: BatchRenamePanelProps) {
  const { images } = useImages();
  const [showVariables, setShowVariables] = useState(false);

  // Validate pattern
  const validation = useMemo(() => {
    return validatePattern(pattern.pattern);
  }, [pattern.pattern]);

  // Preview filenames
  const previewNames = useMemo(() => {
    if (!enabled || images.length === 0) return [];
    
    const originalNames = images.map(img => img.name);
    const generated = previewFilenames(pattern, originalNames);
    return ensureUnique(generated);
  }, [enabled, images, pattern]);

  // Handle pattern field changes
  const handlePatternChange = useCallback((field: keyof RenamePattern, value: string | number) => {
    onPatternChange({
      ...pattern,
      [field]: value,
    });
  }, [pattern, onPatternChange]);

  // Insert variable into pattern
  const insertVariable = useCallback((variable: string) => {
    const newPattern = pattern.pattern + variable;
    handlePatternChange('pattern', newPattern);
    setShowVariables(false);
  }, [pattern.pattern, handlePatternChange]);

  // Reset to default
  const handleReset = useCallback(() => {
    onPatternChange(createDefaultRenamePattern());
  }, [onPatternChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Batch Rename</span>
        <button
          type="button"
          onClick={() => onEnabledChange(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <>
          {/* Pattern Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Filename Pattern
              </label>
              <button
                type="button"
                onClick={() => setShowVariables(!showVariables)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {showVariables ? 'Hide' : 'Show'} Variables
              </button>
            </div>
            
            <input
              type="text"
              value={pattern.pattern}
              onChange={(e) => handlePatternChange('pattern', e.target.value)}
              placeholder="Chapter{chapter}_{page}"
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 ${
                validation.valid
                  ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  : 'border-red-300 focus:ring-red-500 focus:border-red-500'
              }`}
            />
            
            {!validation.valid && (
              <p className="text-xs text-red-600 mt-1">
                {validation.errors.join(', ')}
              </p>
            )}
          </div>

          {/* Variables Reference */}
          {showVariables && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-xs font-medium text-gray-600 mb-2">Available Variables</h4>
              <div className="space-y-1">
                {PATTERN_VARIABLES.map((v) => (
                  <button
                    key={v.variable}
                    type="button"
                    onClick={() => insertVariable(v.variable)}
                    className="flex items-center justify-between w-full px-2 py-1 text-xs rounded hover:bg-gray-100"
                  >
                    <code className="text-blue-600">{v.variable}</code>
                    <span className="text-gray-500">{v.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pattern Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Chapter</label>
              <input
                type="text"
                value={pattern.chapter}
                onChange={(e) => handlePatternChange('chapter', e.target.value)}
                placeholder="01"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Page</label>
              <input
                type="number"
                min="0"
                value={pattern.startPage}
                onChange={(e) => handlePatternChange('startPage', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Pad Length</label>
              <select
                value={pattern.padLength}
                onChange={(e) => handlePatternChange('padLength', parseInt(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={1}>1 (1, 2, 3)</option>
                <option value={2}>2 (01, 02, 03)</option>
                <option value={3}>3 (001, 002, 003)</option>
                <option value={4}>4 (0001, 0002, 0003)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleReset}
                className="w-full px-2 py-1.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Preview */}
          {previewNames.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-2">
                Preview ({Math.min(previewNames.length, 5)} of {previewNames.length})
              </h4>
              <div className="p-2 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                <ul className="space-y-1">
                  {previewNames.slice(0, 5).map((name, index) => (
                    <li key={index} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400">{index + 1}.</span>
                      <span className="text-gray-500 truncate max-w-[100px]">
                        {images[index]?.name}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-blue-600 font-medium truncate">
                        {name}
                      </span>
                    </li>
                  ))}
                  {previewNames.length > 5 && (
                    <li className="text-xs text-gray-400">
                      ... and {previewNames.length - 5} more
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BatchRenamePanel;
