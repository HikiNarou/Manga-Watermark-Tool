# Implementation Plan - AI Image Editing

## Overview
Implementasi fitur AI Image Editing menggunakan Google Gemini 2.0 Flash API dengan mask drawing tools untuk editing presisi.

---

- [x] 1. Setup Types dan Interfaces




  - [x] 1.1 Create AI types file dengan semua interfaces


    - Create `src/types/ai.ts` with AIEditMode, AIEditRequest, AIEditResult, EnhanceOptions, RemoveBgOptions, MaskTool, MaskState, AIEditState




    - _Requirements: 3.1, 4.1, 5.1, 6.1_
  - [ ] 1.2 Export types dari index
    - Update `src/types/index.ts` to export AI types


    - _Requirements: All_


- [x] 2. Implement APIKeyManager Service




  - [ ] 2.1 Create APIKeyManager class
    - Create `src/services/APIKeyManager.ts`
    - Implement store(), retrieve(), clear() with base64 obfuscation
    - Implement validateFormat() for API key format validation
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  - [x] 2.2 Write property test for API key round-trip

    - **Property 1: API Key Storage Round-Trip**
    - **Validates: Requirements 1.2**
  - [x] 2.3 Write property test for invalid key rejection

    - **Property 2: Invalid API Key Rejection**
    - **Validates: Requirements 1.3**



- [x] 3. Implement MaskProcessor Service

  - [ ] 3.1 Create MaskProcessor class
    - Create `src/services/MaskProcessor.ts`

    - Implement canvas setup and drawing context
    - Implement brush drawing (startDraw, continueDraw, endDraw)

    - Implement rectangle drawing
    - Implement lasso/polygon drawing




    - Implement eraser tool
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  - [ ] 3.2 Implement history management
    - Add undo/redo stack with ImageData snapshots

    - Implement undo(), redo(), clear() methods
    - _Requirements: 2.6, 2.7_
  - [x] 3.3 Implement mask export

    - Implement exportMask() to return binary mask as data URL
    - Implement hasMask() to check if any mask exists
    - _Requirements: 2.9_

  - [ ] 3.4 Write property test for undo behavior
    - **Property 3: Mask Undo Restores Previous State**
    - **Validates: Requirements 2.6**

  - [ ] 3.5 Write property test for clear behavior
    - **Property 4: Mask Clear Produces Empty Mask**
    - **Validates: Requirements 2.7**


  - [x] 3.6 Write property test for brush size clamping


    - **Property 5: Brush Size Clamping**




    - **Validates: Requirements 2.8**
  - [ ] 3.7 Write property test for mask dimensions
    - **Property 6: Mask Export Dimensions Match Source**
    - **Validates: Requirements 2.9**





- [ ] 4. Implement GeminiService
  - [ ] 4.1 Create GeminiService class with API integration
    - Create `src/services/GeminiService.ts`
    - Setup Gemini API client with fetch

    - Implement system instructions constant
    - Implement validateKey() method
    - _Requirements: 1.4, 8.1_
  - [ ] 4.2 Implement enhance() method
    - Handle upscale, denoise, sharpen, auto options

    - Build proper prompt for each enhancement type
    - _Requirements: 3.2, 3.3, 3.4, 3.5_



  - [-] 4.3 Implement removeBackground() method

    - Handle auto removal and mask-guided removal

    - Support transparent, color, and image replacement
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [ ] 4.4 Implement inpaint() method
    - Process image with mask for content removal
    - Support optional prompt for guided inpainting

    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_
  - [ ] 4.5 Implement editWithPrompt() method
    - Handle full image and masked area editing
    - Support regeneration with same parameters

    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6_
  - [ ] 4.6 Write property test for system instructions inclusion
    - **Property 7: AI Request Includes System Instructions**

    - **Validates: Requirements 8.1**

- [x] 5. Checkpoint - Ensure all service tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create APIKeyPanel Component



  - [-] 6.1 Build APIKeyPanel UI

    - Create `src/components/APIKeyPanel.tsx`
    - Password input field for API key

    - Test Connection button with loading state
    - Connection status indicator (connected/disconnected)
    - Clear API Key button



    - _Requirements: 1.1, 1.4, 1.5, 1.6_


- [x] 7. Create MaskCanvas Component

  - [ ] 7.1 Build MaskCanvas overlay component
    - Create `src/components/MaskCanvas.tsx`
    - Canvas overlay positioned on top of image
    - Semi-transparent red color for mask visualization
    - _Requirements: 2.1, 2.5_
  - [ ] 7.2 Implement drawing tool controls
    - Tool selector (brush, rectangle, lasso, eraser)





    - Brush size slider (5-100px)

    - Undo/Redo/Clear buttons
    - _Requirements: 2.2, 2.3, 2.4, 2.6, 2.7, 2.8_
  - [ ] 7.3 Connect MaskProcessor to canvas events
    - Mouse/touch event handlers for drawing
    - Real-time mask preview
    - Export mask on demand
    - _Requirements: 2.9_

- [ ] 8. Create AIEditorPanel Component
  - [ ] 8.1 Build mode selector UI
    - Create `src/components/AIEditorPanel.tsx`
    - Tab/button group for mode selection (Enhance, Remove BG, Inpaint, AI Edit)
    - _Requirements: 3.1, 4.1, 5.1, 6.1_
  - [ ] 8.2 Build enhancement options UI
    - Buttons for Upscale 2x, Denoise, Sharpen, Auto Enhance
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  - [ ] 8.3 Build background removal options UI
    - Auto remove button
    - Replace background options (transparent, color picker, image upload)
    - _Requirements: 4.2, 4.3, 4.5_
  - [ ] 8.4 Build inpainting UI
    - Instruction text to draw mask first
    - Optional prompt input
    - Remove button
    - _Requirements: 5.1, 5.2, 5.4_
  - [ ] 8.5 Build prompt editing UI
    - Large text input for prompt
    - Example prompts/suggestions
    - _Requirements: 6.1, 6.2, 6.3_
  - [ ] 8.6 Build processing state UI
    - Loading overlay with operation name
    - Progress indicator animation
    - _Requirements: 7.1, 7.2_
  - [ ] 8.7 Build result preview UI
    - Before/after image comparison
    - Apply, Regenerate, Discard buttons
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ] 9. Create AIToolsTab Container
  - [ ] 9.1 Build AIToolsTab component
    - Create `src/components/AIToolsTab.tsx`
    - Compose APIKeyPanel, MaskCanvas controls, AIEditorPanel
    - Manage AI edit state
    - _Requirements: All_
  - [ ] 9.2 Implement state management
    - Track current mode, processing state, results
    - Handle image updates after AI edit applied
    - _Requirements: 7.5, 7.6, 7.7_

- [ ] 10. Integrate with App.tsx
  - [ ] 10.1 Add AI Tools to sidebar
    - Import and add AIToolsTab to Tools tab or new AI tab
    - Pass selected image and update handlers
    - _Requirements: All_
  - [ ] 10.2 Update PreviewCanvas for mask overlay
    - Add mask canvas layer when AI mask mode is active
    - Sync mask with selected image
    - _Requirements: 2.1_

- [ ] 11. Export components and update index files
  - [ ] 11.1 Update component exports
    - Add new components to `src/components/index.ts`
    - _Requirements: All_
  - [ ] 11.2 Update service exports if needed
    - Ensure all services are properly exported
    - _Requirements: All_

- [ ] 12. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
