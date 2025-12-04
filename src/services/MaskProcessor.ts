/**
 * Mask Processor Service
 * Handles mask drawing, history management, and export for AI editing
 * Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9
 */

import {
  type MaskTool,
  type Point,
  MIN_BRUSH_SIZE,
  MAX_BRUSH_SIZE,
  MASK_COLOR,
} from '@/types';

/**
 * Clamp brush size to valid range
 * Requirements: 2.8
 */
export function clampBrushSize(size: number): number {
  return Math.max(MIN_BRUSH_SIZE, Math.min(MAX_BRUSH_SIZE, Math.round(size)));
}

/**
 * MaskProcessor - Handles all mask drawing operations
 */
export class MaskProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  
  // History for undo/redo
  private history: ImageData[] = [];
  private historyIndex: number = -1;
  private maxHistorySize: number = 50;
  
  // Current drawing state
  private isDrawing: boolean = false;
  private currentTool: MaskTool = { type: 'brush', size: 25 };
  private lastPoint: Point | null = null;
  
  // Lasso points for polygon drawing
  private lassoPoints: Point[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    
    // Create offscreen canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;
    
    // Initialize with transparent background
    this.clear();
    
    // Save initial state
    this.saveToHistory();
  }

  /**
   * Get canvas dimensions
   */
  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  /**
   * Set current tool
   */
  setTool(tool: MaskTool): void {
    this.currentTool = {
      type: tool.type,
      size: clampBrushSize(tool.size),
    };
  }

  /**
   * Get current tool
   */
  getTool(): MaskTool {
    return { ...this.currentTool };
  }

  /**
   * Set brush size with clamping
   * Requirements: 2.8
   */
  setBrushSize(size: number): void {
    this.currentTool.size = clampBrushSize(size);
  }

  /**
   * Get current brush size
   */
  getBrushSize(): number {
    return this.currentTool.size;
  }

  /**
   * Start drawing operation
   * Requirements: 2.2, 2.3, 2.4
   */
  startDraw(x: number, y: number): void {
    this.isDrawing = true;
    this.lastPoint = { x, y };
    
    if (this.currentTool.type === 'lasso') {
      this.lassoPoints = [{ x, y }];
    } else if (this.currentTool.type === 'brush' || this.currentTool.type === 'eraser') {
      this.drawPoint(x, y);
    }
  }

  /**
   * Continue drawing operation
   * Requirements: 2.2, 2.3, 2.4
   */
  continueDraw(x: number, y: number): void {
    if (!this.isDrawing) return;
    
    const currentPoint = { x, y };
    
    if (this.currentTool.type === 'lasso') {
      this.lassoPoints.push(currentPoint);
      this.drawLassoPreview();
    } else if (this.currentTool.type === 'brush' || this.currentTool.type === 'eraser') {
      if (this.lastPoint) {
        this.drawLine(this.lastPoint, currentPoint);
      }
    }
    
    this.lastPoint = currentPoint;
  }

  /**
   * End drawing operation
   * Requirements: 2.2, 2.3, 2.4
   */
  endDraw(): void {
    if (!this.isDrawing) return;
    
    if (this.currentTool.type === 'lasso' && this.lassoPoints.length > 2) {
      this.fillLasso();
    }
    
    this.isDrawing = false;
    this.lastPoint = null;
    this.lassoPoints = [];
    
    // Save state to history
    this.saveToHistory();
  }

  /**
   * Draw rectangle
   * Requirements: 2.3
   */
  drawRectangle(x1: number, y1: number, x2: number, y2: number): void {
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    
    this.ctx.fillStyle = MASK_COLOR;
    this.ctx.fillRect(left, top, width, height);
    
    this.saveToHistory();
  }

  /**
   * Draw a single point (for brush/eraser)
   */
  private drawPoint(x: number, y: number): void {
    const radius = this.currentTool.size / 2;
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    
    if (this.currentTool.type === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.fillStyle = MASK_COLOR;
    }
    
    this.ctx.fill();
    this.ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Draw a line between two points (for smooth brush strokes)
   */
  private drawLine(from: Point, to: Point): void {
    const radius = this.currentTool.size / 2;
    
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.lineWidth = this.currentTool.size;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    if (this.currentTool.type === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = MASK_COLOR;
    }
    
    this.ctx.stroke();
    this.ctx.globalCompositeOperation = 'source-over';
    
    // Also draw circles at endpoints for smoother appearance
    this.ctx.beginPath();
    this.ctx.arc(to.x, to.y, radius, 0, Math.PI * 2);
    if (this.currentTool.type === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.fillStyle = MASK_COLOR;
    }
    this.ctx.fill();
    this.ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Draw lasso preview (outline while drawing)
   */
  private drawLassoPreview(): void {
    if (this.lassoPoints.length < 2) return;
    
    // We don't clear here - just draw the outline
    // The actual fill happens on endDraw
  }

  /**
   * Fill the lasso polygon
   * Requirements: 2.4
   */
  private fillLasso(): void {
    if (this.lassoPoints.length < 3) return;
    
    const firstPoint = this.lassoPoints[0];
    if (!firstPoint) return;
    
    this.ctx.beginPath();
    this.ctx.moveTo(firstPoint.x, firstPoint.y);
    
    for (let i = 1; i < this.lassoPoints.length; i++) {
      const point = this.lassoPoints[i];
      if (point) {
        this.ctx.lineTo(point.x, point.y);
      }
    }
    
    this.ctx.closePath();
    this.ctx.fillStyle = MASK_COLOR;
    this.ctx.fill();
  }

  /**
   * Save current state to history
   */
  private saveToHistory(): void {
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    
    // Remove any redo states
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    
    // Add new state
    this.history.push(imageData);
    this.historyIndex = this.history.length - 1;
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  /**
   * Undo last operation
   * Requirements: 2.6
   */
  undo(): boolean {
    if (this.historyIndex <= 0) {
      return false;
    }
    
    this.historyIndex--;
    const imageData = this.history[this.historyIndex];
    if (imageData) {
      this.ctx.putImageData(imageData, 0, 0);
    }
    return true;
  }

  /**
   * Redo last undone operation
   */
  redo(): boolean {
    if (this.historyIndex >= this.history.length - 1) {
      return false;
    }
    
    this.historyIndex++;
    const imageData = this.history[this.historyIndex];
    if (imageData) {
      this.ctx.putImageData(imageData, 0, 0);
    }
    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * Clear all mask content
   * Requirements: 2.7
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Clear and save to history
   */
  clearWithHistory(): void {
    this.clear();
    this.saveToHistory();
  }

  /**
   * Check if mask has any content
   * Requirements: 2.9
   */
  hasMask(): boolean {
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    const data = imageData.data;
    
    // Check if any pixel has non-zero alpha
    for (let i = 3; i < data.length; i += 4) {
      const alpha = data[i];
      if (alpha !== undefined && alpha > 0) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Export mask as data URL
   * Requirements: 2.9
   */
  exportMask(): string {
    return this.canvas.toDataURL('image/png');
  }

  /**
   * Export mask as binary (black and white) image
   * White = masked area, Black = unmasked
   */
  exportBinaryMask(): string {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.width;
    tempCanvas.height = this.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {
      return this.exportMask();
    }
    
    // Fill with black
    tempCtx.fillStyle = 'black';
    tempCtx.fillRect(0, 0, this.width, this.height);
    
    // Get mask data
    const maskData = this.ctx.getImageData(0, 0, this.width, this.height);
    const tempData = tempCtx.getImageData(0, 0, this.width, this.height);
    
    // Convert: any non-transparent pixel becomes white
    for (let i = 0; i < maskData.data.length; i += 4) {
      const alpha = maskData.data[i + 3];
      if (alpha !== undefined && alpha > 0) {
        tempData.data[i] = 255;     // R
        tempData.data[i + 1] = 255; // G
        tempData.data[i + 2] = 255; // B
        tempData.data[i + 3] = 255; // A
      }
    }
    
    tempCtx.putImageData(tempData, 0, 0);
    return tempCanvas.toDataURL('image/png');
  }

  /**
   * Get the canvas element for rendering
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get current drawing state
   */
  isCurrentlyDrawing(): boolean {
    return this.isDrawing;
  }

  /**
   * Get history info
   */
  getHistoryInfo(): { index: number; length: number } {
    return {
      index: this.historyIndex,
      length: this.history.length,
    };
  }
}
