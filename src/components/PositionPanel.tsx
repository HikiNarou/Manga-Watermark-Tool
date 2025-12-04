/**
 * PositionPanel Component
 * Configuration panel for watermark positioning
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import React, { useCallback } from 'react';
import { useWatermarkSettings } from '@/hooks';
import type { PresetPosition } from '@/types';

export interface PositionPanelProps {
  className?: string;
}

// Position grid layout mapping
const POSITION_GRID: PresetPosition[][] = [
  ['top-left', 'top-center', 'top-right'],
  ['middle-left', 'center', 'middle-right'],
  ['bottom-left', 'bottom-center', 'bottom-right'],
];

// Position labels for accessibility
const POSITION_LABELS: Record<PresetPosition, string> = {
  'top-left': 'Top Left',
  'top-center': 'Top Center',
  'top-right': 'Top Right',
  'middle-left': 'Middle Left',
  'center': 'Center',
  'middle-right': 'Middle Right',
  'bottom-left': 'Bottom Left',
  'bottom-center': 'Bottom Center',
  'bottom-right': 'Bottom Right',
};

export function PositionPanel({ className = '' }: PositionPanelProps) {
  const {
    position,
    setPresetPosition,
    setOffset,
    setRotation,
    setMargins,
  } = useWatermarkSettings();

  // Handle offset changes
  const handleOffsetXChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    setOffset(value, position.offsetY);
  }, [position.offsetY, setOffset]);

  const handleOffsetYChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    setOffset(position.offsetX, value);
  }, [position.offsetX, setOffset]);

  // Handle margin changes
  const handleMarginChange = useCallback((side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
    setMargins({ [side]: value });
  }, [setMargins]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 9-Position Grid Selector - Requirement 4.1 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Position
        </label>
        <div className="inline-grid grid-cols-3 gap-1 p-2 bg-gray-100 rounded-lg">
          {POSITION_GRID.map((row) => (
            row.map((pos) => {
              const isSelected = position.presetPosition === pos;
              return (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPresetPosition(pos)}
                  className={`w-10 h-10 rounded transition-all ${
                    isSelected
                      ? 'bg-blue-600 shadow-md'
                      : 'bg-white hover:bg-gray-50 border border-gray-200'
                  }`}
                  aria-label={POSITION_LABELS[pos]}
                  aria-pressed={isSelected}
                  title={POSITION_LABELS[pos]}
                >
                  <span
                    className={`block w-2 h-2 rounded-full mx-auto ${
                      isSelected ? 'bg-white' : 'bg-gray-400'
                    }`}
                  />
                </button>
              );
            })
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {position.presetPosition === 'custom' 
            ? 'Custom position' 
            : POSITION_LABELS[position.presetPosition as PresetPosition]}
        </p>
      </div>

      {/* X/Y Offset Inputs - Requirements 4.2, 4.3 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Offset
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="offset-x" className="block text-xs text-gray-500 mb-1">
              X Offset (px)
            </label>
            <input
              id="offset-x"
              type="number"
              value={position.offsetX}
              onChange={handleOffsetXChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div>
            <label htmlFor="offset-y" className="block text-xs text-gray-500 mb-1">
              Y Offset (px)
            </label>
            <input
              id="offset-y"
              type="number"
              value={position.offsetY}
              onChange={handleOffsetYChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Rotation Slider - Requirement 4.4 */}
      <div>
        <label htmlFor="rotation" className="block text-sm font-medium text-gray-700 mb-1">
          Rotation: {position.rotation}°
        </label>
        <input
          id="rotation"
          type="range"
          min="0"
          max="360"
          value={position.rotation}
          onChange={(e) => setRotation(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0°</span>
          <span>180°</span>
          <span>360°</span>
        </div>
      </div>

      {/* Margin Inputs - Requirement 4.5 */}
      <div className="border-t border-gray-200 pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Margins
        </label>
        
        {/* Visual margin editor */}
        <div className="relative w-full max-w-[200px] mx-auto">
          {/* Top margin */}
          <div className="flex justify-center mb-1">
            <input
              type="number"
              min="0"
              value={position.marginTop}
              onChange={(e) => handleMarginChange('top', Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-16 px-2 py-1 text-center text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="Top margin"
            />
          </div>
          
          <div className="flex items-center justify-center gap-1">
            {/* Left margin */}
            <input
              type="number"
              min="0"
              value={position.marginLeft}
              onChange={(e) => handleMarginChange('left', Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-16 px-2 py-1 text-center text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="Left margin"
            />
            
            {/* Center box representing content */}
            <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500">px</span>
            </div>
            
            {/* Right margin */}
            <input
              type="number"
              min="0"
              value={position.marginRight}
              onChange={(e) => handleMarginChange('right', Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-16 px-2 py-1 text-center text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="Right margin"
            />
          </div>
          
          {/* Bottom margin */}
          <div className="flex justify-center mt-1">
            <input
              type="number"
              min="0"
              value={position.marginBottom}
              onChange={(e) => handleMarginChange('bottom', Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-16 px-2 py-1 text-center text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="Bottom margin"
            />
          </div>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-2">
          Distance from image edges
        </p>
      </div>
    </div>
  );
}

export default PositionPanel;
