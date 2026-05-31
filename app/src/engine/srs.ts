// Manual spaced-repetition scheduler.
//
// Design choice (carried over from the Tartaglia prototype): the learner picks
// the next interval directly with a slider instead of the engine inferring it
// from an Again/Hard/Good/Easy grade. That makes the whole core a handful of
// pure functions we can fully unit-test.

import type { SrsRecord, SrsStatus } from './types'

export const MINUTE_MS = 60_000

/** A fresh, never-reviewed record. */
export function newRecord(): SrsRecord {
  return { status: 'new', due: 0, last: null, interval: 0, reps: 0, lapses: 0 }
}

/** True when the card is ready to study at `now`. New cards are always due. */
export function isDue(record: SrsRecord, now: number): boolean {
  return record.status === 'new' || now >= record.due
}

export function statusAt(record: SrsRecord, now: number): SrsStatus {
  if (record.last === null) return 'new'
  return now >= record.due ? 'due' : 'scheduled'
}

/**
 * Commit a review: stamp `last = now` and schedule `due = now + minutes`.
 * Re-reviewing a card that was already overdue counts as a lapse (you forgot).
 */
export function commitInterval(
  record: SrsRecord,
  minutes: number,
  now: number,
): SrsRecord {
  const interval = Math.max(0, minutes)
  const wasOverdue = record.last !== null && now >= record.due
  return {
    status: 'scheduled',
    last: now,
    due: now + interval * MINUTE_MS,
    interval,
    reps: record.reps + 1,
    lapses: record.lapses + (wasOverdue ? 1 : 0),
  }
}

/** Fraction of the current interval still "fresh": 1 just after review → 0 at due.
 *  Clamped to [0, 1]; new/unscheduled cards report 0. */
export function freshness(record: SrsRecord, now: number): number {
  if (record.last === null || record.interval <= 0) return 0
  const elapsed = now - record.last
  const span = record.interval * MINUTE_MS
  const f = 1 - elapsed / span
  return f < 0 ? 0 : f > 1 ? 1 : f
}

/** How long ago the card was reviewed, in minutes (0 if never). */
export function elapsedMinutes(record: SrsRecord, now: number): number {
  if (record.last === null) return 0
  return Math.max(0, (now - record.last) / MINUTE_MS)
}
