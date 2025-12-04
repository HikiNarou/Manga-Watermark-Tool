# 🎨 Manga Watermark Tool

<div align="center">

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0.1-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.15-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Aplikasi web untuk menambahkan watermark pada gambar manga secara batch dengan fitur lengkap.**

[Demo](#demo) • [Fitur](#-fitur) • [Instalasi](#-instalasi) • [Penggunaan](#-penggunaan) • [Arsitektur](#-arsitektur) • [API](#-api-reference)

</div>

---

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Instalasi](#-instalasi)
- [Penggunaan](#-penggunaan)
- [Arsitektur](#-arsitektur)
- [Struktur Proyek](#-struktur-proyek)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Kontribusi](#-kontribusi)

---

## ✨ Fitur

### 🖼️ Watermark
- **Text Watermark** - Tambahkan teks dengan kustomisasi font, ukuran, warna, opacity
- **Image Watermark** - Gunakan logo/gambar sebagai watermark
- **9 Posisi Preset** - Top-left, top-center, top-right, middle-left, center, middle-right, bottom-left, bottom-center, bottom-right
- **Custom Offset** - Atur posisi X/Y secara manual (pixel atau persentase)
- **Rotation** - Putar watermark 0-360 derajat
- **Opacity Control** - Atur transparansi 0-100%

### 🔧 Tools
- **Image Cropping** - Crop gambar dengan aspect ratio preset (16:9, 4:3, 1:1, Free)
- **Compression Presets** - Web (WEBP 80%), Print (PNG 100%), Archive (PNG Lossless), Custom
- **Batch Rename** - Rename file dengan pattern variables: `{chapter}`, `{page}`, `{original}`, `{date}`, `{index}`

### 🤖 AI Image Editing (Gemini 2.0 Flash)
- **AI Image Enhancement** - Upscale 2x, Denoise, Sharpen, Auto Enhance untuk meningkatkan kualitas gambar manga
- **AI Background Removal** - Hapus background otomatis dengan opsi transparent atau solid color
- **AI Inpainting** - Hapus objek/teks yang tidak diinginkan dan AI akan mengisi dengan konten yang sesuai
- **AI Text-to-Image Edit** - Edit gambar dengan prompt natural language (contoh: "Hapus teks di area yang ditandai")
- **Mask Drawing Tools** - Brush, Rectangle, Lasso, Eraser untuk menandai area yang akan diedit AI
- **Before/After Preview** - Lihat perbandingan sebelum dan sesudah edit AI
- **Regenerate Option** - Tidak puas? Generate ulang dengan satu klik

### 💾 Preset System
- **Save/Load Presets** - Simpan konfigurasi watermark untuk digunakan kembali
- **LocalStorage Persistence** - Preset tersimpan otomatis di browser
- **Import/Export** - Backup dan restore preset dalam format JSON

### 📤 Export
- **Multiple Formats** - PNG, JPEG, WEBP
- **Quality Control** - Atur kualitas output 1-100%
- **Batch Export** - Export semua gambar sekaligus dalam ZIP
- **Individual Export** - Export gambar satu per satu

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
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

## 🚀 Instalasi

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 atau **yarn** >= 1.22.0

### Clone Repository

```bash
git clone https://github.com/HikiNarou/Manga-Watermark-Tool.git
cd Manga-Watermark-Tool
```

### Install Dependencies

```bash
npm install
# atau
yarn install
```

### Development Server

```bash
npm run dev
# atau
yarn dev
```

Aplikasi akan berjalan di `http://localhost:5173`

### Build Production

```bash
npm run build
# atau
yarn build
```

Output akan ada di folder `dist/`

### Preview Production Build

```bash
npm run preview
```

---

## 📖 Penggunaan

### 1. Upload Gambar

1. Klik area upload atau drag & drop gambar
2. Mendukung format: PNG, JPEG, WEBP, GIF
3. Multiple upload didukung

### 2. Konfigurasi Watermark

#### Text Watermark
```
Tab: Watermark → Text
- Text: Masukkan teks watermark
- Font Family: Arial, Times New Roman, dll
- Font Size: 12-200px
- Color: Pilih warna dengan color picker
- Opacity: 0-100%
- Rotation: 0-360°
```

#### Image Watermark
```
Tab: Watermark → Image
- Upload gambar watermark (PNG dengan transparansi recommended)
- Scale: 10-200%
- Opacity: 0-100%
- Rotation: 0-360°
```

### 3. Atur Posisi

```
Tab: Watermark → Position
- Pilih dari 9 posisi preset, atau
- Gunakan Custom dengan offset X/Y
- Unit: Pixels atau Percentage
```

### 4. Tools (Opsional)

#### Image Cropping
```
Tab: Tools → Image Cropping
1. Enable "Crop Image"
2. Pilih Aspect Ratio: Free, 1:1, 4:3, 16:9
3. Atur region crop secara manual jika perlu
4. Klik "Apply Crop"
```

#### Compression Presets
```
Tab: Tools → Compression Presets
- Web: WEBP, Quality 80%, Max Width 1920px
- Print: PNG, Quality 100%, Original Size
- Archive: PNG, Lossless, Original Size
- Custom: Konfigurasi manual
```

#### Batch Rename
```
Tab: Tools → Batch Rename
1. Enable "Batch Rename"
2. Masukkan pattern, contoh: "Chapter_{chapter}_Page_{page}"
3. Set Chapter Number dan Start Page
4. Preview hasil rename

Variables:
- {chapter} → Nomor chapter
- {page} → Nomor halaman (zero-padded)
- {original} → Nama file asli
- {date} → Tanggal (YYYY-MM-DD)
- {index} → Index file (1, 2, 3, ...)
```

### 5. Save Preset (Opsional)

```
Tab: Presets
1. Konfigurasi watermark sesuai keinginan
2. Klik "Save Preset"
3. Beri nama preset
4. Preset tersimpan di localStorage
```

### 6. Export

```
Tab: Export
1. Pilih format: PNG, JPEG, atau WEBP
2. Atur quality (untuk JPEG/WEBP)
3. Klik "Export All" untuk batch export (ZIP)
4. Atau klik "Export Current" untuk export gambar yang dipilih
```

---

## 🏗️ Arsitektur

### Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx                                  │
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

Aplikasi menggunakan **React Context API** dengan pattern:

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

## 📁 Struktur Proyek

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
│   │   ├── TextWatermarkPanel.tsx
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
│   │   ├── ImageProcessor.ts
│   │   ├── PresetManager.ts
│   │   ├── WatermarkRenderer.ts
│   │   └── *.property.test.ts
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
├── 📁 .kiro/                   # Kiro Specs
│   └── 📁 specs/
│       ├── manga-watermark-tool/
│       └── new-features/
│
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 vite.config.ts
├── 📄 vitest.config.ts
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

Aplikasi menggunakan **Property-Based Testing** untuk memvalidasi correctness properties:

| Property | Description | File |
|----------|-------------|------|
| Property 1-4 | Image validation | `ImageProcessor.property.test.ts` |
| Property 5-8 | Position calculation | `position.property.test.ts` |
| Property 9-12 | Watermark rendering | `WatermarkRenderer.property.test.ts` |
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

## 🤝 Kontribusi

### Development Workflow

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style

- ESLint untuk linting
- Prettier untuk formatting
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

Made with ❤️ for Manga Community

</div>
