// Persistence: localStorage with a schema version that rejects incompatible
// saves, plus base64 export/import to move progress across file copies/devices.
// (file:// localStorage often isn't shared between downloads — hence export.)

import { z } from 'zod'
import type { SrsRecord } from './types'

export const SAVE_VERSION = 1
const KEY = 'lang.save.v1'

const recordSchema = z.object({
  status: z.enum(['new', 'scheduled', 'due']),
  due: z.number(),
  last: z.number().nullable(),
  interval: z.number(),
  reps: z.number(),
  lapses: z.number(),
})

const saveSchema = z.object({
  version: z.literal(SAVE_VERSION),
  courseId: z.string(),
  records: z.record(z.string(), recordSchema),
  deleted: z.array(z.string()).default([]),
  freeScroll: z.boolean().default(false),
  hideTarget: z.boolean().default(false),
})

export type SaveData = z.infer<typeof saveSchema>

export function emptySave(courseId: string): SaveData {
  return {
    version: SAVE_VERSION,
    courseId,
    records: {},
    deleted: [],
    freeScroll: false,
    hideTarget: false,
  }
}

/** Load + validate. Returns null on missing or incompatible/corrupt data. */
export function load(courseId: string): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = saveSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return null
    if (parsed.data.courseId !== courseId) return null
    return parsed.data
  } catch {
    return null
  }
}

export function save(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // Quota/availability failures shouldn't crash the session.
  }
}

/** Encode the whole save as a portable base64 string. */
export function exportString(data: SaveData): string {
  const json = JSON.stringify(data)
  // btoa needs latin1; round-trip via encodeURIComponent for any unicode.
  return btoa(unescape(encodeURIComponent(json)))
}

/** Decode + validate an exported string. Returns null if it doesn't apply. */
export function importString(b64: string, courseId: string): SaveData | null {
  try {
    const json = decodeURIComponent(escape(atob(b64.trim())))
    const parsed = saveSchema.safeParse(JSON.parse(json))
    if (!parsed.success) return null
    if (parsed.data.courseId !== courseId) return null
    return parsed.data
  } catch {
    return null
  }
}

export type { SrsRecord }
