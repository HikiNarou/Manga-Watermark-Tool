import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock canvas for tests
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4),
  })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4),
  })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  arc: vi.fn(),
  measureText: vi.fn(() => ({ width: 100 })),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  canvas: {
    width: 800,
    height: 600,
  },
})) as unknown as typeof HTMLCanvasElement.prototype.getContext

// Mock URL.createObjectURL
;(globalThis as unknown as { URL: typeof URL }).URL.createObjectURL = vi.fn(() => 'blob:mock-url')
;(globalThis as unknown as { URL: typeof URL }).URL.revokeObjectURL = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
