/**
 * PresetManager Service
 * Manages watermark presets with CRUD operations and localStorage persistence
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

import type { Preset, WatermarkSettings } from '@/types';
import { isPreset } from '@/types';
import {
  serializeWatermarkSettings,
  deserializeWatermarkSettings,
} from '@/utils/serialization';

/**
 * Storage key for presets in localStorage
 */
const STORAGE_KEY = 'manga-watermark-presets';

/**
 * Generate a unique ID for presets
 */
function generateId(): string {
  return `preset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * PresetManager class for managing watermark presets
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */
export class PresetManager {
  private presets: Map<string, Preset> = new Map();
  private storage: Storage | null;

  constructor(storage: Storage | null = typeof localStorage !== 'undefined' ? localStorage : null) {
    this.storage = storage;
    this.loadFromStorage();
  }

  /**
   * Load presets from localStorage
   * Requirements: 5.5
   */
  private loadFromStorage(): void {
    if (!this.storage) return;

    try {
      const stored = this.storage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (isPreset(item)) {
              this.presets.set(item.id, item);
            }
          }
        }
      }
    } catch {
      // If loading fails, start with empty presets
      console.warn('Failed to load presets from storage');
    }
  }


  /**
   * Save presets to localStorage
   * Requirements: 5.5
   */
  private saveToStorage(): void {
    if (!this.storage) return;

    try {
      const presetsArray = Array.from(this.presets.values());
      this.storage.setItem(STORAGE_KEY, JSON.stringify(presetsArray));
    } catch {
      console.warn('Failed to save presets to storage');
    }
  }

  /**
   * Get all presets
   * @returns Array of all presets
   */
  getAll(): Preset[] {
    return Array.from(this.presets.values());
  }

  /**
   * Get preset by ID
   * @param id - Preset ID
   * @returns Preset or null if not found
   */
  getById(id: string): Preset | null {
    return this.presets.get(id) ?? null;
  }

  /**
   * Save new preset
   * Requirements: 5.1
   * 
   * @param name - Preset name
   * @param settings - Watermark settings to save
   * @returns Created preset
   */
  save(name: string, settings: WatermarkSettings): Preset {
    const now = Date.now();
    const preset: Preset = {
      id: generateId(),
      name: name.trim() || 'Untitled Preset',
      settings: structuredClone(settings),
      createdAt: now,
      updatedAt: now,
    };

    this.presets.set(preset.id, preset);
    this.saveToStorage();

    return preset;
  }

  /**
   * Update existing preset
   * Requirements: 5.3
   * 
   * @param id - Preset ID to update
   * @param updates - Partial preset updates
   * @returns Updated preset
   * @throws Error if preset not found
   */
  update(id: string, updates: Partial<Pick<Preset, 'name' | 'settings'>>): Preset {
    const existing = this.presets.get(id);
    if (!existing) {
      throw new Error(`Preset with id "${id}" not found`);
    }

    const updated: Preset = {
      ...existing,
      name: updates.name !== undefined ? updates.name.trim() || existing.name : existing.name,
      settings: updates.settings !== undefined ? structuredClone(updates.settings) : existing.settings,
      updatedAt: Date.now(),
    };

    this.presets.set(id, updated);
    this.saveToStorage();

    return updated;
  }

  /**
   * Delete preset
   * Requirements: 5.4
   * 
   * @param id - Preset ID to delete
   * @returns true if deleted, false if not found
   */
  delete(id: string): boolean {
    const deleted = this.presets.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }


  /**
   * Export all presets to JSON string
   * Requirements: 5.6
   * 
   * @returns JSON string containing all presets
   */
  exportToJson(): string {
    const presetsArray = Array.from(this.presets.values());
    return JSON.stringify({
      version: 1,
      exportedAt: Date.now(),
      presets: presetsArray,
    }, null, 2);
  }

  /**
   * Import presets from JSON string
   * Requirements: 5.7
   * 
   * @param json - JSON string containing presets
   * @returns Array of imported presets
   * @throws Error if JSON is invalid
   */
  importFromJson(json: string): Preset[] {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error('Invalid JSON format');
    }

    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Invalid preset export format');
    }

    const obj = parsed as Record<string, unknown>;
    let presetsToImport: unknown[];

    // Handle both array format and object with presets field
    if (Array.isArray(obj)) {
      presetsToImport = obj;
    } else if (Array.isArray(obj['presets'])) {
      presetsToImport = obj['presets'];
    } else {
      throw new Error('Invalid preset export format: missing presets array');
    }

    const importedPresets: Preset[] = [];
    const now = Date.now();

    for (const item of presetsToImport) {
      if (isPreset(item)) {
        // Generate new ID to avoid conflicts
        const newPreset: Preset = {
          ...item,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        this.presets.set(newPreset.id, newPreset);
        importedPresets.push(newPreset);
      }
    }

    if (importedPresets.length > 0) {
      this.saveToStorage();
    }

    return importedPresets;
  }

  /**
   * Serialize watermark settings to JSON
   * Requirements: 9.1
   * 
   * @param settings - Settings to serialize
   * @returns JSON string
   */
  serialize(settings: WatermarkSettings): string {
    return serializeWatermarkSettings(settings);
  }

  /**
   * Deserialize watermark settings from JSON
   * Requirements: 9.2
   * 
   * @param json - JSON string to deserialize
   * @returns Deserialized settings
   * @throws SerializationValidationError if invalid
   */
  deserialize(json: string): WatermarkSettings {
    return deserializeWatermarkSettings(json);
  }

  /**
   * Clear all presets (useful for testing)
   */
  clear(): void {
    this.presets.clear();
    this.saveToStorage();
  }

  /**
   * Get the number of presets
   */
  get count(): number {
    return this.presets.size;
  }
}

/**
 * Default PresetManager instance
 */
export const presetManager = new PresetManager();
