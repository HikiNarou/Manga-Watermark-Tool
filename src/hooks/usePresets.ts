/**
 * usePresets Hook
 * Provides preset management state and actions
 * Requirements: 5.1-5.7
 */

import { useCallback, useEffect } from 'react';
import { useAppContext } from '@/context';
import type { Preset, WatermarkSettings } from '@/types';
import { PresetManager } from '@/services/PresetManager';

// Singleton preset manager instance
const presetManager = new PresetManager();

export interface UsePresetsReturn {
  // State
  presets: Preset[];
  selectedPresetId: string | null;
  selectedPreset: Preset | null;
  hasPresets: boolean;
  presetCount: number;

  // Actions
  savePreset: (name: string, settings?: WatermarkSettings) => Preset;
  loadPreset: (presetId: string) => void;
  updatePreset: (presetId: string, updates: { name?: string; settings?: WatermarkSettings }) => void;
  deletePreset: (presetId: string) => boolean;
  selectPreset: (presetId: string | null) => void;
  applyPreset: (preset: Preset) => void;

  // Import/Export
  exportPresets: () => string;
  importPresets: (json: string) => Preset[];
  downloadPresetsFile: () => void;

  // Utility
  refreshPresets: () => void;
  getPresetById: (presetId: string) => Preset | null;
}

export function usePresets(): UsePresetsReturn {
  const { state, dispatch, selectedPreset } = useAppContext();
  const { presets, selectedPresetId, watermarkSettings } = state;

  // Derived state
  const hasPresets = presets.length > 0;
  const presetCount = presets.length;

  // Load presets from storage on mount
  useEffect(() => {
    const storedPresets = presetManager.getAll();
    if (storedPresets.length > 0) {
      dispatch({ type: 'SET_PRESETS', payload: storedPresets });
    }
  }, [dispatch]);

  // Refresh presets from storage
  const refreshPresets = useCallback(() => {
    const storedPresets = presetManager.getAll();
    dispatch({ type: 'SET_PRESETS', payload: storedPresets });
  }, [dispatch]);

  // Save new preset
  const savePreset = useCallback((name: string, settings?: WatermarkSettings): Preset => {
    const settingsToSave = settings ?? watermarkSettings;
    const newPreset = presetManager.save(name, settingsToSave);
    dispatch({ type: 'ADD_PRESET', payload: newPreset });
    return newPreset;
  }, [dispatch, watermarkSettings]);

  // Load and apply preset
  const loadPreset = useCallback((presetId: string) => {
    const preset = presetManager.getById(presetId);
    if (preset) {
      dispatch({ type: 'APPLY_PRESET', payload: preset });
    }
  }, [dispatch]);

  // Update existing preset
  const updatePreset = useCallback((
    presetId: string,
    updates: { name?: string; settings?: WatermarkSettings }
  ) => {
    try {
      const updatedPreset = presetManager.update(presetId, updates);
      dispatch({ type: 'UPDATE_PRESET', payload: updatedPreset });
    } catch (error) {
      console.error('Failed to update preset:', error);
    }
  }, [dispatch]);

  // Delete preset
  const deletePreset = useCallback((presetId: string): boolean => {
    const deleted = presetManager.delete(presetId);
    if (deleted) {
      dispatch({ type: 'REMOVE_PRESET', payload: presetId });
    }
    return deleted;
  }, [dispatch]);

  // Select preset (without applying)
  const selectPreset = useCallback((presetId: string | null) => {
    dispatch({ type: 'SELECT_PRESET', payload: presetId });
  }, [dispatch]);

  // Apply preset settings
  const applyPreset = useCallback((preset: Preset) => {
    dispatch({ type: 'APPLY_PRESET', payload: preset });
  }, [dispatch]);

  // Export all presets to JSON
  const exportPresets = useCallback((): string => {
    return presetManager.exportToJson();
  }, []);

  // Import presets from JSON
  const importPresets = useCallback((json: string): Preset[] => {
    const imported = presetManager.importFromJson(json);
    if (imported.length > 0) {
      refreshPresets();
    }
    return imported;
  }, [refreshPresets]);

  // Download presets as JSON file
  const downloadPresetsFile = useCallback(() => {
    const json = exportPresets();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `watermark-presets-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [exportPresets]);

  // Get preset by ID
  const getPresetById = useCallback((presetId: string): Preset | null => {
    return presets.find(p => p.id === presetId) ?? null;
  }, [presets]);

  return {
    // State
    presets,
    selectedPresetId,
    selectedPreset,
    hasPresets,
    presetCount,

    // Actions
    savePreset,
    loadPreset,
    updatePreset,
    deletePreset,
    selectPreset,
    applyPreset,

    // Import/Export
    exportPresets,
    importPresets,
    downloadPresetsFile,

    // Utility
    refreshPresets,
    getPresetById,
  };
}
