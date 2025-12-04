# 🎨 Manga Watermark Tool
🌐 **Language / Bahasa:** [Indonesian](README.md) | **English**

<div align="center">

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0.1-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.15-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**A web application for batch adding watermarks to manga images with comprehensive features.**

[Demo](#demo) • [Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [API](#-api-reference)

</div>

---

## 📸 Screenshots

<div align="center">

| AI Text-to-Image Edit | AI Inpainting | AI Image Enhancement |
|:---:|:---:|:---:|
| <img src="https://i.ibb.co.com/0pFwdZpg/aiedit-test-tl.png" width="250" alt="AI Text-to-Image Edit"/> | <img src="https://i.ibb.co.com/B24dxTpD/inpaint-testai.png" width="250" alt="AI Inpainting"/> | <img src="https://i.ibb.co.com/8DwVxmpC/aiedit-test.png" width="250" alt="AI Image Enhancement"/> |

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Contributing](#-contributing)

---

## ✨ Features

### 🖼️ Watermark
- **Text Watermark** - Add text with customizable font, size, color, and opacity
- **Image Watermark** - Use logo/image as watermark
- **9 Position Presets** - Top-left, top-center, top-right, middle-left, center, middle-right, bottom-left, bottom-center, bottom-right
- **Custom Offset** - Manually adjust X/Y position (pixels or percentage)
- **Rotation** - Rotate watermark 0-360 degrees
- **Opacity Control** - Adjust transparency 0-100%

### 🔧 Tools
- **Image Cropping** - Crop images with preset aspect ratios (16:9, 4:3, 1:1, Free)
- **Compression Presets** - Web (WEBP 80%), Print (PNG 100%), Archive (PNG Lossless), Custom
- **Batch Rename** - Rename files with pattern variables: `{chapter}`, `{page}`, `{original}`, `{date}`, `{index}`

### 🤖 AI Image Editing (Still in the testing phase.)
- **AI Image Enhancement** - Upscale 2x, Denoise, Sharpen, Auto Enhance to improve manga image quality
- **AI Background Removal** - Automatically remove background with transparent or solid color options
- **AI Inpainting** - Remove unwanted objects/text and AI will fill with appropriate content
- **AI Text-to-Image Edit** - Edit images with natural language prompts (e.g., "Remove text in the marked area")
- **Mask Drawing Tools** - Brush, Rectangle, Lasso, Eraser to mark areas for AI editing
- **Before/After Preview** - View comparison before and after AI editing
- **Regenerate Option** - Not satisfied?  Regenerate with one click

### 💾 Preset System
- **Save/Load Presets** - Save watermark configurations for reuse
- **LocalStorage Persistence** - Presets are automatically saved in the browser
- **Import/Export** - Backup and restore presets in JSON format

### 📤 Export
- **Multiple Formats** - PNG, JPEG, WEBP
- **Quality Control** - Adjust output quality 1-100%
- **Batch Export** - Export all images at once in ZIP
- **Individual Export** - Export images one by one

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend Framework** | React 18.3.1 |
| **Language** | TypeScript 5.6.2 |
| **Build Tool** | Vite 6.0.1 |
| **Styling** | TailwindCSS 3.4.15 |
| **State Management** | React Context API |
| **Testing** | Vitest + fast-check (Property-Based Testing) |
| **Linting** | ESLint 9.15.0 |
| **ZIP Generation** | JSZip 3.10.1 |

---

## 🚀 Installation

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 or **yarn** >= 1.22.0

### Clone Repository

```bash
git clone https://github. com/HikiNarou/Manga-Watermark-Tool.git
cd Manga-Watermark-Tool
```

### Install Dependencies

```bash
npm install
# or
yarn install
```

### Development Server

```bash
npm run dev
# or
yarn dev
```

The application will run at `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
```

Output will be in the `dist/` folder

### Preview Production Build

```bash
npm run preview
```

---

## 📖 Usage

### 1. Upload Images

1. Click the upload area or drag & drop images
2.  Supported formats: PNG, JPEG, WEBP, GIF
3. Multiple upload supported

### 2.  Configure Watermark

#### Text Watermark
```
Tab: Watermark → Text
- Text: Enter watermark text
- Font Family: Arial, Times New Roman, etc.
- Font Size: 12-200px
- Color: Choose color with color picker
- Opacity: 0-100%
- Rotation: 0-360°
```

#### Image Watermark
```
Tab: Watermark → Image
- Upload watermark image (PNG with transparency recommended)
- Scale: 10-200%
- Opacity: 0-100%
- Rotation: 0-360°
```

### 3. Set Position

```
Tab: Watermark → Position
- Choose from 9 position presets, or
- Use Custom with X/Y offset
- Unit: Pixels or Percentage
```

### 4. Tools (Optional)

#### Image Cropping
```
Tab: Tools → Image Cropping
1. Enable "Crop Image"
2. Select Aspect Ratio: Free, 1:1, 4:3, 16:9
3.  Manually adjust crop region if needed
4. Click "Apply Crop"
```

#### Compression Presets
```
Tab: Tools → Compression Presets
- Web: WEBP, Quality 80%, Max Width 1920px
- Print: PNG, Quality 100%, Original Size
- Archive: PNG, Lossless, Original Size
- Custom: Manual configuration
```

#### Batch Rename
```
Tab: Tools → Batch Rename
1. Enable "Batch Rename"
2. Enter pattern, e.g.: "Chapter_{chapter}_Page_{page}"
3. Set Chapter Number and Start Page
4. Preview rename results

Variables:
- {chapter} → Chapter number
- {page} → Page number (zero-padded)
- {original} → Original filename
- {date} → Date (YYYY-MM-DD)
- {index} → File index (1, 2, 3, ...)
```

### 5. Save Preset (Optional)

```
Tab: Presets
1. Configure watermark as desired
2. Click "Save Preset"
3. Name the preset
4.  Preset is saved to localStorage
```

### 6. Export

```
Tab: Export
1. Select format: PNG, JPEG, or WEBP
2.  Adjust quality (for JPEG/WEBP)
3. Click "Export All" for batch export (ZIP)
4. Or click "Export Current" to export selected image
```

---

## 🏗️ Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         App. tsx                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    AppProvider                           │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │              AppContext (State)                  │    │    │
│  │  │  - images: ImageData[]                          │    │    │
│  │  │  - selectedImageId: string                      │    │    │
│  │  │  - watermarkConfig: WatermarkConfig             │    │    │
│  │  │  - exportSettings: ExportSettings               │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌──────────┐       ┌──────────┐       ┌──────────┐
    │  Hooks   │       │Components│       │ Services │
    └──────────┘       └──────────┘       └──────────┘
```

### Data Flow

```
User Action → Component → Hook → Context → Service → Canvas API
                                    │
                                    ▼
                              State Update
                                    │
                                    ▼
                            Re-render Components
```

### State Management

The application uses **React Context API** with the following pattern:

```typescript
// Context Structure
interface AppState {
  images: ImageData[];
  selectedImageId: string | null;
  watermarkConfig: WatermarkConfig;
  exportSettings: ExportSettings;
  presets: WatermarkPreset[];
}

// Actions
type AppAction =
  | { type: 'ADD_IMAGES'; payload: ImageData[] }
  | { type: 'SELECT_IMAGE'; payload: string }
  | { type: 'UPDATE_WATERMARK'; payload: Partial<WatermarkConfig> }
  | { type: 'UPDATE_EXPORT'; payload: Partial<ExportSettings> }
  | ... 
```

---

## 📁 Project Structure

```
manga-watermark-tool/
├── 📁 src/
│   ├── 📁 components/          # React Components
│   │   ├── BatchRenamePanel.tsx
│   │   ├── CompressionPresetPanel.tsx
│   │   ├── CropPanel.tsx
│   │   ├── ExportPanel.tsx
│   │   ├── ImageList.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── ImageWatermarkPanel.tsx
│   │   ├── PositionPanel.tsx
│   │   ├── PresetPanel.tsx
│   │   ├── PreviewCanvas.tsx
│   │   ├── TextWatermarkPanel. tsx
│   │   └── index.ts
│   │
│   ├── 📁 context/             # React Context
│   │   ├── AppContext.tsx
│   │   └── index.ts
│   │
│   ├── 📁 hooks/               # Custom Hooks
│   │   ├── useExport.ts
│   │   ├── useImages.ts
│   │   ├── usePresets.ts
│   │   ├── useWatermarkSettings.ts
│   │   └── index.ts
│   │
│   ├── 📁 services/            # Business Logic
│   │   ├── ImageCropper.ts
│   │   ├── ImageProcessor. ts
│   │   ├── PresetManager.ts
│   │   ├── WatermarkRenderer.ts
│   │   └── *. property. test.ts
│   │
│   ├── 📁 types/               # TypeScript Types
│   │   ├── compression.ts
│   │   ├── crop.ts
│   │   ├── rename.ts
│   │   └── index.ts
│   │
│   ├── 📁 utils/               # Utility Functions
│   │   ├── position.ts
│   │   ├── serialization.ts
│   │   ├── validation.ts
│   │   └── *.property.test.ts
│   │
│   ├── 📁 test/                # Test Setup
│   │   ├── setup.ts
│   │   └── helpers.ts
│   │
│   ├── App.tsx                 # Main App Component
│   ├── main.tsx                # Entry Point
│   └── index.css               # Global Styles
│
├── 📁 . kiro/                   # Kiro Specs
│   └── 📁 specs/
│       ├── manga-watermark-tool/
│       └── new-features/
│
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 vite.config. ts
├── 📄 vitest.config. ts
├── 📄 tailwind.config.js
└── 📄 README.md
```

---

## 📚 API Reference

### Types

#### ImageData
```typescript
interface ImageData {
  id: string;
  name: string;
  width: number;
  height: number;
  dataUrl: string;
  file: File;
}
```

#### WatermarkConfig
```typescript
interface WatermarkConfig {
  type: 'text' | 'image';
  text?: TextWatermarkConfig;
  image?: ImageWatermarkConfig;
  position: PositionConfig;
}

interface TextWatermarkConfig {
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  opacity: number;
  rotation: number;
}

interface ImageWatermarkConfig {
  dataUrl: string;
  scale: number;
  opacity: number;
  rotation: number;
}

interface PositionConfig {
  preset: PositionPreset;
  offsetX: number;
  offsetY: number;
  offsetUnit: 'px' | '%';
}
```

#### ExportSettings
```typescript
interface ExportSettings {
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 1-100
  filename: string;
}
```

#### CropRegion
```typescript
interface CropRegion {
  x: number;      // Start X position
  y: number;      // Start Y position
  width: number;  // Crop width
  height: number; // Crop height
}

type AspectRatio = 'free' | '1:1' | '4:3' | '16:9';
```

#### CompressionPreset
```typescript
type PresetName = 'web' | 'print' | 'archive' | 'custom';

interface CompressionPreset {
  name: PresetName;
  format: 'png' | 'jpeg' | 'webp';
  quality: number;
  maxWidth?: number;
  lossless?: boolean;
}
```

#### RenamePattern
```typescript
interface RenamePattern {
  pattern: string;
  chapter: number;
  startPage: number;
  padLength: number;
}

// Available variables: {chapter}, {page}, {original}, {date}, {index}
```

### Services

#### ImageProcessor
```typescript
class ImageProcessor {
  static async loadImage(file: File): Promise<ImageData>;
  static async processImage(
    image: ImageData,
    watermarkConfig: WatermarkConfig,
    exportSettings: ExportSettings
  ): Promise<Blob>;
}
```

#### WatermarkRenderer
```typescript
class WatermarkRenderer {
  static renderTextWatermark(
    ctx: CanvasRenderingContext2D,
    config: TextWatermarkConfig,
    position: { x: number; y: number }
  ): void;
  
  static renderImageWatermark(
    ctx: CanvasRenderingContext2D,
    config: ImageWatermarkConfig,
    position: { x: number; y: number }
  ): void;
}
```

#### PresetManager
```typescript
class PresetManager {
  static savePreset(preset: WatermarkPreset): void;
  static loadPresets(): WatermarkPreset[];
  static deletePreset(id: string): void;
  static exportPresets(): string; // JSON
  static importPresets(json: string): void;
}
```

#### ImageCropper
```typescript
class ImageCropper {
  static applyCrop(
    imageDataUrl: string,
    region: CropRegion
  ): Promise<string>;
  
  static calculateRegionFromAspectRatio(
    imageWidth: number,
    imageHeight: number,
    aspectRatio: AspectRatio
  ): CropRegion;
  
  static validateCropRegion(
    region: CropRegion,
    imageWidth: number,
    imageHeight: number
  ): boolean;
}
```

### Hooks

#### useImages
```typescript
function useImages(): {
  images: ImageData[];
  selectedImageId: string | null;
  selectedImage: ImageData | null;
  loadFromFiles: (files: File[], onProgress?: ProgressCallback) => Promise<void>;
  selectImage: (id: string) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
};
```

#### useWatermarkSettings
```typescript
function useWatermarkSettings(): {
  config: WatermarkConfig;
  isTextWatermark: boolean;
  updateTextConfig: (config: Partial<TextWatermarkConfig>) => void;
  updateImageConfig: (config: Partial<ImageWatermarkConfig>) => void;
  updatePosition: (position: Partial<PositionConfig>) => void;
  switchToText: () => void;
  switchToImage: () => void;
};
```

#### useExport
```typescript
function useExport(): {
  settings: ExportSettings;
  updateSettings: (settings: Partial<ExportSettings>) => void;
  exportCurrent: () => Promise<void>;
  exportAll: () => Promise<void>;
  isExporting: boolean;
};
```

#### usePresets
```typescript
function usePresets(): {
  presets: WatermarkPreset[];
  savePreset: (name: string) => void;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
  exportPresets: () => string;
  importPresets: (json: string) => void;
};
```

---

## 🧪 Testing

### Test Stack

- **Vitest** - Test runner
- **fast-check** - Property-based testing
- **@testing-library/react** - React component testing
- **jsdom** - DOM environment

### Run Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

```
Test Files  8 passed (8)
     Tests  82 passed (82)
```

### Property-Based Tests

The application uses **Property-Based Testing** to validate correctness properties:

| Property | Description | File |
|----------|-------------|------|
| Property 1-4 | Image validation | `ImageProcessor.property.test.ts` |
| Property 5-8 | Position calculation | `position.property.test.ts` |
| Property 9-12 | Watermark rendering | `WatermarkRenderer.property.test. ts` |
| Property 13-16 | Preset management | `PresetManager.property.test.ts` |
| Property 17-20 | Serialization round-trip | `serialization.property.test.ts` |

### Example Property Test

```typescript
import { fc } from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('Property: Serialization Round-Trip', () => {
  it('should preserve data after serialize/deserialize', () => {
    fc.assert(
      fc.property(
        fc.record({
          text: fc.string(),
          fontSize: fc.integer({ min: 1, max: 200 }),
          opacity: fc.float({ min: 0, max: 1 }),
        }),
        (config) => {
          const serialized = serialize(config);
          const deserialized = deserialize(serialized);
          expect(deserialized).toEqual(config);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

---

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2.  Create a feature branch: `git checkout -b feature/amazing-feature`
3.  Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- ESLint for linting
- Prettier for formatting
- TypeScript strict mode enabled

### Commit Convention

```
feat: Add new feature
fix: Bug fix
docs: Documentation update
style: Code style changes
refactor: Code refactoring
test: Add/update tests
chore: Maintenance tasks
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 👤 Author

**HikiNarou**

- GitHub: [@HikiNarou](https://github.com/HikiNarou)

---

<div align="center">

Made with ❤️ for the Manga Community

</div>
