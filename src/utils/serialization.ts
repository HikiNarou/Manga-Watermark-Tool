/**
 * Serialization Utilities for Watermark Settings
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import type { WatermarkSettings, TextWatermarkConfig, ImageWatermarkConfig } from '@/types';

/**
 * Validation error thrown when JSON structure is invalid
 */
export class SerializationValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'SerializationValidationError';
  }
}

/**
 * Serialized format for watermark settings
 * This is the JSON structure used for storage and transfer
 */
export interface SerializedWatermarkSettings {
  version: number;
  config: SerializedWatermarkConfig;
  position: SerializedWatermarkPosition;
  enabled: boolean;
}

export interface SerializedTextWatermarkConfig {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  opacity: number;
  outlineEnabled: boolean;
  outlineColor: string;
  outlineWidth: number;
}

export interface SerializedImageWatermarkConfig {
  type: 'image';
  imageData: string; // base64 encoded
  scale: number;
  opacity: number;
  tileEnabled: boolean;
  tileSpacingX: number;
  tileSpacingY: number;
}

export type SerializedWatermarkConfig = SerializedTextWatermarkConfig | SerializedImageWatermarkConfig;


export interface SerializedWatermarkPosition {
  presetPosition: string;
  offsetX: number;
  offsetY: number;
  rotation: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
}

/**
 * Current serialization format version
 */
export const SERIALIZATION_VERSION = 1;

/**
 * Serialize WatermarkSettings to JSON string
 * Requirements: 9.1, 9.3
 * 
 * @param settings - The watermark settings to serialize
 * @returns JSON string representation
 */
export function serializeWatermarkSettings(settings: WatermarkSettings): string {
  const serialized: SerializedWatermarkSettings = {
    version: SERIALIZATION_VERSION,
    config: serializeConfig(settings.config),
    position: {
      presetPosition: settings.position.presetPosition,
      offsetX: settings.position.offsetX,
      offsetY: settings.position.offsetY,
      rotation: settings.position.rotation,
      marginTop: settings.position.marginTop,
      marginRight: settings.position.marginRight,
      marginBottom: settings.position.marginBottom,
      marginLeft: settings.position.marginLeft,
    },
    enabled: settings.enabled,
  };

  return JSON.stringify(serialized);
}

/**
 * Serialize watermark config (handles base64 encoding for image watermarks)
 */
function serializeConfig(config: TextWatermarkConfig | ImageWatermarkConfig): SerializedWatermarkConfig {
  if (config.type === 'text') {
    return {
      type: 'text',
      text: config.text,
      fontFamily: config.fontFamily,
      fontSize: config.fontSize,
      fontWeight: config.fontWeight,
      color: config.color,
      opacity: config.opacity,
      outlineEnabled: config.outlineEnabled,
      outlineColor: config.outlineColor,
      outlineWidth: config.outlineWidth,
    };
  } else {
    // Image watermark - imageData is already base64 encoded
    return {
      type: 'image',
      imageData: config.imageData,
      scale: config.scale,
      opacity: config.opacity,
      tileEnabled: config.tileEnabled,
      tileSpacingX: config.tileSpacingX,
      tileSpacingY: config.tileSpacingY,
    };
  }
}

/**
 * Deserialize JSON string to WatermarkSettings
 * Requirements: 9.2, 9.4
 * 
 * @param json - JSON string to deserialize
 * @returns Deserialized WatermarkSettings
 * @throws SerializationValidationError if JSON is invalid
 */
export function deserializeWatermarkSettings(json: string): WatermarkSettings {
  // First, validate the JSON structure
  const validationResult = validateSettingsJson(json);
  if (!validationResult.valid) {
    throw new SerializationValidationError(
      validationResult.errors.join('; '),
      validationResult.field
    );
  }

  const parsed = JSON.parse(json) as SerializedWatermarkSettings;
  
  return {
    config: deserializeConfig(parsed.config),
    position: {
      presetPosition: parsed.position.presetPosition as WatermarkSettings['position']['presetPosition'],
      offsetX: parsed.position.offsetX,
      offsetY: parsed.position.offsetY,
      rotation: parsed.position.rotation,
      marginTop: parsed.position.marginTop,
      marginRight: parsed.position.marginRight,
      marginBottom: parsed.position.marginBottom,
      marginLeft: parsed.position.marginLeft,
    },
    enabled: parsed.enabled,
  };
}


/**
 * Deserialize config from serialized format
 */
function deserializeConfig(config: SerializedWatermarkConfig): TextWatermarkConfig | ImageWatermarkConfig {
  if (config.type === 'text') {
    return {
      type: 'text',
      text: config.text,
      fontFamily: config.fontFamily,
      fontSize: config.fontSize,
      fontWeight: config.fontWeight,
      color: config.color,
      opacity: config.opacity,
      outlineEnabled: config.outlineEnabled,
      outlineColor: config.outlineColor,
      outlineWidth: config.outlineWidth,
    };
  } else {
    return {
      type: 'image',
      imageData: config.imageData,
      scale: config.scale,
      opacity: config.opacity,
      tileEnabled: config.tileEnabled,
      tileSpacingX: config.tileSpacingX,
      tileSpacingY: config.tileSpacingY,
    };
  }
}

/**
 * Validation result for settings JSON
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  field?: string;
}

/**
 * Valid preset positions
 */
const VALID_PRESET_POSITIONS = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
  'custom',
];

/**
 * Validate JSON string for watermark settings
 * Requirements: 9.4
 * 
 * @param json - JSON string to validate
 * @returns Validation result with errors if invalid
 */
export function validateSettingsJson(json: string): ValidationResult {
  const errors: string[] = [];
  let field: string | undefined;

  // Try to parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return {
      valid: false,
      errors: ['Invalid JSON syntax'],
    };
  }

  // Check if it's an object
  if (typeof parsed !== 'object' || parsed === null) {
    return {
      valid: false,
      errors: ['Root must be an object'],
    };
  }

  const obj = parsed as Record<string, unknown>;

  // Validate version (optional but if present must be number)
  if ('version' in obj && typeof obj['version'] !== 'number') {
    errors.push('version must be a number');
    field = field || 'version';
  }

  // Validate config
  if (!('config' in obj)) {
    errors.push('Missing required field: config');
    field = field || 'config';
  } else {
    const configErrors = validateConfig(obj['config']);
    if (configErrors.length > 0) {
      errors.push(...configErrors.map(e => `config.${e}`));
      field = field || 'config';
    }
  }

  // Validate position
  if (!('position' in obj)) {
    errors.push('Missing required field: position');
    field = field || 'position';
  } else {
    const positionErrors = validatePosition(obj['position']);
    if (positionErrors.length > 0) {
      errors.push(...positionErrors.map(e => `position.${e}`));
      field = field || 'position';
    }
  }

  // Validate enabled
  if (!('enabled' in obj)) {
    errors.push('Missing required field: enabled');
    field = field || 'enabled';
  } else if (typeof obj['enabled'] !== 'boolean') {
    errors.push('enabled must be a boolean');
    field = field || 'enabled';
  }

  const result: ValidationResult = {
    valid: errors.length === 0,
    errors,
  };
  if (field !== undefined) {
    result.field = field;
  }
  return result;
}


/**
 * Validate watermark config object
 */
function validateConfig(config: unknown): string[] {
  const errors: string[] = [];

  if (typeof config !== 'object' || config === null) {
    return ['must be an object'];
  }

  const obj = config as Record<string, unknown>;

  if (!('type' in obj)) {
    return ['Missing required field: type'];
  }

  if (obj['type'] === 'text') {
    // Validate text watermark config
    if (typeof obj['text'] !== 'string') {
      errors.push('text must be a string');
    }
    if (typeof obj['fontFamily'] !== 'string') {
      errors.push('fontFamily must be a string');
    }
    if (typeof obj['fontSize'] !== 'number') {
      errors.push('fontSize must be a number');
    }
    if (obj['fontWeight'] !== 'normal' && obj['fontWeight'] !== 'bold') {
      errors.push('fontWeight must be "normal" or "bold"');
    }
    if (typeof obj['color'] !== 'string') {
      errors.push('color must be a string');
    }
    if (typeof obj['opacity'] !== 'number') {
      errors.push('opacity must be a number');
    }
    if (typeof obj['outlineEnabled'] !== 'boolean') {
      errors.push('outlineEnabled must be a boolean');
    }
    if (typeof obj['outlineColor'] !== 'string') {
      errors.push('outlineColor must be a string');
    }
    if (typeof obj['outlineWidth'] !== 'number') {
      errors.push('outlineWidth must be a number');
    }
  } else if (obj['type'] === 'image') {
    // Validate image watermark config
    if (typeof obj['imageData'] !== 'string') {
      errors.push('imageData must be a string');
    }
    if (typeof obj['scale'] !== 'number') {
      errors.push('scale must be a number');
    }
    if (typeof obj['opacity'] !== 'number') {
      errors.push('opacity must be a number');
    }
    if (typeof obj['tileEnabled'] !== 'boolean') {
      errors.push('tileEnabled must be a boolean');
    }
    if (typeof obj['tileSpacingX'] !== 'number') {
      errors.push('tileSpacingX must be a number');
    }
    if (typeof obj['tileSpacingY'] !== 'number') {
      errors.push('tileSpacingY must be a number');
    }
  } else {
    errors.push('type must be "text" or "image"');
  }

  return errors;
}

/**
 * Validate watermark position object
 */
function validatePosition(position: unknown): string[] {
  const errors: string[] = [];

  if (typeof position !== 'object' || position === null) {
    return ['must be an object'];
  }

  const obj = position as Record<string, unknown>;

  if (typeof obj['presetPosition'] !== 'string') {
    errors.push('presetPosition must be a string');
  } else if (!VALID_PRESET_POSITIONS.includes(obj['presetPosition'] as string)) {
    errors.push(`presetPosition must be one of: ${VALID_PRESET_POSITIONS.join(', ')}`);
  }

  if (typeof obj['offsetX'] !== 'number') {
    errors.push('offsetX must be a number');
  }
  if (typeof obj['offsetY'] !== 'number') {
    errors.push('offsetY must be a number');
  }
  if (typeof obj['rotation'] !== 'number') {
    errors.push('rotation must be a number');
  }
  if (typeof obj['marginTop'] !== 'number') {
    errors.push('marginTop must be a number');
  }
  if (typeof obj['marginRight'] !== 'number') {
    errors.push('marginRight must be a number');
  }
  if (typeof obj['marginBottom'] !== 'number') {
    errors.push('marginBottom must be a number');
  }
  if (typeof obj['marginLeft'] !== 'number') {
    errors.push('marginLeft must be a number');
  }

  return errors;
}

/**
 * Check if a string is valid base64
 */
export function isValidBase64(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  // Handle data URLs
  if (str.startsWith('data:')) {
    const commaIndex = str.indexOf(',');
    if (commaIndex === -1) {
      return false;
    }
    str = str.slice(commaIndex + 1);
  }
  
  // Check base64 format
  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
}
