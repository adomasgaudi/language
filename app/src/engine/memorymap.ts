// The "memory map": each card is drawn as a dot (or crystal) whose COLOR encodes
// freshness (a live forgetting curve) and whose SIZE encodes the interval.
//
// Every tunable lives at the top as a named parameter — no hardcoded per-size
// values — and sizes come from FORMULAS, never clamps that silently flatten
// distinct values (a lesson from the prototype: 5m vs 30m must look different).

import type { Card, SrsRecord } from './types'
import { freshness } from './srs'

// --- Tunable parameters ------------------------------------------------------

/** diameter (px) = SIZE_BASE * minutes ** SIZE_EXP  (cube-root growth).
 *  SIZE_BASE is tuned so the active range (30s–4h) spreads ~5→20px and the
 *  max clamp only engages for genuinely long intervals. */
export const SIZE_BASE = 3.2
export const SIZE_EXP = 1 / 3
export const SIZE_MIN = 5
export const SIZE_MAX = 40

/** Intervals at/above this many minutes render as crystals, not dots (4h). */
export const CRYSTAL_AT = 240
export const CRY_BASE = 14

/** Below this freshness a dot glows (recently reviewed). */
export const GLOW_AT = 0.72

/**
 * Blackbody-style heat ramp, hot→cold by freshness.
 * fresh (1) = bright glowing blue → white → yellow → orange → red → coal (0).
 * Stops are [freshness, [r, g, b]] sorted descending.
 */
export const HEAT: ReadonlyArray<readonly [number, readonly [number, number, number]]> = [
  [1.0, [77, 166, 255]], // bright blue
  [0.8, [235, 245, 255]], // near-white
  [0.6, [255, 214, 92]], // yellow
  [0.4, [255, 138, 30]], // orange
  [0.2, [229, 57, 53]], // red
  [0.0, [58, 42, 42]], // coal
]

export type CrystalMaterial = 'silver' | 'gold' | 'ruby' | 'diamond'

/** Crystal tiers by interval (minutes), smallest threshold first. */
export const CRYSTAL: ReadonlyArray<{
  material: CrystalMaterial
  minMinutes: number
  mult: number
}> = [
  { material: 'silver', minMinutes: 240, mult: 1.0 }, // 4h–1d
  { material: 'gold', minMinutes: 1440, mult: 1.25 }, // 1d–1w
  { material: 'ruby', minMinutes: 10080, mult: 1.5 }, // 1w–1mo
  { material: 'diamond', minMinutes: 43200, mult: 1.7 }, // 1mo+
]

// --- Derivations -------------------------------------------------------------

const clamp = (x: number, lo: number, hi: number) => (x < lo ? lo : x > hi ? hi : x)

/** Diameter in px for a dot representing `minutes` of interval. */
export function diameter(minutes: number): number {
  const raw = SIZE_BASE * Math.pow(Math.max(0, minutes), SIZE_EXP)
  return clamp(raw, SIZE_MIN, SIZE_MAX)
}

/** Interpolated `rgb(...)` string for a freshness in [0, 1]. */
export function heatColor(f: number): string {
  const x = clamp(f, 0, 1)
  // HEAT is sorted high→low; find the bracketing stops.
  for (let i = 0; i < HEAT.length - 1; i++) {
    const [hi, chi] = HEAT[i]
    const [lo, clo] = HEAT[i + 1]
    if (x <= hi && x >= lo) {
      const t = hi === lo ? 0 : (x - lo) / (hi - lo)
      const r = Math.round(clo[0] + (chi[0] - clo[0]) * t)
      const g = Math.round(clo[1] + (chi[1] - clo[1]) * t)
      const b = Math.round(clo[2] + (chi[2] - clo[2]) * t)
      return `rgb(${r}, ${g}, ${b})`
    }
  }
  const [, last] = HEAT[HEAT.length - 1]
  return `rgb(${last[0]}, ${last[1]}, ${last[2]})`
}

/** Which crystal material an interval earns, or null if it stays a plain dot. */
export function crystalFor(minutes: number): { material: CrystalMaterial; mult: number } | null {
  if (minutes < CRYSTAL_AT) return null
  let chosen = CRYSTAL[0]
  for (const tier of CRYSTAL) {
    if (minutes >= tier.minMinutes) chosen = tier
  }
  return { material: chosen.material, mult: chosen.mult }
}

/** Render props for one dot in the map — deterministic in → out, so it's testable
 *  without ever rendering to a screen. */
export interface DotStyle {
  kind: 'dot' | 'crystal'
  material: CrystalMaterial | null
  diameter: number
  color: string
  /** true once the card is at/after due — drawn transparent with a black outline. */
  due: boolean
  glow: boolean
  /** Crystals show a crack overlay when due. */
  cracked: boolean
  tier: Card['tier']
}

export function dotStyle(card: Card, record: SrsRecord, now: number): DotStyle {
  const f = freshness(record, now)
  const due = record.status !== 'new' && now >= record.due
  const crystal = crystalFor(record.interval)
  const baseDiameter = diameter(record.interval)
  return {
    kind: crystal ? 'crystal' : 'dot',
    material: crystal ? crystal.material : null,
    diameter: crystal ? baseDiameter * crystal.mult : baseDiameter,
    color: heatColor(f),
    due,
    glow: !due && f >= GLOW_AT,
    cracked: !!crystal && due,
    tier: card.tier,
  }
}
