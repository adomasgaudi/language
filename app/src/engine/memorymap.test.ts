import { describe, it, expect } from 'vitest'
import {
  diameter,
  heatColor,
  crystalFor,
  dotStyle,
  SIZE_MIN,
  SIZE_MAX,
  CRYSTAL_AT,
} from './memorymap'
import { commitInterval, newRecord, MINUTE_MS } from './srs'
import type { Card } from './types'

const T0 = 1_700_000_000_000

const card: Card = {
  id: 'W-bonjour',
  kind: 'word',
  target: 'bonjour',
  translation: { literal: 'good day', natural: 'hello' },
  tier: 'easy',
}

describe('diameter', () => {
  it('grows monotonically with interval (cube root)', () => {
    expect(diameter(60)).toBeLessThan(diameter(600))
    expect(diameter(600)).toBeLessThan(diameter(6000))
  })

  it('distinguishes small intervals rather than flattening them', () => {
    // The prototype bug: 5m and 30m must not render identically.
    expect(diameter(5)).not.toBeCloseTo(diameter(30), 5)
  })

  it('respects clamps at the extremes', () => {
    expect(diameter(0)).toBe(SIZE_MIN)
    expect(diameter(10 ** 9)).toBe(SIZE_MAX)
  })
})

describe('heatColor', () => {
  it('is bright blue when fresh and coal when stale', () => {
    expect(heatColor(1)).toBe('rgb(77, 166, 255)')
    expect(heatColor(0)).toBe('rgb(58, 42, 42)')
  })

  it('interpolates between stops', () => {
    // Halfway between coal(0) and red(0.2) on the red channel: (58+229)/2 ≈ 144.
    expect(heatColor(0.1)).toBe('rgb(144, 50, 48)')
  })

  it('clamps out-of-range input', () => {
    expect(heatColor(2)).toBe(heatColor(1))
    expect(heatColor(-1)).toBe(heatColor(0))
  })
})

describe('crystalFor', () => {
  it('returns null below the crystal threshold', () => {
    expect(crystalFor(CRYSTAL_AT - 1)).toBeNull()
  })

  it('picks material by interval band', () => {
    expect(crystalFor(300)?.material).toBe('silver') // ~5h
    expect(crystalFor(2000)?.material).toBe('gold') // ~1.4d
    expect(crystalFor(20000)?.material).toBe('ruby') // ~2w
    expect(crystalFor(50000)?.material).toBe('diamond') // ~5w
  })
})

describe('dotStyle', () => {
  it('is a glowing fresh dot just after a short review', () => {
    const r = commitInterval(newRecord(), 30, T0)
    const s = dotStyle(card, r, T0)
    expect(s.kind).toBe('dot')
    expect(s.glow).toBe(true)
    expect(s.due).toBe(false)
    expect(s.cracked).toBe(false)
  })

  it('is due (no glow) once the interval has elapsed', () => {
    const r = commitInterval(newRecord(), 30, T0)
    const s = dotStyle(card, r, T0 + 31 * MINUTE_MS)
    expect(s.due).toBe(true)
    expect(s.glow).toBe(false)
  })

  it('becomes a crystal for long intervals and cracks when due', () => {
    const r = commitInterval(newRecord(), 1440, T0) // 1 day
    const fresh = dotStyle(card, r, T0)
    expect(fresh.kind).toBe('crystal')
    expect(fresh.material).toBe('gold')
    expect(fresh.cracked).toBe(false)

    const due = dotStyle(card, r, T0 + 1441 * MINUTE_MS)
    expect(due.cracked).toBe(true)
  })
})
