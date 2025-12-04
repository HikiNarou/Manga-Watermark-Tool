/**
 * Mask Editor Modal Component
 * Fullscreen modal for drawing masks on images with better UX
 * Requirements: 2.1-2.9
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { MaskProcessor } from '@/services/MaskProcessor';
import {
  type MaskToolType,
  MIN_BRUSH_SIZE,
  MAX_BRUSH_SIZE,
  MASK_TOOL_LABELS,
} from '@/types';

interface MaskEditorModalProps {
  isOpen: boolean;
  imageDataUrl: string;
  imageWidth: number;
  imageHeight: number;
  initialMaskDataUrl?: string | null;
  onSave: (maskDataUrl: string | null) => void;
  onClose: () => void;
}

export function MaskEditorModal({
  isOpen,
  imageDataUrl,
  imageWidth,
  imageHeight,
  initialMaskDataUrl,
  onSave,
  onClose,
}: MaskEditorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const processorRef = useRef<MaskProcessor | null>(null);
  
  const [currentTool, setCurrentTool] = useState<MaskToolType>('brush');
  const [brushSize, setBrushSize] = useState(30);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [hasMask, setHasMask] = useState(false);
  const [scale, setScale] = useState(1);
  
  // Rectangle drawing state
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null);
  const [isDrawingRect, setIsDrawingRect] = useState(false);

  // Calculate scale to fit image in viewport
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    
    const container = containerRef.current;
    const maxWidth = container.clientWidth - 48;
    const maxHeight = container.clientHeight - 48;
    
    const scaleX = maxWidth / imageWidth;
    const scaleY = maxHeight / imageHeight;
    const newScale = Math.min(scaleX, scaleY, 1);
    
    setScale(newScale);
  }, [isOpen, imageWidth, imageHeight]);


  // Initialize processor
  useEffect(() => {
    if (!isOpen || imageWidth <= 0 || imageHeight <= 0) return;
    
    processorRef.current = new MaskProcessor(imageWidth, imageHeight);
    updateState();
    
    return () => {
      processorRef.current = null;
    };
  }, [isOpen, imageWidth, imageHeight]);

  // Render mask to visible canvas
  const renderMask = useCallback(() => {
    const canvas = canvasRef.current;
    const processor = processorRef.current;
    if (!canvas || !processor) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, imageWidth, imageHeight);
    const maskCanvas = processor.getCanvas();
    ctx.drawImage(maskCanvas, 0, 0);
  }, [imageWidth, imageHeight]);

  // Update component state from processor
  const updateState = useCallback(() => {
    const processor = processorRef.current;
    if (!processor) return;

    setCanUndo(processor.canUndo());
    setCanRedo(processor.canRedo());
    setHasMask(processor.hasMask());
    renderMask();
  }, [renderMask]);

  // Get mouse position relative to canvas (accounting for scale)
  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = imageWidth / rect.width;
    const scaleY = imageHeight / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, [imageWidth, imageHeight]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
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
  }, [currentTool, brushSize, getMousePos]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const processor = processorRef.current;
    if (!processor) return;

    const pos = getMousePos(e);

    if (currentTool === 'rectangle' && isDrawingRect && rectStart) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      renderMask();
      
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(rectStart.x, rectStart.y, pos.x - rectStart.x, pos.y - rectStart.y);
      ctx.setLineDash([]);
    } else if (processor.isCurrentlyDrawing()) {
      processor.continueDraw(pos.x, pos.y);
      renderMask();
    }
  }, [currentTool, isDrawingRect, rectStart, getMousePos, renderMask]);

  // Handle mouse up
  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
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
  }, [currentTool, isDrawingRect, rectStart, getMousePos, updateState]);

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
    if (processorRef.current?.undo()) {
      updateState();
    }
  }, [updateState]);

  const handleRedo = useCallback(() => {
    if (processorRef.current?.redo()) {
      updateState();
    }
  }, [updateState]);

  const handleClear = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.clearWithHistory();
      updateState();
    }
  }, [updateState]);

  const handleSave = useCallback(() => {
    const processor = processorRef.current;
    if (processor && processor.hasMask()) {
      onSave(processor.exportBinaryMask());
    } else {
      onSave(null);
    }
    onClose();
  }, [onSave, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleUndo, handleRedo, handleCancel]);

  const toolButtons: { type: MaskToolType; icon: string; label: string }[] = [
    { type: 'brush', icon: '🖌️', label: 'Brush' },
    { type: 'rectangle', icon: '▢', label: 'Rectangle' },
    { type: 'lasso', icon: '✏️', label: 'Lasso' },
    { type: 'eraser', icon: '🧹', label: 'Eraser' },
  ];

  if (!isOpen) return null;

  const displayWidth = imageWidth * scale;
  const displayHeight = imageHeight * scale;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">🎨 Mask Editor</h2>
          <span className="text-sm text-gray-400">
            Draw on the image to mark areas for AI editing
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {hasMask ? '✓ Save Mask' : 'Close'}
          </button>
        </div>
      </div>


      {/* Toolbar */}
      <div className="flex-shrink-0 bg-gray-800 px-4 py-3 flex items-center gap-6 border-b border-gray-700">
        {/* Tool Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Tool:</span>
          <div className="flex gap-1">
            {toolButtons.map(({ type, icon, label }) => (
              <button
                key={type}
                onClick={() => setCurrentTool(type)}
                className={`px-3 py-2 text-sm rounded transition-colors flex items-center gap-1 ${
                  currentTool === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={MASK_TOOL_LABELS[type]}
              >
                <span>{icon}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Brush Size */}
        {(currentTool === 'brush' || currentTool === 'eraser') && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Size:</span>
            <input
              type="range"
              min={MIN_BRUSH_SIZE}
              max={MAX_BRUSH_SIZE}
              value={brushSize}
              onChange={(e) => {
                const size = parseInt(e.target.value, 10);
                setBrushSize(size);
                processorRef.current?.setBrushSize(size);
              }}
              className="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-white w-12">{brushSize}px</span>
          </div>
        )}

        {/* Divider */}
        <div className="w-px h-8 bg-gray-600" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="px-3 py-2 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)"
          >
            ↩️ Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="px-3 py-2 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Y)"
          >
            ↪️ Redo
          </button>
          <button
            onClick={handleClear}
            disabled={!hasMask}
            className="px-3 py-2 text-sm bg-red-600/80 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Clear All"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Status */}
        <div className="ml-auto">
          {hasMask ? (
            <span className="text-sm text-green-400">✓ Mask drawn</span>
          ) : (
            <span className="text-sm text-gray-400">No mask yet</span>
          )}
        </div>
      </div>


      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto flex items-center justify-center p-6 bg-gray-900"
      >
        <div 
          className="relative shadow-2xl"
          style={{ width: displayWidth, height: displayHeight }}
        >
          {/* Background Image */}
          <img
            src={imageDataUrl}
            alt="Source"
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />
          
          {/* Mask Canvas Overlay */}
          <canvas
            ref={canvasRef}
            width={imageWidth}
            height={imageHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            style={{ mixBlendMode: 'multiply' }}
          />
          
          {/* Border */}
          <div className="absolute inset-0 border-2 border-gray-600 pointer-events-none" />
        </div>
      </div>

      {/* Footer Help */}
      <div className="flex-shrink-0 bg-gray-800 px-4 py-2 text-center">
        <p className="text-xs text-gray-400">
          💡 Tip: Use <kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Ctrl+Z</kbd> to undo, 
          <kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300 ml-1">Ctrl+Y</kbd> to redo, 
          <kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300 ml-1">Esc</kbd> to cancel
        </p>
      </div>
    </div>
  );
}
