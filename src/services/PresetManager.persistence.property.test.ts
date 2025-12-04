/**
 * Property-Based Tests for Preset Persistence
 * 
 * **Feature: manga-watermark-tool, Property 11: Preset Persistence**
 * **Validates: Requirements 5.5**
 * 
 * For any preset saved to storage, after simulated application restart,
 * the preset SHALL be retrievable with all original settings intact.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { PresetManager } from './PresetManager';
import { arbWatermarkSettings, arbNonEmptyText, settingsAreEqual } from '@/test/helpers';

/**
 * Create a mock localStorage for testing
 * This simulates browser localStorage behavior
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

describe('Property 11: Preset Persistence', () => {
  let sharedStorage: Storage;

  beforeEach(() => {
    // Create fresh shared storage for each test
    sharedStorage = createMockStorage();
  });

  /**
   * **Feature: manga-watermark-tool, Property 11: Preset Persistence**
   * **Validates: Requirements 5.5**
   * 
   * For any preset saved to storage, after simulated application restart,
   * the preset SHALL be retrievable with all original settings intact.
   */
  it('should persist presets across simulated application restarts', () => {
    fc.assert(
      fc.property(
        arbNonEmptyText,
        arbWatermarkSettings,
        (name, settings) => {
          // Simulate first session: create manager and save preset
          const manager1 = new PresetManager(sharedStorage);
          const savedPreset = manager1.save(name, settings);
          
          // Simulate application restart: create new manager with same storage
          const manager2 = new PresetManager(sharedStorage);
          
          // Preset should be retrievable after "restart"
          const loadedPreset = manager2.getById(savedPreset.id);
          
          expect(loadedPreset).not.toBeNull();
          expect(loadedPreset!.id).toBe(savedPreset.id);
          expect(loadedPreset!.name).toBe(savedPreset.name);
          expect(settingsAreEqual(loadedPreset!.settings, settings)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 11: Preset Persistence**
   * **Validates: Requirements 5.5**
   * 
   * Multiple presets saved across sessions SHALL all be retrievable.
   */
  it('should persist multiple presets across sessions', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(arbNonEmptyText, arbWatermarkSettings), { minLength: 1, maxLength: 10 }),
        (presetData) => {
          // First session: save all presets
          const manager1 = new PresetManager(sharedStorage);
          manager1.clear(); // Start fresh
          
          const savedPresets = presetData.map(([name, settings]) => {
            return manager1.save(name, settings);
          });
          
          // Simulate restart
          const manager2 = new PresetManager(sharedStorage);
          
          // All presets should be retrievable
          const allPresets = manager2.getAll();
          expect(allPresets.length).toBe(savedPresets.length);
          
          for (const saved of savedPresets) {
            const loaded = manager2.getById(saved.id);
            expect(loaded).not.toBeNull();
            expect(settingsAreEqual(loaded!.settings, saved.settings)).toBe(true);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 11: Preset Persistence**
   * **Validates: Requirements 5.5**
   * 
   * Preset updates SHALL persist across application restarts.
   */
  it('should persist preset updates across restarts', () => {
    fc.assert(
      fc.property(
        arbNonEmptyText,
        arbWatermarkSettings,
        arbNonEmptyText,
        arbWatermarkSettings,
        (name1, settings1, name2, settings2) => {
          // First session: save preset
          const manager1 = new PresetManager(sharedStorage);
          manager1.clear();
          const savedPreset = manager1.save(name1, settings1);
          
          // Update the preset
          manager1.update(savedPreset.id, { name: name2, settings: settings2 });
          
          // Simulate restart
          const manager2 = new PresetManager(sharedStorage);
          
          // Updated values should persist
          const loadedPreset = manager2.getById(savedPreset.id);
          expect(loadedPreset).not.toBeNull();
          expect(loadedPreset!.name).toBe(name2.trim() || name1.trim() || 'Untitled Preset');
          expect(settingsAreEqual(loadedPreset!.settings, settings2)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 11: Preset Persistence**
   * **Validates: Requirements 5.5**
   * 
   * Preset deletions SHALL persist across application restarts.
   */
  it('should persist preset deletions across restarts', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(arbNonEmptyText, arbWatermarkSettings), { minLength: 2, maxLength: 5 }),
        fc.integer({ min: 0, max: 4 }),
        (presetData, deleteIndex) => {
          // First session: save presets
          const manager1 = new PresetManager(sharedStorage);
          manager1.clear();
          
          const savedPresets = presetData.map(([name, settings]) => {
            return manager1.save(name, settings);
          });
          
          // Delete one preset
          const indexToDelete = deleteIndex % savedPresets.length;
          const presetToDelete = savedPresets[indexToDelete];
          if (!presetToDelete) return; // Guard for TypeScript
          const deletedId = presetToDelete.id;
          manager1.delete(deletedId);
          
          // Simulate restart
          const manager2 = new PresetManager(sharedStorage);
          
          // Deleted preset should not exist
          expect(manager2.getById(deletedId)).toBeNull();
          
          // Other presets should still exist
          const remainingPresets = savedPresets.filter((_, i) => i !== indexToDelete);
          for (const preset of remainingPresets) {
            expect(manager2.getById(preset.id)).not.toBeNull();
          }
          
          // Total count should be correct
          expect(manager2.getAll().length).toBe(savedPresets.length - 1);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 11: Preset Persistence**
   * **Validates: Requirements 5.5**
   * 
   * Imported presets SHALL persist across application restarts.
   */
  it('should persist imported presets across restarts', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(arbNonEmptyText, arbWatermarkSettings), { minLength: 1, maxLength: 5 }),
        (presetData) => {
          // Create presets in a separate manager for export
          const exportManager = new PresetManager(createMockStorage());
          presetData.forEach(([name, settings]) => {
            exportManager.save(name, settings);
          });
          const exportedJson = exportManager.exportToJson();
          
          // First session: import presets
          const manager1 = new PresetManager(sharedStorage);
          manager1.clear();
          const importedPresets = manager1.importFromJson(exportedJson);
          
          // Simulate restart
          const manager2 = new PresetManager(sharedStorage);
          
          // All imported presets should persist
          expect(manager2.getAll().length).toBe(importedPresets.length);
          
          for (const imported of importedPresets) {
            const loaded = manager2.getById(imported.id);
            expect(loaded).not.toBeNull();
            expect(settingsAreEqual(loaded!.settings, imported.settings)).toBe(true);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 11: Preset Persistence**
   * **Validates: Requirements 5.5**
   * 
   * Timestamps SHALL be preserved across application restarts.
   */
  it('should preserve timestamps across restarts', () => {
    fc.assert(
      fc.property(
        arbNonEmptyText,
        arbWatermarkSettings,
        (name, settings) => {
          // First session: save preset
          const manager1 = new PresetManager(sharedStorage);
          manager1.clear();
          const savedPreset = manager1.save(name, settings);
          
          // Simulate restart
          const manager2 = new PresetManager(sharedStorage);
          
          // Timestamps should be preserved
          const loadedPreset = manager2.getById(savedPreset.id);
          expect(loadedPreset).not.toBeNull();
          expect(loadedPreset!.createdAt).toBe(savedPreset.createdAt);
          expect(loadedPreset!.updatedAt).toBe(savedPreset.updatedAt);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: manga-watermark-tool, Property 11: Preset Persistence**
   * **Validates: Requirements 5.5**
   * 
   * Empty storage SHALL result in empty preset list on load.
   */
  it('should handle empty storage gracefully', () => {
    // Create manager with empty storage
    const manager = new PresetManager(sharedStorage);
    
    // Should have no presets
    expect(manager.getAll()).toHaveLength(0);
    expect(manager.count).toBe(0);
  });

  /**
   * **Feature: manga-watermark-tool, Property 11: Preset Persistence**
   * **Validates: Requirements 5.5**
   * 
   * Corrupted storage data SHALL be handled gracefully.
   */
  it('should handle corrupted storage data gracefully', () => {
    // Corrupt the storage
    sharedStorage.setItem('manga-watermark-presets', 'not valid json');
    
    // Creating manager should not throw
    expect(() => new PresetManager(sharedStorage)).not.toThrow();
    
    // Should start with empty presets
    const manager = new PresetManager(sharedStorage);
    expect(manager.getAll()).toHaveLength(0);
  });
});
