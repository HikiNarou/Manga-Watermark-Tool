/**
 * useExport Hook
 * Provides export functionality state and actions
 * Requirements: 6.1-6.5, 7.1-7.6
 */

import { useCallback } from 'react';
import { useAppContext } from '@/context';
import type {
  ExportSettings,
  ExportFormat,
  ProcessingResult,
  BatchProcessingProgress,
} from '@/types';
import {
  batchProcess,
  cancelBatch,
  exportAsZip,
  downloadBlob,
  applyWatermark,
  exportImage,
  generateOutputFilename,
} from '@/services/ImageProcessor';

export interface UseExportReturn {
  // State
  exportSettings: ExportSettings;
  isProcessing: boolean;
  processingProgress: BatchProcessingProgress | null;

  // Export settings actions
  setExportSettings: (settings: ExportSettings) => void;
  updateExportSettings: (updates: Partial<ExportSettings>) => void;
  setFormat: (format: ExportFormat) => void;
  setQuality: (quality: number) => void;
  setFilenamePrefix: (prefix: string) => void;
  setFilenameSuffix: (suffix: string) => void;
  setPreserveOriginalName: (preserve: boolean) => void;

  // Processing actions
  processAllImages: () => Promise<ProcessingResult[]>;
  processSelectedImage: () => Promise<ProcessingResult | null>;
  cancelProcessing: () => void;

  // Download actions
  downloadAsZip: (results: ProcessingResult[], filename?: string) => Promise<void>;
  downloadSingleImage: (result: ProcessingResult) => void;

  // Progress helpers
  getProgressPercentage: () => number;
  getProgressText: () => string;
}

export function useExport(): UseExportReturn {
  const { state, dispatch, selectedImage } = useAppContext();
  const { exportSettings, isProcessing, processingProgress, images, watermarkSettings } = state;

  // Export settings actions
  const setExportSettings = useCallback((settings: ExportSettings) => {
    dispatch({ type: 'SET_EXPORT_SETTINGS', payload: settings });
  }, [dispatch]);

  const updateExportSettings = useCallback((updates: Partial<ExportSettings>) => {
    dispatch({ type: 'UPDATE_EXPORT_SETTINGS', payload: updates });
  }, [dispatch]);

  const setFormat = useCallback((format: ExportFormat) => {
    updateExportSettings({ format });
  }, [updateExportSettings]);

  const setQuality = useCallback((quality: number) => {
    updateExportSettings({ quality: Math.max(0, Math.min(100, quality)) });
  }, [updateExportSettings]);

  const setFilenamePrefix = useCallback((filenamePrefix: string) => {
    updateExportSettings({ filenamePrefix });
  }, [updateExportSettings]);

  const setFilenameSuffix = useCallback((filenameSuffix: string) => {
    updateExportSettings({ filenameSuffix });
  }, [updateExportSettings]);

  const setPreserveOriginalName = useCallback((preserveOriginalName: boolean) => {
    updateExportSettings({ preserveOriginalName });
  }, [updateExportSettings]);

  // Processing actions
  const processAllImages = useCallback(async (): Promise<ProcessingResult[]> => {
    if (images.length === 0) {
      return [];
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });

    try {
      const results = await batchProcess(
        images,
        watermarkSettings,
        exportSettings,
        (progress) => {
          dispatch({ type: 'SET_PROCESSING_PROGRESS', payload: progress });
        }
      );

      // Mark processed images
      for (const result of results) {
        if (result.success) {
          dispatch({ type: 'MARK_IMAGE_PROCESSED', payload: result.imageId });
        }
      }

      return results;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [dispatch, images, watermarkSettings, exportSettings]);

  const processSelectedImage = useCallback(async (): Promise<ProcessingResult | null> => {
    if (!selectedImage) {
      return null;
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });

    try {
      const watermarkedBlob = await applyWatermark(selectedImage, watermarkSettings);
      const outputBlob = await exportImage(
        watermarkedBlob,
        selectedImage.name,
        exportSettings.format,
        exportSettings.quality
      );
      const outputFilename = generateOutputFilename(
        selectedImage.name,
        exportSettings.filenamePrefix,
        exportSettings.filenameSuffix,
        exportSettings.format
      );

      dispatch({ type: 'MARK_IMAGE_PROCESSED', payload: selectedImage.id });

      return {
        imageId: selectedImage.id,
        success: true,
        outputBlob,
        outputFilename,
      };
    } catch (error) {
      return {
        imageId: selectedImage.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [dispatch, selectedImage, watermarkSettings, exportSettings]);

  const cancelProcessing = useCallback(() => {
    cancelBatch();
  }, []);

  // Download actions
  const downloadAsZip = useCallback(async (
    results: ProcessingResult[],
    filename: string = 'watermarked_images'
  ): Promise<void> => {
    const successfulResults = results.filter(r => r.success && r.outputBlob);
    if (successfulResults.length === 0) {
      return;
    }

    const zipBlob = await exportAsZip(results, filename);
    downloadBlob(zipBlob, `${filename}.zip`);
  }, []);

  const downloadSingleImage = useCallback((result: ProcessingResult) => {
    if (result.success && result.outputBlob && result.outputFilename) {
      downloadBlob(result.outputBlob, result.outputFilename);
    }
  }, []);

  // Progress helpers
  const getProgressPercentage = useCallback((): number => {
    if (!processingProgress || processingProgress.total === 0) {
      return 0;
    }
    return Math.round((processingProgress.completed / processingProgress.total) * 100);
  }, [processingProgress]);

  const getProgressText = useCallback((): string => {
    if (!processingProgress) {
      return '';
    }
    const { completed, total, failed, currentImage } = processingProgress;
    if (completed === total) {
      return `Completed: ${completed}/${total}${failed > 0 ? ` (${failed} failed)` : ''}`;
    }
    return `Processing: ${currentImage} (${completed}/${total})`;
  }, [processingProgress]);

  return {
    // State
    exportSettings,
    isProcessing,
    processingProgress,

    // Export settings actions
    setExportSettings,
    updateExportSettings,
    setFormat,
    setQuality,
    setFilenamePrefix,
    setFilenameSuffix,
    setPreserveOriginalName,

    // Processing actions
    processAllImages,
    processSelectedImage,
    cancelProcessing,

    // Download actions
    downloadAsZip,
    downloadSingleImage,

    // Progress helpers
    getProgressPercentage,
    getProgressText,
  };
}
