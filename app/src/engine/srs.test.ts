import { describe, it, expect } from 'vitest'
import {
  newRecord,
  commitInterval,
  isDue,
  statusAt,
  freshness,
  elapsedMinutes,
  MINUTE_MS,
} from './srs'

const T0 = 1_700_000_000_000 // fixed "now"

describe('newRecord', () => {
  it('starts new and immediately due', () => {
    const r = newRecord()
    expect(r.status).toBe('new')
    expect(r.reps).toBe(0)
    expect(isDue(r, T0)).toBe(true)
    expect(statusAt(r, T0)).toBe('new')
  })
})

describe('commitInterval', () => {
  it('schedules due = now + minutes and stamps last', () => {
    const r = commitInterval(newRecord(), 30, T0)
    expect(r.status).toBe('scheduled')
    expect(r.last).toBe(T0)
    expect(r.interval).toBe(30)
    expect(r.due).toBe(T0 + 30 * MINUTE_MS)
    expect(r.reps).toBe(1)
    expect(r.lapses).toBe(0)
    expect(isDue(r, T0)).toBe(false)
    expect(isDue(r, T0 + 30 * MINUTE_MS)).toBe(true)
  })

  it('counts a lapse when re-reviewing an overdue card', () => {
    const scheduled = commitInterval(newRecord(), 10, T0)
    const overdueReview = commitInterval(scheduled, 60, T0 + 20 * MINUTE_MS)
    expect(overdueReview.lapses).toBe(1)
    expect(overdueReview.reps).toBe(2)
  })

  it('does not lapse when reviewing early', () => {
    const scheduled = commitInterval(newRecord(), 60, T0)
    const earlyReview = commitInterval(scheduled, 120, T0 + 10 * MINUTE_MS)
    expect(earlyReview.lapses).toBe(0)
  })

  it('clamps negative minutes to zero', () => {
    const r = commitInterval(newRecord(), -5, T0)
    expect(r.interval).toBe(0)
    expect(r.due).toBe(T0)
  })
})

describe('freshness', () => {
  it('is 0 for a new card', () => {
    expect(freshness(newRecord(), T0)).toBe(0)
  })

  it('is 1 right after review and decays linearly to 0 at due', () => {
    const r = commitInterval(newRecord(), 60, T0)
    expect(freshness(r, T0)).toBe(1)
    expect(freshness(r, T0 + 30 * MINUTE_MS)).toBeCloseTo(0.5, 6)
    expect(freshness(r, T0 + 60 * MINUTE_MS)).toBe(0)
  })

  it('clamps to 0 past due rather than going negative', () => {
    const r = commitInterval(newRecord(), 60, T0)
    expect(freshness(r, T0 + 120 * MINUTE_MS)).toBe(0)
  })
})

describe('elapsedMinutes', () => {
  it('reports minutes since last review', () => {
    const r = commitInterval(newRecord(), 60, T0)
    expect(elapsedMinutes(r, T0 + 45 * MINUTE_MS)).toBeCloseTo(45, 6)
  })
})
