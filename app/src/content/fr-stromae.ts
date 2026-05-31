// First French course: a short educational excerpt of Stromae's "Alors on danse"
// (the repeated «Qui dit … dit …» pattern is ideal for a beginner deck).
// Kept to a few lines on purpose — fair-use excerpt, not the full song.
//
// Content is pure data. Word cards are derived from the lines and auto-mapped to
// the first line that contains them (context + audio), mirroring the prototype.

import type { Card, Course, Tier, Unit } from '../engine/types'

interface LineSeed {
  id: string
  fr: string
  literal: string
  natural: string
  gloss: string
}

const LINES: LineSeed[] = [
  {
    id: 'L1',
    fr: 'Qui dit études dit travail',
    literal: 'Who says studies says work',
    natural: 'Studying means working',
    gloss: 'qui=who · dit=says · études=studies · dit=says · travail=work',
  },
  {
    id: 'L2',
    fr: 'Qui dit taf te dit les thunes',
    literal: 'Who says job [to-]you says the cash',
    natural: 'A job means money',
    gloss: 'qui=who · dit=says · taf=job(slang) · te=to-you · dit=says · les=the · thunes=cash(slang)',
  },
  {
    id: 'L3',
    fr: 'Qui dit argent dit dépenses',
    literal: 'Who says money says expenses',
    natural: 'Money means spending',
    gloss: 'qui=who · dit=says · argent=money · dit=says · dépenses=expenses',
  },
  {
    id: 'L4',
    fr: 'Qui dit crédit dit créance',
    literal: 'Who says credit says debt-claim',
    natural: 'Credit means owing',
    gloss: 'qui=who · dit=says · crédit=credit · dit=says · créance=debt owed',
  },
  {
    id: 'L5',
    fr: 'Qui dit dette te dit huissier',
    literal: 'Who says debt [to-]you says bailiff',
    natural: 'Debt brings the bailiff',
    gloss: 'qui=who · dit=says · dette=debt · te=to-you · dit=says · huissier=bailiff',
  },
]

// [french, english, tier] — one row per distinct vocabulary item.
const WORDS: Array<[string, string, Tier]> = [
  ['qui', 'who', 'easy'],
  ['dit', 'says (dire)', 'mid'],
  ['études', 'studies', 'easy'],
  ['travail', 'work', 'easy'],
  ['taf', 'job (slang)', 'hard'],
  ['te', 'to you', 'mid'],
  ['les', 'the (plural)', 'easy'],
  ['thunes', 'cash (slang)', 'hard'],
  ['argent', 'money', 'easy'],
  ['dépenses', 'expenses', 'mid'],
  ['crédit', 'credit', 'obvious'],
  ['créance', 'debt owed', 'hard'],
  ['dette', 'debt', 'mid'],
  ['huissier', 'bailiff', 'hard'],
]

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .replace(/[^a-z]/g, '')

/** id-safe ascii slug of a French word, e.g. "études" -> "etudes". */
const slug = (s: string) => norm(s)

/** First line whose words contain `word` (context + audio source). */
function sourceLineFor(word: string): string | undefined {
  const w = norm(word)
  for (const line of LINES) {
    if (line.fr.split(/\s+/).some((t) => norm(t) === w)) return line.id
  }
  return undefined
}

function buildCards(): Card[] {
  const lineCards: Card[] = LINES.map((l) => ({
    id: l.id,
    kind: 'line',
    target: l.fr,
    translation: { literal: l.literal, natural: l.natural },
    gloss: l.gloss,
    tokens: l.fr.split(/\s+/),
    tier: 'mid',
    audio: { clip: 'alors-on-danse' },
  }))

  const wordCards: Card[] = WORDS.map(([fr, en, tier]) => {
    const sourceLineId = sourceLineFor(fr)
    return {
      id: `W-${slug(fr)}`,
      kind: 'word',
      target: fr,
      translation: { literal: en, natural: en },
      tier,
      sourceLineId,
      audio: { clip: 'alors-on-danse' },
    }
  })

  return [...lineCards, ...wordCards]
}

export const frStromae: Course = {
  id: 'fr-stromae-alors-on-danse',
  lang: 'fr',
  title: 'French · Stromae',
  subtitle: '«Alors on danse» — Qui dit … dit …',
  units: [
    {
      id: 'U1',
      title: 'Qui dit … dit …',
      cards: buildCards(),
    } satisfies Unit,
  ],
}

/** Convenience: the line a card belongs to (for audio + context). */
export function lineOf(course: Course, card: Card): string | undefined {
  const lineId = card.kind === 'line' ? card.id : card.sourceLineId
  if (!lineId) return undefined
  for (const u of course.units) {
    const found = u.cards.find((c) => c.id === lineId)
    if (found) return found.target
  }
  return undefined
}
