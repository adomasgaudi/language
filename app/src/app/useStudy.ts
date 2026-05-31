import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Card, Course, SrsRecord } from '../engine/types'
import { commitInterval, isDue, newRecord } from '../engine/srs'
import {
  emptySave,
  exportString,
  importString,
  load,
  save,
  type SaveData,
} from '../engine/storage'

export interface Study {
  course: Course
  cards: Card[] // visible deck (excludes deleted)
  current: Card | null
  records: Record<string, SrsRecord>
  recordFor: (id: string) => SrsRecord
  now: number
  dueCount: number
  freeScroll: boolean
  hideTarget: boolean
  deletedIds: string[]
  setFreeScroll: (v: boolean) => void
  setHideTarget: (v: boolean) => void
  next: () => void
  prev: () => void
  goTo: (cardId: string) => void
  commit: (minutes: number) => void
  remove: (cardId: string) => void
  restore: (cardId: string) => void
  reset: () => void
  exportProgress: () => string
  importProgress: (b64: string) => boolean
}

export function useStudy(course: Course): Study {
  const allCards = useMemo(
    () => course.units.flatMap((u) => u.cards),
    [course],
  )

  const [data, setData] = useState<SaveData>(
    () => load(course.id) ?? emptySave(course.id),
  )
  const [index, setIndex] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  // Live tick for the forgetting-curve map.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // Persist whenever the save blob changes.
  useEffect(() => {
    save(data)
  }, [data])

  const deletedSet = useMemo(() => new Set(data.deleted), [data.deleted])
  const cards = useMemo(
    () => allCards.filter((c) => !deletedSet.has(c.id)),
    [allCards, deletedSet],
  )

  const recordFor = useCallback(
    (id: string) => data.records[id] ?? newRecord(),
    [data.records],
  )

  // Keep index in range as the deck changes.
  const safeIndex = cards.length === 0 ? 0 : Math.min(index, cards.length - 1)
  const current = cards[safeIndex] ?? null

  const dueCount = useMemo(
    () => cards.filter((c) => isDue(recordFor(c.id), now)).length,
    [cards, recordFor, now],
  )

  // Use a ref so navigation callbacks don't churn on every tick.
  const nowRef = useRef(now)
  nowRef.current = now

  const next = useCallback(() => {
    if (cards.length === 0) return
    setIndex((i) => {
      const start = Math.min(i, cards.length - 1)
      if (data.freeScroll) return (start + 1) % cards.length
      for (let step = 1; step <= cards.length; step++) {
        const j = (start + step) % cards.length
        if (isDue(data.records[cards[j].id] ?? newRecord(), nowRef.current)) return j
      }
      return start // nothing due — stay put
    })
  }, [cards, data.freeScroll, data.records])

  const prev = useCallback(() => {
    if (cards.length === 0) return
    setIndex((i) => {
      const start = Math.min(i, cards.length - 1)
      if (data.freeScroll) return (start - 1 + cards.length) % cards.length
      for (let step = 1; step <= cards.length; step++) {
        const j = (start - step + cards.length) % cards.length
        if (isDue(data.records[cards[j].id] ?? newRecord(), nowRef.current)) return j
      }
      return start
    })
  }, [cards, data.freeScroll, data.records])

  const goTo = useCallback(
    (cardId: string) => {
      const j = cards.findIndex((c) => c.id === cardId)
      if (j >= 0) setIndex(j)
    },
    [cards],
  )

  const commit = useCallback(
    (minutes: number) => {
      const card = cards[Math.min(index, cards.length - 1)]
      if (!card) return
      const updated = commitInterval(recordFor(card.id), minutes, Date.now())
      setData((d) => ({ ...d, records: { ...d.records, [card.id]: updated } }))
      // Advance to the next due card after committing.
      setTimeout(next, 0)
    },
    [cards, index, recordFor, next],
  )

  const remove = useCallback((cardId: string) => {
    setData((d) =>
      d.deleted.includes(cardId)
        ? d
        : { ...d, deleted: [...d.deleted, cardId] },
    )
  }, [])

  const restore = useCallback((cardId: string) => {
    setData((d) => ({ ...d, deleted: d.deleted.filter((x) => x !== cardId) }))
  }, [])

  const reset = useCallback(() => {
    setData(emptySave(course.id))
    setIndex(0)
  }, [course.id])

  const setFreeScroll = useCallback(
    (v: boolean) => setData((d) => ({ ...d, freeScroll: v })),
    [],
  )
  const setHideTarget = useCallback(
    (v: boolean) => setData((d) => ({ ...d, hideTarget: v })),
    [],
  )

  const exportProgress = useCallback(() => exportString(data), [data])
  const importProgress = useCallback(
    (b64: string) => {
      const incoming = importString(b64, course.id)
      if (!incoming) return false
      setData(incoming)
      setIndex(0)
      return true
    },
    [course.id],
  )

  return {
    course,
    cards,
    current,
    records: data.records,
    recordFor,
    now,
    dueCount,
    freeScroll: data.freeScroll,
    hideTarget: data.hideTarget,
    deletedIds: data.deleted,
    setFreeScroll,
    setHideTarget,
    next,
    prev,
    goTo,
    commit,
    remove,
    restore,
    reset,
    exportProgress,
    importProgress,
  }
}
