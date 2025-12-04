/**
 * useWatermarkSettings Hook
 * Provides watermark settings state and actions
 * Requirements: 2.1-2.6, 3.1-3.5, 4.1-4.5
 */

import { useCallback } from 'react';
import { useAppContext } from '@/context';
import type {
  WatermarkSettings,
  WatermarkConfig,
  WatermarkPosition,
  TextWatermarkConfig,
  ImageWatermarkConfig,
  PresetPosition,
} from '@/types';
import {
  createDefaultTextWatermarkConfig,
  createDefaultImageWatermarkConfig,
} from '@/types';

export interface UseWatermarkSettingsReturn {
  // State
  settings: WatermarkSettings;
  config: WatermarkConfig;
  position: WatermarkPosition;
  enabled: boolean;
  isTextWatermark: boolean;
  isImageWatermark: boolean;

  // Actions
  setSettings: (settings: WatermarkSettings) => void;
  updateConfig: (updates: Partial<WatermarkConfig>) => void;
  updatePosition: (updates: Partial<WatermarkPosition>) => void;
  toggleEnabled: (enabled?: boolean) => void;

  // Text watermark specific
  setText: (text: string) => void;
  setFontFamily: (fontFamily: string) => void;
  setFontSize: (fontSize: number) => void;
  setFontWeight: (fontWeight: 'normal' | 'bold') => void;
  setTextColor: (color: string) => void;
  setTextOpacity: (opacity: number) => void;
  setOutlineEnabled: (enabled: boolean) => void;
  setOutlineColor: (color: string) => void;
  setOutlineWidth: (width: number) => void;

  // Image watermark specific
  setImageData: (imageData: string) => void;
  setImageScale: (scale: number) => void;
  setImageOpacity: (opacity: number) => void;
  setTileEnabled: (enabled: boolean) => void;
  setTileSpacing: (spacingX: number, spacingY: number) => void;

  // Position specific
  setPresetPosition: (position: PresetPosition | 'custom') => void;
  setOffset: (offsetX: number, offsetY: number) => void;
  setRotation: (rotation: number) => void;
  setMargins: (margins: { top?: number; right?: number; bottom?: number; left?: number }) => void;

  // Switch watermark type
  switchToText: () => void;
  switchToImage: () => void;
}

export function useWatermarkSettings(): UseWatermarkSettingsReturn {
  const { state, dispatch } = useAppContext();
  const { watermarkSettings } = state;

  // Derived state
  const isTextWatermark = watermarkSettings.config.type === 'text';
  const isImageWatermark = watermarkSettings.config.type === 'image';

  // Base actions
  const setSettings = useCallback((settings: WatermarkSettings) => {
    dispatch({ type: 'SET_WATERMARK_SETTINGS', payload: settings });
  }, [dispatch]);

  const updateConfig = useCallback((updates: Partial<WatermarkConfig>) => {
    dispatch({ type: 'UPDATE_WATERMARK_CONFIG', payload: updates });
  }, [dispatch]);

  const updatePosition = useCallback((updates: Partial<WatermarkPosition>) => {
    dispatch({ type: 'UPDATE_WATERMARK_POSITION', payload: updates });
  }, [dispatch]);

  const toggleEnabled = useCallback((enabled?: boolean) => {
    if (enabled !== undefined) {
      dispatch({ type: 'TOGGLE_WATERMARK_ENABLED', payload: enabled });
    } else {
      dispatch({ type: 'TOGGLE_WATERMARK_ENABLED' });
    }
  }, [dispatch]);

  // Text watermark actions
  const setText = useCallback((text: string) => {
    updateConfig({ text } as Partial<TextWatermarkConfig>);
  }, [updateConfig]);

  const setFontFamily = useCallback((fontFamily: string) => {
    updateConfig({ fontFamily } as Partial<TextWatermarkConfig>);
  }, [updateConfig]);

  const setFontSize = useCallback((fontSize: number) => {
    updateConfig({ fontSize } as Partial<TextWatermarkConfig>);
  }, [updateConfig]);

  const setFontWeight = useCallback((fontWeight: 'normal' | 'bold') => {
    updateConfig({ fontWeight } as Partial<TextWatermarkConfig>);
  }, [updateConfig]);

  const setTextColor = useCallback((color: string) => {
    updateConfig({ color } as Partial<TextWatermarkConfig>);
  }, [updateConfig]);

  const setTextOpacity = useCallback((opacity: number) => {
    updateConfig({ opacity } as Partial<TextWatermarkConfig>);
  }, [updateConfig]);

  const setOutlineEnabled = useCallback((outlineEnabled: boolean) => {
    updateConfig({ outlineEnabled } as Partial<TextWatermarkConfig>);
  }, [updateConfig]);

  const setOutlineColor = useCallback((outlineColor: string) => {
    updateConfig({ outlineColor } as Partial<TextWatermarkConfig>);
  }, [updateConfig]);

  const setOutlineWidth = useCallback((outlineWidth: number) => {
    updateConfig({ outlineWidth } as Partial<TextWatermarkConfig>);
  }, [updateConfig]);

  // Image watermark actions
  const setImageData = useCallback((imageData: string) => {
    updateConfig({ imageData } as Partial<ImageWatermarkConfig>);
  }, [updateConfig]);

  const setImageScale = useCallback((scale: number) => {
    updateConfig({ scale } as Partial<ImageWatermarkConfig>);
  }, [updateConfig]);

  const setImageOpacity = useCallback((opacity: number) => {
    updateConfig({ opacity } as Partial<ImageWatermarkConfig>);
  }, [updateConfig]);

  const setTileEnabled = useCallback((tileEnabled: boolean) => {
    updateConfig({ tileEnabled } as Partial<ImageWatermarkConfig>);
  }, [updateConfig]);

  const setTileSpacing = useCallback((tileSpacingX: number, tileSpacingY: number) => {
    updateConfig({ tileSpacingX, tileSpacingY } as Partial<ImageWatermarkConfig>);
  }, [updateConfig]);

  // Position actions
  const setPresetPosition = useCallback((presetPosition: PresetPosition | 'custom') => {
    updatePosition({ presetPosition });
  }, [updatePosition]);

  const setOffset = useCallback((offsetX: number, offsetY: number) => {
    updatePosition({ offsetX, offsetY });
  }, [updatePosition]);

  const setRotation = useCallback((rotation: number) => {
    updatePosition({ rotation });
  }, [updatePosition]);

  const setMargins = useCallback((margins: { top?: number; right?: number; bottom?: number; left?: number }) => {
    const updates: Partial<WatermarkPosition> = {};
    if (margins.top !== undefined) updates.marginTop = margins.top;
    if (margins.right !== undefined) updates.marginRight = margins.right;
    if (margins.bottom !== undefined) updates.marginBottom = margins.bottom;
    if (margins.left !== undefined) updates.marginLeft = margins.left;
    updatePosition(updates);
  }, [updatePosition]);

  // Switch watermark type
  const switchToText = useCallback(() => {
    dispatch({
      type: 'SET_WATERMARK_SETTINGS',
      payload: {
        ...watermarkSettings,
        config: createDefaultTextWatermarkConfig(),
      },
    });
  }, [dispatch, watermarkSettings]);

  const switchToImage = useCallback(() => {
    dispatch({
      type: 'SET_WATERMARK_SETTINGS',
      payload: {
        ...watermarkSettings,
        config: createDefaultImageWatermarkConfig(),
      },
    });
  }, [dispatch, watermarkSettings]);

  return {
    // State
    settings: watermarkSettings,
    config: watermarkSettings.config,
    position: watermarkSettings.position,
    enabled: watermarkSettings.enabled,
    isTextWatermark,
    isImageWatermark,

    // Actions
    setSettings,
    updateConfig,
    updatePosition,
    toggleEnabled,

    // Text watermark specific
    setText,
    setFontFamily,
    setFontSize,
    setFontWeight,
    setTextColor,
    setTextOpacity,
    setOutlineEnabled,
    setOutlineColor,
    setOutlineWidth,

    // Image watermark specific
    setImageData,
    setImageScale,
    setImageOpacity,
    setTileEnabled,
    setTileSpacing,

    // Position specific
    setPresetPosition,
    setOffset,
    setRotation,
    setMargins,

    // Switch watermark type
    switchToText,
    switchToImage,
  };
}
