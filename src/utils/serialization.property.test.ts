/**
 * Property-Based Tests for Serialization Utilities
 * 
 * **Feature: manga-watermark-tool, Property 19: Serialization Round-Trip**
 * **Validates: Requirements 9.1, 9.2, 9.5**
 * 
 * **Feature: manga-watermark-tool, Property 20: Serialization Validation**
 * **Validates: Requirements 9.4**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  serializeWatermarkSettings,
  deserializeWatermarkSettings,
  validateSettingsJson,
  SerializationValidationError,
} from './serialization';
import { arbWatermarkSettings, settingsAreEqual } from '@/test/helpers';

describe('Property 19: Serialization Round-Trip', () => {
  /**
   * **Feature: manga-watermark-tool, Property 19: Serialization Round-Trip**
   * **Validates: Requirements 9.1, 9.2, 9.5**
   * 
   * For any valid WatermarkSettings object, serializing to JSON and 
   * deserializing back SHALL produce an object equivalent to the original.
   */
  it('should produce equivalent settings after serialize/deserialize round-trip', () => {
    fc.assert(
      fc.property(arbWatermarkSettings, (settings) => {
        const serialized = serializeWatermarkSettings(settings);
        const deserialized = deserializeWatermarkSettings(serialized);
        
        // Deep equality check
        expect(settingsAreEqual(settings, deserialized)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 19: Serialization Round-Trip**
   * **Validates: Requirements 9.1, 9.2, 9.5**
   * 
   * Serialization SHALL produce valid JSON.
   */
  it('should produce valid JSON when serializing', () => {
    fc.assert(
      fc.property(arbWatermarkSettings, (settings) => {
        const serialized = serializeWatermarkSettings(settings);
        
        // Should not throw when parsing
        expect(() => JSON.parse(serialized)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });


  /**
   * **Feature: manga-watermark-tool, Property 19: Serialization Round-Trip**
   * **Validates: Requirements 9.1, 9.2, 9.5**
   * 
   * Deserialized settings SHALL have all required fields.
   */
  it('should preserve all fields after round-trip', () => {
    fc.assert(
      fc.property(arbWatermarkSettings, (settings) => {
        const serialized = serializeWatermarkSettings(settings);
        const deserialized = deserializeWatermarkSettings(serialized);
        
        // Check all top-level fields exist
        expect(deserialized).toHaveProperty('config');
        expect(deserialized).toHaveProperty('position');
        expect(deserialized).toHaveProperty('enabled');
        
        // Check config type is preserved
        expect(deserialized.config.type).toBe(settings.config.type);
        
        // Check position fields
        expect(deserialized.position.presetPosition).toBe(settings.position.presetPosition);
        expect(deserialized.position.offsetX).toBe(settings.position.offsetX);
        expect(deserialized.position.offsetY).toBe(settings.position.offsetY);
        expect(deserialized.position.rotation).toBe(settings.position.rotation);
        
        // Check enabled
        expect(deserialized.enabled).toBe(settings.enabled);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 19: Serialization Round-Trip**
   * **Validates: Requirements 9.1, 9.2, 9.5**
   * 
   * Multiple round-trips SHALL produce identical results.
   */
  it('should be idempotent - multiple round-trips produce same result', () => {
    fc.assert(
      fc.property(arbWatermarkSettings, (settings) => {
        const serialized1 = serializeWatermarkSettings(settings);
        const deserialized1 = deserializeWatermarkSettings(serialized1);
        
        const serialized2 = serializeWatermarkSettings(deserialized1);
        const deserialized2 = deserializeWatermarkSettings(serialized2);
        
        expect(settingsAreEqual(deserialized1, deserialized2)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 20: Serialization Validation', () => {
  /**
   * **Feature: manga-watermark-tool, Property 20: Serialization Validation**
   * **Validates: Requirements 9.4**
   * 
   * For any JSON string that is missing required fields or contains invalid values,
   * deserialization SHALL throw a validation error.
   */
  it('should reject JSON missing required config field', () => {
    fc.assert(
      fc.property(arbWatermarkSettings, (settings) => {
        const serialized = serializeWatermarkSettings(settings);
        const parsed = JSON.parse(serialized);
        delete parsed.config;
        const invalidJson = JSON.stringify(parsed);
        
        expect(() => deserializeWatermarkSettings(invalidJson)).toThrow(SerializationValidationError);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 20: Serialization Validation**
   * **Validates: Requirements 9.4**
   */
  it('should reject JSON missing required position field', () => {
    fc.assert(
      fc.property(arbWatermarkSettings, (settings) => {
        const serialized = serializeWatermarkSettings(settings);
        const parsed = JSON.parse(serialized);
        delete parsed.position;
        const invalidJson = JSON.stringify(parsed);
        
        expect(() => deserializeWatermarkSettings(invalidJson)).toThrow(SerializationValidationError);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 20: Serialization Validation**
   * **Validates: Requirements 9.4**
   */
  it('should reject JSON missing required enabled field', () => {
    fc.assert(
      fc.property(arbWatermarkSettings, (settings) => {
        const serialized = serializeWatermarkSettings(settings);
        const parsed = JSON.parse(serialized);
        delete parsed.enabled;
        const invalidJson = JSON.stringify(parsed);
        
        expect(() => deserializeWatermarkSettings(invalidJson)).toThrow(SerializationValidationError);
      }),
      { numRuns: 100 }
    );
  });


  /**
   * **Feature: manga-watermark-tool, Property 20: Serialization Validation**
   * **Validates: Requirements 9.4**
   */
  it('should reject invalid JSON syntax', () => {
    const invalidJsonStrings = [
      '{invalid}',
      '{"config":}',
      'not json at all',
      '',
      '{"config": {"type": "text"',
    ];

    for (const invalidJson of invalidJsonStrings) {
      expect(() => deserializeWatermarkSettings(invalidJson)).toThrow(SerializationValidationError);
    }
  });

  /**
   * **Feature: manga-watermark-tool, Property 20: Serialization Validation**
   * **Validates: Requirements 9.4**
   */
  it('should reject JSON with invalid config type', () => {
    fc.assert(
      fc.property(arbWatermarkSettings, (settings) => {
        const serialized = serializeWatermarkSettings(settings);
        const parsed = JSON.parse(serialized);
        parsed.config.type = 'invalid_type';
        const invalidJson = JSON.stringify(parsed);
        
        expect(() => deserializeWatermarkSettings(invalidJson)).toThrow(SerializationValidationError);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 20: Serialization Validation**
   * **Validates: Requirements 9.4**
   */
  it('should reject JSON with invalid presetPosition', () => {
    fc.assert(
      fc.property(arbWatermarkSettings, (settings) => {
        const serialized = serializeWatermarkSettings(settings);
        const parsed = JSON.parse(serialized);
        parsed.position.presetPosition = 'invalid_position';
        const invalidJson = JSON.stringify(parsed);
        
        expect(() => deserializeWatermarkSettings(invalidJson)).toThrow(SerializationValidationError);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 20: Serialization Validation**
   * **Validates: Requirements 9.4**
   */
  it('should reject JSON with wrong type for enabled field', () => {
    fc.assert(
      fc.property(arbWatermarkSettings, (settings) => {
        const serialized = serializeWatermarkSettings(settings);
        const parsed = JSON.parse(serialized);
        parsed.enabled = 'not_a_boolean';
        const invalidJson = JSON.stringify(parsed);
        
        expect(() => deserializeWatermarkSettings(invalidJson)).toThrow(SerializationValidationError);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 20: Serialization Validation**
   * **Validates: Requirements 9.4**
   * 
   * validateSettingsJson SHALL return valid=true for properly serialized settings.
   */
  it('should validate correctly serialized settings as valid', () => {
    fc.assert(
      fc.property(arbWatermarkSettings, (settings) => {
        const serialized = serializeWatermarkSettings(settings);
        const result = validateSettingsJson(serialized);
        
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 20: Serialization Validation**
   * **Validates: Requirements 9.4**
   * 
   * validateSettingsJson SHALL return valid=false with errors for invalid JSON.
   */
  it('should return errors for invalid JSON', () => {
    const result = validateSettingsJson('not valid json');
    
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
