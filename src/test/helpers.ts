import * as fc from 'fast-check'
import type {
  TextWatermarkConfig,
  ImageWatermarkConfig,
  WatermarkPosition,
  WatermarkSettings,
  Preset,
  ExportFormat,
  ExportSettings,
  PresetPosition,
} from '@/types'

/**
 * Arbitrary generators for property-based testing
 */

// Preset positions
export const presetPositions: PresetPosition[] = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
]

// Generate valid preset position
export const arbPresetPosition = fc.constantFrom(...presetPositions)

// Generate valid hex color
export const arbHexColor = fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`)

// Generate valid opacity (0-100)
export const arbOpacity = fc.integer({ min: 0, max: 100 })

// Generate valid font size (8-200)
export const arbFontSize = fc.integer({ min: 8, max: 200 })

// Generate valid scale (0.1-5)
export const arbScale = fc.float({ min: Math.fround(0.1), max: Math.fround(5), noNaN: true })

// Generate valid rotation (0-360)
export const arbRotation = fc.integer({ min: 0, max: 360 })

// Generate valid margin (0-500)
export const arbMargin = fc.integer({ min: 0, max: 500 })

// Generate valid offset (-1000 to 1000)
export const arbOffset = fc.integer({ min: -1000, max: 1000 })

// Generate valid font family
export const arbFontFamily = fc.constantFrom(
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
)

// Generate valid font weight
export const arbFontWeight = fc.constantFrom('normal' as const, 'bold' as const)

// Generate non-empty text
export const arbNonEmptyText = fc.string({ minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length > 0)

// Generate text watermark config
export const arbTextWatermarkConfig: fc.Arbitrary<TextWatermarkConfig> = fc.record({
  type: fc.constant('text' as const),
  text: arbNonEmptyText,
  fontFamily: arbFontFamily,
  fontSize: arbFontSize,
  fontWeight: arbFontWeight,
  color: arbHexColor,
  opacity: arbOpacity,
  outlineEnabled: fc.boolean(),
  outlineColor: arbHexColor,
  outlineWidth: fc.integer({ min: 1, max: 10 }),
})

// Generate base64 image data (simplified for testing)
export const arbBase64Image = fc.constant('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')

// Generate image watermark config
export const arbImageWatermarkConfig: fc.Arbitrary<ImageWatermarkConfig> = fc.record({
  type: fc.constant('image' as const),
  imageData: arbBase64Image,
  scale: arbScale,
  opacity: arbOpacity,
  tileEnabled: fc.boolean(),
  tileSpacingX: fc.integer({ min: 0, max: 200 }),
  tileSpacingY: fc.integer({ min: 0, max: 200 }),
})

// Generate watermark config (either text or image)
export const arbWatermarkConfig = fc.oneof(arbTextWatermarkConfig, arbImageWatermarkConfig)

// Generate watermark position
export const arbWatermarkPosition: fc.Arbitrary<WatermarkPosition> = fc.record({
  presetPosition: fc.oneof(arbPresetPosition, fc.constant('custom' as const)),
  offsetX: arbOffset,
  offsetY: arbOffset,
  rotation: arbRotation,
  marginTop: arbMargin,
  marginRight: arbMargin,
  marginBottom: arbMargin,
  marginLeft: arbMargin,
})

// Generate watermark settings
export const arbWatermarkSettings: fc.Arbitrary<WatermarkSettings> = fc.record({
  config: arbWatermarkConfig,
  position: arbWatermarkPosition,
  enabled: fc.boolean(),
})

// Generate preset
export const arbPreset: fc.Arbitrary<Preset> = fc.record({
  id: fc.uuid(),
  name: arbNonEmptyText,
  settings: arbWatermarkSettings,
  createdAt: fc.integer({ min: 0, max: Date.now() }),
  updatedAt: fc.integer({ min: 0, max: Date.now() }),
})

// Generate export format
export const arbExportFormat: fc.Arbitrary<ExportFormat> = fc.constantFrom('jpg', 'png', 'webp')

// Generate export settings
export const arbExportSettings: fc.Arbitrary<ExportSettings> = fc.record({
  format: arbExportFormat,
  quality: fc.integer({ min: 1, max: 100 }),
  filenamePrefix: fc.string({ maxLength: 50 }),
  filenameSuffix: fc.string({ maxLength: 50 }),
  preserveOriginalName: fc.boolean(),
})

// Generate valid image file extension
export const arbValidImageExtension = fc.constantFrom('jpg', 'jpeg', 'png', 'webp', 'gif')

// Generate invalid file extension
export const arbInvalidExtension = fc.string({ minLength: 1, maxLength: 10 })
  .filter(s => !['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(s.toLowerCase()))

// Generate filename with extension
export const arbFilename = (ext: fc.Arbitrary<string>) =>
  fc.tuple(
    fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0 && !s.includes('.')),
    ext
  ).map(([name, extension]) => `${name}.${extension}`)

// Generate valid image filename
export const arbValidImageFilename = arbFilename(arbValidImageExtension)

// Generate invalid image filename
export const arbInvalidImageFilename = arbFilename(arbInvalidExtension)

// Generate canvas dimensions
export const arbCanvasDimensions = fc.record({
  width: fc.integer({ min: 1, max: 4000 }),
  height: fc.integer({ min: 1, max: 4000 }),
})

// Generate watermark dimensions
export const arbWatermarkDimensions = fc.record({
  width: fc.integer({ min: 1, max: 500 }),
  height: fc.integer({ min: 1, max: 500 }),
})

/**
 * Helper functions for tests
 */

// Create a mock File object
export function createMockFile(
  name: string,
  type: string,
  _size: number = 1024
): File {
  const blob = new Blob([''], { type })
  return new File([blob], name, { type })
}

// Create a mock image file
export function createMockImageFile(
  name: string,
  format: 'jpg' | 'jpeg' | 'png' | 'webp' | 'gif' = 'png'
): File {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
  }
  return createMockFile(name, mimeTypes[format] ?? 'image/png')
}

// Deep equality check for watermark settings
export function settingsAreEqual(a: WatermarkSettings, b: WatermarkSettings): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

// Deep equality check for presets
export function presetsAreEqual(a: Preset, b: Preset): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
