// Maps the review slider to an interval in minutes. Three overlapping bands let
// the learner reach from 30s to 30 days with fine control. Within a band the
// position is CUBE-ROOT spaced, so the dot (sized by minutes**(1/3)) grows
// linearly as you drag — the size moves at a natural, readable pace.

export interface Band {
  id: string
  label: string
  lo: number // minutes
  hi: number // minutes
}

export const BANDS: Band[] = [
  { id: 'short', label: '30s–30m', lo: 0.5, hi: 30 },
  { id: 'mid', label: '10m–2d', lo: 10, hi: 2880 },
  { id: 'long', label: '1d–30d', lo: 1440, hi: 43200 },
]

const cbrt = (x: number) => Math.cbrt(x)

/** Position in [0,1] -> minutes, cube-root spaced within the band. */
export function minutesFromPos(band: Band, pos: number): number {
  const p = Math.max(0, Math.min(1, pos))
  const root = cbrt(band.lo) + (cbrt(band.hi) - cbrt(band.lo)) * p
  return root ** 3
}

/** Inverse: minutes -> position in [0,1] within the band (clamped). */
export function posFromMinutes(band: Band, minutes: number): number {
  const m = Math.max(band.lo, Math.min(band.hi, minutes))
  const span = cbrt(band.hi) - cbrt(band.lo)
  if (span === 0) return 0
  return (cbrt(m) - cbrt(band.lo)) / span
}

/** The band whose range contains `minutes`, else the nearest. */
export function bandForMinutes(minutes: number): Band {
  const inside = BANDS.find((b) => minutes >= b.lo && minutes <= b.hi)
  if (inside) return inside
  return minutes < BANDS[0].lo ? BANDS[0] : BANDS[BANDS.length - 1]
}

/** Human label for an interval: "30s", "5m", "2h", "3d". */
export function formatMinutes(minutes: number): string {
  if (minutes < 1) return `${Math.round(minutes * 60)}s`
  if (minutes < 60) return `${Math.round(minutes)}m`
  if (minutes < 1440) {
    const h = minutes / 60
    return `${h < 10 ? h.toFixed(h % 1 ? 1 : 0) : Math.round(h)}h`
  }
  const d = minutes / 1440
  return `${d < 10 ? d.toFixed(d % 1 ? 1 : 0) : Math.round(d)}d`
}

/** Absolute due time label from now + minutes. */
export function dueLabel(minutes: number, now = Date.now()): string {
  const due = new Date(now + minutes * 60_000)
  const sameDay = new Date(now).toDateString() === due.toDateString()
  return sameDay
    ? due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : due.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
