/**
 * AppContext - Global state management for Manga Watermark Tool
 * Requirements: All
 */

import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type {
  AppState,
  UploadedImage,
  WatermarkSettings,
  WatermarkConfig,
  WatermarkPosition,
  Preset,
  ExportSettings,
  BatchProcessingProgress,
} from '@/types';
import { createDefaultAppState } from '@/types';

// ============================================
// Action Types
// ============================================

export type AppAction =
  // Image actions
  | { type: 'ADD_IMAGES'; payload: UploadedImage[] }
  | { type: 'REMOVE_IMAGE'; payload: string }
  | { type: 'CLEAR_IMAGES' }
  | { type: 'SELECT_IMAGE'; payload: string | null }
  | { type: 'MARK_IMAGE_PROCESSED'; payload: string }
  | { type: 'UPDATE_IMAGE'; payload: { imageId: string; updates: Partial<UploadedImage> } }
  
  // Watermark settings actions
  | { type: 'SET_WATERMARK_SETTINGS'; payload: WatermarkSettings }
  | { type: 'UPDATE_WATERMARK_CONFIG'; payload: Partial<WatermarkConfig> }
  | { type: 'UPDATE_WATERMARK_POSITION'; payload: Partial<WatermarkPosition> }
  | { type: 'TOGGLE_WATERMARK_ENABLED'; payload?: boolean }
  
  // Preset actions
  | { type: 'SET_PRESETS'; payload: Preset[] }
  | { type: 'ADD_PRESET'; payload: Preset }
  | { type: 'UPDATE_PRESET'; payload: Preset }
  | { type: 'REMOVE_PRESET'; payload: string }
  | { type: 'SELECT_PRESET'; payload: string | null }
  | { type: 'APPLY_PRESET'; payload: Preset }
  
  // Export settings actions
  | { type: 'SET_EXPORT_SETTINGS'; payload: ExportSettings }
  | { type: 'UPDATE_EXPORT_SETTINGS'; payload: Partial<ExportSettings> }
  
  // Processing state actions
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_PROCESSING_PROGRESS'; payload: BatchProcessingProgress | null }
  
  // Preview state actions
  | { type: 'SET_PREVIEW_ZOOM'; payload: number }
  | { type: 'SET_PREVIEW_PAN'; payload: { x: number; y: number } }
  | { type: 'TOGGLE_WATERMARK_VISIBLE'; payload?: boolean }
  
  // Reset action
  | { type: 'RESET_STATE' };

// ============================================
// Reducer
// ============================================


function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // ============================================
    // Image Actions
    // ============================================
    case 'ADD_IMAGES':
      return {
        ...state,
        images: [...state.images, ...action.payload],
        // Auto-select first image if none selected
        selectedImageId: state.selectedImageId ?? action.payload[0]?.id ?? null,
      };

    case 'REMOVE_IMAGE': {
      const newImages = state.images.filter(img => img.id !== action.payload);
      return {
        ...state,
        images: newImages,
        // Clear selection if removed image was selected
        selectedImageId: state.selectedImageId === action.payload
          ? (newImages[0]?.id ?? null)
          : state.selectedImageId,
      };
    }

    case 'CLEAR_IMAGES':
      return {
        ...state,
        images: [],
        selectedImageId: null,
      };

    case 'SELECT_IMAGE':
      return {
        ...state,
        selectedImageId: action.payload,
      };

    case 'MARK_IMAGE_PROCESSED':
      return {
        ...state,
        images: state.images.map(img =>
          img.id === action.payload ? { ...img, processed: true } : img
        ),
      };

    case 'UPDATE_IMAGE':
      return {
        ...state,
        images: state.images.map(img =>
          img.id === action.payload.imageId
            ? { ...img, ...action.payload.updates }
            : img
        ),
      };

    // ============================================
    // Watermark Settings Actions
    // ============================================
    case 'SET_WATERMARK_SETTINGS':
      return {
        ...state,
        watermarkSettings: action.payload,
      };

    case 'UPDATE_WATERMARK_CONFIG':
      return {
        ...state,
        watermarkSettings: {
          ...state.watermarkSettings,
          config: {
            ...state.watermarkSettings.config,
            ...action.payload,
          } as WatermarkConfig,
        },
      };

    case 'UPDATE_WATERMARK_POSITION':
      return {
        ...state,
        watermarkSettings: {
          ...state.watermarkSettings,
          position: {
            ...state.watermarkSettings.position,
            ...action.payload,
          },
        },
      };

    case 'TOGGLE_WATERMARK_ENABLED':
      return {
        ...state,
        watermarkSettings: {
          ...state.watermarkSettings,
          enabled: action.payload ?? !state.watermarkSettings.enabled,
        },
      };

    // ============================================
    // Preset Actions
    // ============================================
    case 'SET_PRESETS':
      return {
        ...state,
        presets: action.payload,
      };

    case 'ADD_PRESET':
      return {
        ...state,
        presets: [...state.presets, action.payload],
      };

    case 'UPDATE_PRESET':
      return {
        ...state,
        presets: state.presets.map(preset =>
          preset.id === action.payload.id ? action.payload : preset
        ),
      };

    case 'REMOVE_PRESET': {
      return {
        ...state,
        presets: state.presets.filter(preset => preset.id !== action.payload),
        selectedPresetId: state.selectedPresetId === action.payload
          ? null
          : state.selectedPresetId,
      };
    }

    case 'SELECT_PRESET':
      return {
        ...state,
        selectedPresetId: action.payload,
      };

    case 'APPLY_PRESET':
      return {
        ...state,
        watermarkSettings: structuredClone(action.payload.settings),
        selectedPresetId: action.payload.id,
      };

    // ============================================
    // Export Settings Actions
    // ============================================
    case 'SET_EXPORT_SETTINGS':
      return {
        ...state,
        exportSettings: action.payload,
      };

    case 'UPDATE_EXPORT_SETTINGS':
      return {
        ...state,
        exportSettings: {
          ...state.exportSettings,
          ...action.payload,
        },
      };

    // ============================================
    // Processing State Actions
    // ============================================
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload,
        processingProgress: action.payload ? state.processingProgress : null,
      };

    case 'SET_PROCESSING_PROGRESS':
      return {
        ...state,
        processingProgress: action.payload,
      };

    // ============================================
    // Preview State Actions
    // ============================================
    case 'SET_PREVIEW_ZOOM':
      return {
        ...state,
        previewZoom: Math.max(0.1, Math.min(10, action.payload)),
      };

    case 'SET_PREVIEW_PAN':
      return {
        ...state,
        previewPan: action.payload,
      };

    case 'TOGGLE_WATERMARK_VISIBLE':
      return {
        ...state,
        watermarkVisible: action.payload ?? !state.watermarkVisible,
      };

    // ============================================
    // Reset Action
    // ============================================
    case 'RESET_STATE':
      return createDefaultAppState();

    default:
      return state;
  }
}


// ============================================
// Context Types
// ============================================

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Convenience getters
  selectedImage: UploadedImage | null;
  selectedPreset: Preset | null;
}

// ============================================
// Context Creation
// ============================================

const AppContext = createContext<AppContextValue | null>(null);

// ============================================
// Provider Component
// ============================================

interface AppProviderProps {
  children: ReactNode;
  initialState?: Partial<AppState>;
}

export function AppProvider({ children, initialState }: AppProviderProps) {
  const defaultState = createDefaultAppState();
  const mergedInitialState: AppState = initialState
    ? { ...defaultState, ...initialState }
    : defaultState;

  const [state, dispatch] = useReducer(appReducer, mergedInitialState);

  // Memoized convenience getters
  const selectedImage = state.images.find(img => img.id === state.selectedImageId) ?? null;
  const selectedPreset = state.presets.find(preset => preset.id === state.selectedPresetId) ?? null;

  const value: AppContextValue = {
    state,
    dispatch,
    selectedImage,
    selectedPreset,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// ============================================
// Hook for accessing context
// ============================================

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// ============================================
// Export reducer for testing
// ============================================

export { appReducer };
export type { AppContextValue };
