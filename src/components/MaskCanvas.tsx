/**
 * Mask Canvas Component
 * Provides drawing tools for marking areas on images for AI editing
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { MaskProcessor } from '@/services/MaskProcessor';
import {
  type MaskToolType,
  MIN_BRUSH_SIZE,
  MAX_BRUSH_SIZE,
  MASK_TOOL_LABELS,
} from '@/types';

interface MaskCanvasProps {
  imageDataUrl: string;
  width: number;
  height: number;
  enabled: boolean;
  onMaskChange: (maskDataUrl: string | null) => void;
}

export function MaskCanvas({
  imageDataUrl,
  width,
  height,
  enabled,
  onMaskChange,
}: MaskCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processorRef = useRef<MaskProcessor | null>(null);
  
  const [currentTool, setCurrentTool] = useState<MaskToolType>('brush');
  const [brushSize, setBrushSize] = useState(25);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [hasMask, setHasMask] = useState(false);
  
  // Rectangle drawing state
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null);
  const [isDrawingRect, setIsDrawingRect] = useState(false);

  // Initialize processor
  useEffect(() => {
    if (width > 0 && height > 0) {
      processorRef.current = new MaskProcessor(width, height);
      updateState();
    }
    
    return () => {
      processorRef.current = null;
    };
  }, [width, height]);

  // Render mask to visible canvas
  const renderMask = useCallback(() => {
    const canvas = canvasRef.current;
    const processor = processorRef.current;
    if (!canvas || !processor) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw processor's mask
    const maskCanvas = processor.getCanvas();
    ctx.drawImage(maskCanvas, 0, 0);
  }, [width, height]);

  // Update component state from processor
  const updateState = useCallback(() => {
    const processor = processorRef.current;
    if (!processor) return;

    setCanUndo(processor.canUndo());
    setCanRedo(processor.canRedo());
    setHasMask(processor.hasMask());
    
    // Notify parent of mask change
    if (processor.hasMask()) {
      onMaskChange(processor.exportBinaryMask());
    } else {
      onMaskChange(null);
    }
    
    renderMask();
  }, [onMaskChange, renderMask]);

  // Get mouse position relative to canvas
  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, [width, height]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!enabled) return;
    
    const processor = processorRef.current;
    if (!processor) return;

    const pos = getMousePos(e);
    
    if (currentTool === 'rectangle') {
      setRectStart(pos);
      setIsDrawingRect(true);
    } else {
      processor.setTool({ type: currentTool, size: brushSize });
      processor.startDraw(pos.x, pos.y);
    }
  }, [enabled, currentTool, brushSize, getMousePos]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!enabled) return;
    
    const processor = processorRef.current;
    if (!processor) return;

    const pos = getMousePos(e);

    if (currentTool === 'rectangle' && isDrawingRect && rectStart) {
      // Preview rectangle
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Redraw mask
      renderMask();
      
      // Draw preview rectangle
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        rectStart.x,
        rectStart.y,
        pos.x - rectStart.x,
        pos.y - rectStart.y
      );
      ctx.setLineDash([]);
    } else if (processor.isCurrentlyDrawing()) {
      processor.continueDraw(pos.x, pos.y);
      renderMask();
    }
  }, [enabled, currentTool, isDrawingRect, rectStart, getMousePos, renderMask]);

  // Handle mouse up
  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!enabled) return;
    
    const processor = processorRef.current;
    if (!processor) return;

    if (currentTool === 'rectangle' && isDrawingRect && rectStart) {
      const pos = getMousePos(e);
      processor.drawRectangle(rectStart.x, rectStart.y, pos.x, pos.y);
      setRectStart(null);
      setIsDrawingRect(false);
    } else {
      processor.endDraw();
    }
    
    updateState();
  }, [enabled, currentTool, isDrawingRect, rectStart, getMousePos, updateState]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    const processor = processorRef.current;
    if (!processor) return;

    if (processor.isCurrentlyDrawing()) {
      processor.endDraw();
      updateState();
    }
    
    if (isDrawingRect) {
      setRectStart(null);
      setIsDrawingRect(false);
      renderMask();
    }
  }, [isDrawingRect, updateState, renderMask]);

  // Tool handlers
  const handleUndo = useCallback(() => {
    const processor = processorRef.current;
    if (processor?.undo()) {
      updateState();
    }
  }, [updateState]);

  const handleRedo = useCallback(() => {
    const processor = processorRef.current;
    if (processor?.redo()) {
      updateState();
    }
  }, [updateState]);

  const handleClear = useCallback(() => {
    const processor = processorRef.current;
    if (processor) {
      processor.clearWithHistory();
      updateState();
    }
  }, [updateState]);

  const handleBrushSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10);
    setBrushSize(size);
    
    const processor = processorRef.current;
    if (processor) {
      processor.setBrushSize(size);
    }
  }, []);

  const toolButtons: { type: MaskToolType; icon: string }[] = [
    { type: 'brush', icon: '🖌️' },
    { type: 'rectangle', icon: '▢' },
    { type: 'lasso', icon: '✏️' },
    { type: 'eraser', icon: '🧹' },
  ];

  if (!enabled) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Tool Selector */}
      <div className="flex flex-wrap gap-1">
        {toolButtons.map(({ type, icon }) => (
          <button
            key={type}
            onClick={() => setCurrentTool(type)}
            className={`px-2 py-1 text-sm rounded transition-colors ${
              currentTool === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={MASK_TOOL_LABELS[type]}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Brush Size Slider */}
      {(currentTool === 'brush' || currentTool === 'eraser') && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Size</span>
            <span>{brushSize}px</span>
          </div>
          <input
            type="range"
            min={MIN_BRUSH_SIZE}
            max={MAX_BRUSH_SIZE}
            value={brushSize}
            onChange={handleBrushSizeChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-1">
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          ↩️
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          ↪️
        </button>
        <button
          onClick={handleClear}
          disabled={!hasMask}
          className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Clear All"
        >
          🗑️
        </button>
      </div>

      {/* Canvas Container */}
      <div className="relative border border-gray-300 rounded overflow-hidden">
        {/* Background Image */}
        <img
          src={imageDataUrl}
          alt="Source"
          className="w-full h-auto"
          style={{ maxHeight: '300px', objectFit: 'contain' }}
        />
        
        {/* Mask Canvas Overlay */}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          style={{ 
            pointerEvents: enabled ? 'auto' : 'none',
            mixBlendMode: 'multiply',
          }}
        />
      </div>

      {/* Status */}
      <p className="text-xs text-gray-500">
        {hasMask 
          ? 'Mask drawn. Areas in red will be processed by AI.'
          : 'Draw on the image to mark areas for AI editing.'}
      </p>
    </div>
  );
}
