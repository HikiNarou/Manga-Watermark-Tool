/**
 * TextWatermarkPanel Component
 * Configuration panel for text watermark settings
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

import { useWatermarkSettings } from '@/hooks';
import { FONT_FAMILIES, type TextWatermarkConfig } from '@/types';

export interface TextWatermarkPanelProps {
  className?: string;
}

export function TextWatermarkPanel({ className = '' }: TextWatermarkPanelProps) {
  const {
    config,
    isTextWatermark,
    setText,
    setFontFamily,
    setFontSize,
    setFontWeight,
    setTextColor,
    setTextOpacity,
    setOutlineEnabled,
    setOutlineColor,
    setOutlineWidth,
  } = useWatermarkSettings();

  // Only render if we have a text watermark config
  if (!isTextWatermark) {
    return null;
  }

  const textConfig = config as TextWatermarkConfig;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Text Input - Requirement 2.1 */}
      <div>
        <label htmlFor="watermark-text" className="block text-sm font-medium text-gray-700 mb-1">
          Watermark Text
        </label>
        <input
          id="watermark-text"
          type="text"
          value={textConfig.text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter watermark text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      {/* Font Family Selector - Requirement 2.2 */}
      <div>
        <label htmlFor="font-family" className="block text-sm font-medium text-gray-700 mb-1">
          Font Family
        </label>
        <select
          id="font-family"
          value={textConfig.fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size Slider - Requirement 2.3 */}
      <div>
        <label htmlFor="font-size" className="block text-sm font-medium text-gray-700 mb-1">
          Font Size: {textConfig.fontSize}px
        </label>
        <input
          id="font-size"
          type="range"
          min="8"
          max="200"
          value={textConfig.fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>8px</span>
          <span>200px</span>
        </div>
      </div>

      {/* Font Weight Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Font Weight
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFontWeight('normal')}
            className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
              textConfig.fontWeight === 'normal'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => setFontWeight('bold')}
            className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
              textConfig.fontWeight === 'bold'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Bold
          </button>
        </div>
      </div>

      {/* Color Picker - Requirement 2.4 */}
      <div>
        <label htmlFor="text-color" className="block text-sm font-medium text-gray-700 mb-1">
          Text Color
        </label>
        <div className="flex items-center gap-2">
          <input
            id="text-color"
            type="color"
            value={textConfig.color}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={textConfig.color}
            onChange={(e) => setTextColor(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Opacity Slider - Requirement 2.6 */}
      <div>
        <label htmlFor="text-opacity" className="block text-sm font-medium text-gray-700 mb-1">
          Opacity: {textConfig.opacity}%
        </label>
        <input
          id="text-opacity"
          type="range"
          min="0"
          max="100"
          value={textConfig.opacity}
          onChange={(e) => setTextOpacity(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Outline Toggle and Settings - Requirement 2.5 */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <label htmlFor="outline-enabled" className="text-sm font-medium text-gray-700">
            Text Outline
          </label>
          <button
            id="outline-enabled"
            type="button"
            role="switch"
            aria-checked={textConfig.outlineEnabled}
            onClick={() => setOutlineEnabled(!textConfig.outlineEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              textConfig.outlineEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                textConfig.outlineEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {textConfig.outlineEnabled && (
          <div className="space-y-3 pl-2 border-l-2 border-blue-200">
            {/* Outline Color */}
            <div>
              <label htmlFor="outline-color" className="block text-sm font-medium text-gray-600 mb-1">
                Outline Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="outline-color"
                  type="color"
                  value={textConfig.outlineColor}
                  onChange={(e) => setOutlineColor(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={textConfig.outlineColor}
                  onChange={(e) => setOutlineColor(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Outline Width */}
            <div>
              <label htmlFor="outline-width" className="block text-sm font-medium text-gray-600 mb-1">
                Outline Width: {textConfig.outlineWidth}px
              </label>
              <input
                id="outline-width"
                type="range"
                min="1"
                max="20"
                value={textConfig.outlineWidth}
                onChange={(e) => setOutlineWidth(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1px</span>
                <span>20px</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TextWatermarkPanel;
