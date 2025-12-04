import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { arbHexColor, arbOpacity } from './helpers'

describe('Test Setup Verification', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should support fast-check property testing', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n
      }),
      { numRuns: 100 }
    )
  })

  it('should use custom arbitraries', () => {
    fc.assert(
      fc.property(arbHexColor, (color) => {
        return color.startsWith('#') && color.length === 7
      }),
      { numRuns: 100 }
    )
  })

  it('should validate opacity range', () => {
    fc.assert(
      fc.property(arbOpacity, (opacity) => {
        return opacity >= 0 && opacity <= 100
      }),
      { numRuns: 100 }
    )
  })
})
