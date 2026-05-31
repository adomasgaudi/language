import { describe, it, expect } from 'vitest'
import {
  BANDS,
  minutesFromPos,
  posFromMinutes,
  bandForMinutes,
  formatMinutes,
} from './interval'

const short = BANDS[0]
const long = BANDS[2]

describe('minutesFromPos / posFromMinutes', () => {
  it('hits the band endpoints', () => {
    expect(minutesFromPos(short, 0)).toBeCloseTo(short.lo, 6)
    expect(minutesFromPos(short, 1)).toBeCloseTo(short.hi, 6)
  })

  it('round-trips position <-> minutes', () => {
    for (const p of [0, 0.25, 0.5, 0.75, 1]) {
      const m = minutesFromPos(long, p)
      expect(posFromMinutes(long, m)).toBeCloseTo(p, 6)
    }
  })

  it('is monotonic in position', () => {
    expect(minutesFromPos(short, 0.3)).toBeLessThan(minutesFromPos(short, 0.6))
  })

  it('clamps out-of-range positions', () => {
    expect(minutesFromPos(short, -1)).toBeCloseTo(short.lo, 6)
    expect(minutesFromPos(short, 2)).toBeCloseTo(short.hi, 6)
  })
})

describe('bandForMinutes', () => {
  it('selects a band that contains the value', () => {
    expect(bandForMinutes(15).id).toBe('short')
    expect(bandForMinutes(20000).id).toBe('long')
  })
})

describe('formatMinutes', () => {
  it('formats across units', () => {
    expect(formatMinutes(0.5)).toBe('30s')
    expect(formatMinutes(5)).toBe('5m')
    expect(formatMinutes(120)).toBe('2h')
    expect(formatMinutes(2880)).toBe('2d')
  })
})
