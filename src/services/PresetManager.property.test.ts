/**
 * Property-Based Tests for PresetManager Service
 * 
 * **Feature: manga-watermark-tool, Property 10: Preset Save/Load Round-Trip**
 * **Validates: Requirements 5.1, 5.2**
 * 
 * **Feature: manga-watermark-tool, Property 12: Preset Export/Import Round-Trip**
 * **Validates: Requirements 5.6, 5.7**
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { PresetManager } from './PresetManager';
import { arbWatermarkSettings, arbNonEmptyText, settingsAreEqual } from '@/test/helpers';

/**
 * Create a mock localStorage for testing
 */
function createMockStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() { return Object.keys(store).length; },
  };
}

describe('Property 10: Preset Save/Load Round-Trip', () => {
  let manager: PresetManager;
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = createMockStorage();
    manager = new PresetManager(mockStorage);
  });

  /**
   * **Feature: manga-watermark-tool, Property 10: Preset Save/Load Round-Trip**
   * **Validates: Requirements 5.1, 5.2**
   * 
   * For any valid watermark settings, saving as a preset and then loading 
   * that preset SHALL produce settings equivalent to the original.
   */
  it('should produce equivalent settings after save/load round-trip', () => {
    fc.assert(
      fc.property(
        arbNonEmptyText,
        arbWatermarkSettings,
        (name, settings) => {
          // Save preset
          const savedPreset = manager.save(name, settings);
          
          // Load preset
          const loadedPreset = manager.getById(savedPreset.id);
          
          expect(loadedPreset).not.toBeNull();
          expect(settingsAreEqual(settings, loadedPreset!.settings)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });


  /**
   * **Feature: manga-watermark-tool, Property 10: Preset Save/Load Round-Trip**
   * **Validates: Requirements 5.1, 5.2**
   * 
   * Saved preset name SHALL be preserved after loading.
   */
  it('should preserve preset name after save/load', () => {
    fc.assert(
      fc.property(
        arbNonEmptyText,
        arbWatermarkSettings,
        (name, settings) => {
          const savedPreset = manager.save(name, settings);
          const loadedPreset = manager.getById(savedPreset.id);
          
          expect(loadedPreset).not.toBeNull();
          expect(loadedPreset!.name).toBe(name.trim() || 'Untitled Preset');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 10: Preset Save/Load Round-Trip**
   * **Validates: Requirements 5.1, 5.2**
   * 
   * All saved presets SHALL be retrievable via getAll().
   */
  it('should include all saved presets in getAll()', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(arbNonEmptyText, arbWatermarkSettings), { minLength: 1, maxLength: 10 }),
        (presetData) => {
          // Clear any existing presets
          manager.clear();
          
          // Save multiple presets
          const savedIds = presetData.map(([name, settings]) => {
            return manager.save(name, settings).id;
          });
          
          // Get all presets
          const allPresets = manager.getAll();
          
          // All saved presets should be in the list
          expect(allPresets.length).toBe(savedIds.length);
          for (const id of savedIds) {
            expect(allPresets.some(p => p.id === id)).toBe(true);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 10: Preset Save/Load Round-Trip**
   * **Validates: Requirements 5.1, 5.2**
   * 
   * Settings SHALL be deeply cloned - modifying original should not affect saved preset.
   */
  it('should deeply clone settings on save', () => {
    fc.assert(
      fc.property(
        arbNonEmptyText,
        arbWatermarkSettings,
        (name, settings) => {
          const savedPreset = manager.save(name, settings);
          
          // Modify original settings
          if (settings.config.type === 'text') {
            settings.config.text = 'MODIFIED';
          }
          settings.position.offsetX = 99999;
          
          // Loaded preset should not be affected
          const loadedPreset = manager.getById(savedPreset.id);
          expect(loadedPreset!.settings.position.offsetX).not.toBe(99999);
        }
      ),
      { numRuns: 100 }
    );
  });
});


describe('Property 12: Preset Export/Import Round-Trip', () => {
  let manager: PresetManager;
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = createMockStorage();
    manager = new PresetManager(mockStorage);
  });

  /**
   * **Feature: manga-watermark-tool, Property 12: Preset Export/Import Round-Trip**
   * **Validates: Requirements 5.6, 5.7**
   * 
   * For any collection of presets, exporting to JSON and then importing 
   * that JSON SHALL produce a collection equivalent to the original.
   */
  it('should produce equivalent presets after export/import round-trip', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(arbNonEmptyText, arbWatermarkSettings), { minLength: 1, maxLength: 5 }),
        (presetData) => {
          // Clear and save presets
          manager.clear();
          const originalPresets = presetData.map(([name, settings]) => {
            return manager.save(name, settings);
          });
          
          // Export to JSON
          const exportedJson = manager.exportToJson();
          
          // Create new manager and import
          const newManager = new PresetManager(createMockStorage());
          const importedPresets = newManager.importFromJson(exportedJson);
          
          // Should have same number of presets
          expect(importedPresets.length).toBe(originalPresets.length);
          
          // Each imported preset should have equivalent settings
          for (let i = 0; i < originalPresets.length; i++) {
            const original = originalPresets[i];
            if (!original) continue;
            const imported = importedPresets.find(p => p.name === original.name);
            
            expect(imported).toBeDefined();
            expect(settingsAreEqual(original.settings, imported!.settings)).toBe(true);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 12: Preset Export/Import Round-Trip**
   * **Validates: Requirements 5.6, 5.7**
   * 
   * Exported JSON SHALL be valid JSON.
   */
  it('should produce valid JSON when exporting', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(arbNonEmptyText, arbWatermarkSettings), { minLength: 0, maxLength: 5 }),
        (presetData) => {
          manager.clear();
          presetData.forEach(([name, settings]) => {
            manager.save(name, settings);
          });
          
          const exportedJson = manager.exportToJson();
          
          // Should not throw when parsing
          expect(() => JSON.parse(exportedJson)).not.toThrow();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 12: Preset Export/Import Round-Trip**
   * **Validates: Requirements 5.6, 5.7**
   * 
   * Import SHALL generate new IDs to avoid conflicts.
   */
  it('should generate new IDs on import', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(arbNonEmptyText, arbWatermarkSettings), { minLength: 1, maxLength: 3 }),
        (presetData) => {
          manager.clear();
          const originalPresets = presetData.map(([name, settings]) => {
            return manager.save(name, settings);
          });
          
          const exportedJson = manager.exportToJson();
          
          // Import into same manager
          const importedPresets = manager.importFromJson(exportedJson);
          
          // Imported presets should have different IDs
          for (const imported of importedPresets) {
            const hasOriginalId = originalPresets.some(p => p.id === imported.id);
            expect(hasOriginalId).toBe(false);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 12: Preset Export/Import Round-Trip**
   * **Validates: Requirements 5.6, 5.7**
   * 
   * Import SHALL throw error for invalid JSON.
   */
  it('should throw error for invalid JSON on import', () => {
    const invalidJsonStrings = [
      'not json',
      '{"invalid": true}',
      '{"presets": "not an array"}',
    ];

    for (const invalidJson of invalidJsonStrings) {
      expect(() => manager.importFromJson(invalidJson)).toThrow();
    }
  });

  /**
   * **Feature: manga-watermark-tool, Property 12: Preset Export/Import Round-Trip**
   * **Validates: Requirements 5.6, 5.7**
   * 
   * Import of empty array SHALL return empty array without throwing.
   */
  it('should handle empty array import gracefully', () => {
    const emptyExport = JSON.stringify({ version: 1, presets: [] });
    const imported = manager.importFromJson(emptyExport);
    expect(imported).toHaveLength(0);
  });
});
