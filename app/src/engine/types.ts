// Core data model for the language-learning engine.
// Deliberately content-agnostic: a Course is just data, so French/Italian/any
// language drops in without touching the engine.

export type Tier = 'obvious' | 'easy' | 'mid' | 'hard'

export type CardKind = 'line' | 'word'

export interface Translation {
  /** Strict source-order rendering; editorial additions in [brackets]. */
  literal: string
  /** Idiomatic, natural target-language meaning. */
  natural: string
}

/** A reference the audio layer resolves to a playable [start, end] segment. */
export interface AudioRef {
  /** Identifier of the recording/clip this card lives in. */
  clip: string
  /** Optional explicit segment; if absent the audio layer derives it. */
  start?: number
  end?: number
}

export interface Card {
  id: string
  kind: CardKind
  /** Text in the language being learned (the prompt side). */
  target: string
  translation: Translation
  /** Word-by-word gloss, mainly for line cards. */
  gloss?: string
  /** Sub-tokens (e.g. the words inside a line). */
  tokens?: string[]
  tier: Tier
  /** For word cards: the line they were lifted from (context + audio). */
  sourceLineId?: string
  audio?: AudioRef
  note?: string
}

export interface Unit {
  id: string
  title: string
  cards: Card[]
}

export interface Course {
  id: string
  /** BCP-47-ish code of the language being taught, e.g. 'fr'. */
  lang: string
  title: string
  subtitle?: string
  units: Unit[]
}

// --- Spaced-repetition state -------------------------------------------------

export type SrsStatus = 'new' | 'scheduled' | 'due'

/**
 * Per-card scheduling record. The model is MANUAL: the learner picks the next
 * interval with a slider rather than the engine grading Again/Hard/Good/Easy.
 * `interval` is stored in minutes.
 */
export interface SrsRecord {
  status: SrsStatus
  /** Epoch ms when the card next becomes due. */
  due: number
  /** Epoch ms of the most recent review, or null if never reviewed. */
  last: number | null
  /** Most recently chosen interval, in minutes. */
  interval: number
  reps: number
  lapses: number
}
