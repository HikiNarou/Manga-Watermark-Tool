# Requirements Document

## Introduction

Dokumen ini mendefinisikan requirements untuk 3 fitur baru pada Manga Watermark Tool:
1. **Image Cropping** - Kemampuan untuk crop gambar sebelum menambahkan watermark
2. **Compression Presets** - Preset kualitas siap pakai untuk berbagai kebutuhan (Web, Print, Archive)
3. **Batch Rename** - Rename file dengan pattern untuk organizing chapter manga

## Glossary

- **Crop**: Memotong bagian gambar untuk menghilangkan area yang tidak diinginkan
- **Crop Region**: Area persegi panjang yang akan dipertahankan setelah crop
- **Aspect Ratio**: Rasio lebar terhadap tinggi gambar
- **Compression Preset**: Konfigurasi kualitas dan format yang sudah ditentukan sebelumnya
- **Batch Rename**: Mengubah nama file secara massal dengan pola tertentu
- **Pattern Variable**: Placeholder dalam pattern yang akan diganti dengan nilai dinamis
- **Image_Cropper**: Komponen yang menangani operasi cropping gambar
- **Compression_Manager**: Komponen yang mengelola preset kompresi
- **Batch_Renamer**: Komponen yang menangani rename file dengan pattern

## Requirements

### Requirement 1: Image Cropping

**User Story:** As a manga editor, I want to crop images before adding watermarks, so that I can remove unwanted borders or adjust the composition.

#### Acceptance Criteria

1. WHEN a user selects an image THEN the Image_Cropper SHALL display crop handles on the preview canvas
2. WHEN a user drags crop handles THEN the Image_Cropper SHALL update the crop region in real-time
3. WHEN a user enters specific dimensions THEN the Image_Cropper SHALL set the crop region to exact pixel values
4. WHEN a user selects a preset aspect ratio (16:9, 4:3, 1:1, Free) THEN the Image_Cropper SHALL constrain the crop region to that ratio
5. WHEN a user clicks apply crop THEN the Image_Cropper SHALL permanently crop the image and update the preview
6. WHEN a user clicks reset crop THEN the Image_Cropper SHALL restore the original image dimensions
7. WHEN cropping is applied THEN the Image_Cropper SHALL recalculate watermark position relative to new dimensions

### Requirement 2: Compression Presets

**User Story:** As a content distributor, I want to use predefined compression presets, so that I can quickly export images optimized for different platforms.

#### Acceptance Criteria

1. WHEN a user opens export settings THEN the Compression_Manager SHALL display available presets (Web, Print, Archive)
2. WHEN a user selects Web preset THEN the Compression_Manager SHALL configure format as WEBP with quality 80 and max width 1920px
3. WHEN a user selects Print preset THEN the Compression_Manager SHALL configure format as PNG with quality 100 and original dimensions
4. WHEN a user selects Archive preset THEN the Compression_Manager SHALL configure format as PNG with quality 100 and original dimensions with lossless compression
5. WHEN a user selects Custom preset THEN the Compression_Manager SHALL allow manual configuration of all export settings
6. WHEN a preset is selected THEN the Compression_Manager SHALL display estimated file size before export
7. WHEN exporting with a preset THEN the Compression_Manager SHALL apply all preset configurations to the output

### Requirement 3: Batch Rename

**User Story:** As a manga translator, I want to rename exported files with a pattern, so that I can organize chapters consistently.

#### Acceptance Criteria

1. WHEN a user enables batch rename THEN the Batch_Renamer SHALL display pattern input field
2. WHEN a user enters a pattern with variables THEN the Batch_Renamer SHALL show preview of resulting filenames
3. WHEN pattern contains {chapter} variable THEN the Batch_Renamer SHALL replace it with user-specified chapter number
4. WHEN pattern contains {page} variable THEN the Batch_Renamer SHALL replace it with zero-padded sequential page number
5. WHEN pattern contains {original} variable THEN the Batch_Renamer SHALL replace it with original filename without extension
6. WHEN pattern contains {date} variable THEN the Batch_Renamer SHALL replace it with current date in YYYY-MM-DD format
7. WHEN exporting files THEN the Batch_Renamer SHALL apply the pattern to generate output filenames
8. WHEN pattern would result in duplicate filenames THEN the Batch_Renamer SHALL append numeric suffix to ensure uniqueness

