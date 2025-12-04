# Implementation Plan

## Manga Watermark Tool

- [x] 1. Project Setup and Core Infrastructure






  - [x] 1.1 Initialize Vite + React + TypeScript project

    - Create project with `npm create vite@latest`
    - Configure TypeScript strict mode
    - Set up Tailwind CSS
    - Configure path aliases
    - _Requirements: All_

  - [x] 1.2 Set up testing infrastructure


    - Install Vitest and fast-check
    - Configure test scripts in package.json
    - Create test utilities and helpers
    - _Requirements: All_


  - [x] 1.3 Create TypeScript interfaces and types

    - Define all interfaces from design document (WatermarkConfig, Position, Preset, etc.)
    - Create type guards for runtime validation
    - _Requirements: 1.3, 9.1, 9.4_

- [x] 2. Validation and Utility Functions





  - [x] 2.1 Implement file validation utilities


    - Create `isValidImageFormat()` function
    - Create `validateFileSize()` function
    - Create `getFileExtension()` helper
    - _Requirements: 1.3, 1.4_


  - [x] 2.2 Write property test for file format validation

    - **Property 1: File Format Validation**
    - **Validates: Requirements 1.3, 1.4**

  - [x] 2.3 Implement position calculation utilities


    - Create `calculatePresetPosition()` function
    - Create `applyMargins()` function
    - Create `clampToCanvas()` function
    - _Requirements: 4.1, 4.3, 4.5_


  - [x] 2.4 Write property test for position calculation

    - **Property 7: Position Calculation**
    - **Validates: Requirements 4.1, 4.3**


  - [x] 2.5 Write property test for margin constraints

    - **Property 9: Margin Constraints**
    - **Validates: Requirements 4.5**

- [x] 3. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Serialization and Preset Manager





  - [x] 4.1 Implement serialization utilities


    - Create `serializeWatermarkSettings()` function
    - Create `deserializeWatermarkSettings()` function
    - Create `validateSettingsJson()` function
    - Handle base64 encoding for image watermarks
    - _Requirements: 9.1, 9.2, 9.3, 9.4_


  - [x] 4.2 Write property test for serialization round-trip

    - **Property 19: Serialization Round-Trip**
    - **Validates: Requirements 9.1, 9.2, 9.5**


  - [x] 4.3 Write property test for serialization validation

    - **Property 20: Serialization Validation**
    - **Validates: Requirements 9.4**


  - [x] 4.4 Implement PresetManager service

    - Create PresetManager class with CRUD operations
    - Implement localStorage persistence
    - Implement export/import JSON functionality
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_


  - [x] 4.5 Write property test for preset save/load round-trip

    - **Property 10: Preset Save/Load Round-Trip**
    - **Validates: Requirements 5.1, 5.2**


  - [x] 4.6 Write property test for preset export/import round-trip

    - **Property 12: Preset Export/Import Round-Trip**
    - **Validates: Requirements 5.6, 5.7**

- [x] 5. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Image Processing Core





  - [x] 6.1 Implement ImageProcessor service - image loading


    - Create `loadImage()` function to load File to UploadedImage
    - Extract metadata (width, height, size, name)
    - Generate dataUrl for preview
    - _Requirements: 1.1, 1.2, 1.5, 1.6_


  - [x] 6.2 Write property test for image metadata extraction

    - **Property 2: Image Metadata Extraction**
    - **Validates: Requirements 1.5**


  - [x] 6.3 Implement WatermarkRenderer service - text watermark

    - Create `renderTextWatermark()` function
    - Handle font, size, color, outline rendering
    - Handle opacity and rotation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_


  - [x] 6.4 Write property test for text watermark configuration

    - **Property 3: Text Watermark Configuration Consistency**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**


  - [x] 6.5 Write property test for opacity application

    - **Property 4: Opacity Application**
    - **Validates: Requirements 2.6, 3.4**

  - [x] 6.6 Implement WatermarkRenderer service - image watermark


    - Create `renderImageWatermark()` function
    - Handle scaling and opacity
    - Implement tiling logic
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 6.7 Write property test for image watermark scaling


    - **Property 5: Image Watermark Scaling**
    - **Validates: Requirements 3.3**


  - [x] 6.8 Write property test for tiling calculation

    - **Property 6: Tiling Calculation**
    - **Validates: Requirements 3.5**

  - [x] 6.9 Write property test for rotation application


    - **Property 8: Rotation Application**
    - **Validates: Requirements 4.4**

- [x] 7. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Batch Processing and Export





  - [x] 8.1 Implement batch processing in ImageProcessor


    - Create `batchProcess()` function with progress callback
    - Implement cancellation support
    - Handle errors gracefully, continue on failure
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_


  - [x] 8.2 Write property test for batch processing completeness

    - **Property 13: Batch Processing Completeness**
    - **Validates: Requirements 6.1**


  - [x] 8.3 Write property test for batch error resilience
    - **Property 14: Batch Error Resilience**
    - **Validates: Requirements 6.3**


  - [x] 8.4 Write property test for batch cancellation
    - **Property 15: Batch Cancellation Preservation**
    - **Validates: Requirements 6.5**

  - [x] 8.5 Implement export functionality

    - Create `exportImage()` function with format conversion
    - Implement quality settings
    - Implement filename prefix/suffix
    - _Requirements: 7.1, 7.2, 7.4_


  - [x] 8.6 Write property test for format conversion

    - **Property 16: Format Conversion**
    - **Validates: Requirements 7.1**

  - [x] 8.7 Write property test for filename modification

    - **Property 17: Filename Modification**
    - **Validates: Requirements 7.4**

  - [x] 8.8 Implement ZIP packaging


    - Integrate JSZip library
    - Create `exportAsZip()` function
    - _Requirements: 7.6_

  - [x] 8.9 Write property test for ZIP packaging

    - **Property 18: ZIP Packaging**
    - **Validates: Requirements 7.6**

- [x] 9. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. React State Management





  - [x] 10.1 Create AppContext and state management


    - Define AppState interface
    - Create reducer with all actions
    - Create context provider
    - _Requirements: All_



  - [x] 10.2 Create custom hooks





    - Create `useWatermarkSettings()` hook
    - Create `useImages()` hook
    - Create `usePresets()` hook
    - Create `useExport()` hook
    - _Requirements: All_

- [x] 11. UI Components - Image Management






  - [x] 11.1 Create ImageUploader component

    - Implement drag & drop zone
    - Implement file browser button
    - Display upload progress
    - _Requirements: 1.1, 1.2_


  - [x] 11.2 Create ImageList component

    - Display thumbnails of uploaded images
    - Show file info (name, dimensions, size)
    - Handle image selection
    - _Requirements: 1.5, 1.6_

- [x] 12. UI Components - Watermark Configuration
  - [x] 12.1 Create TextWatermarkPanel component
    - Text input field
    - Font family selector
    - Font size slider
    - Color picker
    - Outline toggle and settings
    - Opacity slider
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_


  - [x] 12.2 Create ImageWatermarkPanel component

    - Image upload for watermark
    - Scale slider
    - Opacity slider
    - Tile toggle and spacing settings
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 12.3 Create PositionPanel component



    - 9-position grid selector
    - X/Y offset inputs
    - Rotation slider
    - Margin inputs
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 13. UI Components - Preview and Export






  - [x] 13.1 Create PreviewCanvas component

    - Render image with watermark overlay
    - Implement zoom (scroll wheel)
    - Implement pan (drag)
    - Draggable watermark positioning
    - Toggle watermark visibility
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_


  - [x] 13.2 Create PresetPanel component

    - List saved presets
    - Save/load/delete preset buttons
    - Import/export buttons
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6, 5.7_


  - [x] 13.3 Create ExportPanel component

    - Format selector (JPG, PNG, WEBP)
    - Quality slider
    - Filename prefix/suffix inputs
    - Apply to single/all buttons
    - Download as ZIP button
    - Progress indicator
    - _Requirements: 7.1, 7.2, 7.4, 7.6, 6.2_

- [x] 14. Main Application Assembly





  - [x] 14.1 Create main App layout


    - Sidebar for configuration panels
    - Main area for preview canvas
    - Header with app title and actions
    - _Requirements: All_


  - [x] 14.2 Wire up all components with context

    - Connect ImageUploader to state
    - Connect configuration panels to state
    - Connect PreviewCanvas to state
    - Connect ExportPanel to state
    - _Requirements: All_


  - [x] 14.3 Implement preset persistence on app load

    - Load presets from localStorage on mount
    - Save presets to localStorage on change
    - _Requirements: 5.5_


  - [x] 14.4 Write property test for preset persistence

    - **Property 11: Preset Persistence**
    - **Validates: Requirements 5.5**

- [x] 15. Final Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

