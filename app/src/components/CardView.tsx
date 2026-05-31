import { useEffect, useState } from 'react'
import type { Card, SrsRecord } from '../engine/types'
import { play } from '../engine/audio'
import { formatMinutes } from '../engine/interval'

interface Props {
  card: Card
  record: SrsRecord
  lineText?: string
  hideTarget: boolean
}

/** The study card: French prompt, button-to-flip translations, per-word and
 *  per-line audio. In audio-only mode the French text is hidden so you train
 *  your ear without reading it in an English accent. */
export function CardView({ card, record, lineText, hideTarget }: Props) {
  const [revealed, setRevealed] = useState(false)

  // New card -> hide the answer again.
  useEffect(() => {
    setRevealed(false)
  }, [card.id])

  const playWord = () =>
    play({ clip: card.audio?.clip, segmentKey: card.target, text: card.target })
  const playLine = () =>
    lineText &&
    play({
      clip: card.audio?.clip,
      segmentKey: card.kind === 'line' ? card.id : card.sourceLineId,
      text: lineText,
    })

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
      <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
        <span className="uppercase tracking-wide">
          {card.kind === 'line' ? 'Line' : 'Word'} · {card.tier}
        </span>
        <span className="tabular-nums">
          {record.reps > 0
            ? `${formatMinutes(record.interval)} · ${new Date(record.due).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
            : 'new'}
        </span>
      </div>

      {/* Prompt */}
      <div className="min-h-[88px] py-3 text-center">
        {hideTarget ? (
          <div className="text-zinc-500">
            <div className="text-3xl">🙈</div>
            <div className="mt-1 text-sm">Listen &amp; guess — French hidden</div>
          </div>
        ) : (
          <div className="text-3xl font-semibold leading-snug text-zinc-50">
            {card.target}
          </div>
        )}
        {card.kind === 'word' && lineText && !hideTarget && (
          <div className="mt-1 text-sm text-zinc-500">from “{lineText}”</div>
        )}
      </div>

      {/* Audio */}
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={playWord}
          className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-700"
        >
          🔊 {card.kind === 'line' ? 'Line' : 'Word'}
        </button>
        {card.kind === 'word' && lineText && (
          <button
            type="button"
            onClick={playLine}
            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-700"
          >
            ▶ In context
          </button>
        )}
      </div>

      {/* Answer */}
      <div className="mt-4 border-t border-zinc-800 pt-4">
        {revealed ? (
          <div className="space-y-2 text-center">
            <div className="text-lg text-zinc-100">
              {card.translation.natural}
            </div>
            {card.translation.literal !== card.translation.natural && (
              <div className="text-sm text-zinc-400">
                literal: {card.translation.literal}
              </div>
            )}
            {card.gloss && (
              <div className="text-xs text-zinc-500">{card.gloss}</div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mx-auto block rounded-lg border border-zinc-700 px-5 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
          >
            Show meaning
          </button>
        )}
      </div>
    </div>
  )
}
