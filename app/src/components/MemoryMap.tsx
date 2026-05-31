import type { Card, SrsRecord } from '../engine/types'
import { dotStyle, type CrystalMaterial } from '../engine/memorymap'

interface Props {
  cards: Card[]
  recordFor: (id: string) => SrsRecord
  now: number
  currentId?: string
  onPick: (cardId: string) => void
}

const MATERIAL_BG: Record<CrystalMaterial, string> = {
  silver: 'linear-gradient(145deg, #e8eef5, #9aa6b5)',
  gold: 'linear-gradient(145deg, #ffe79a, #d4a017)',
  ruby: 'linear-gradient(145deg, #ff7a8a, #b3122b)',
  diamond: 'linear-gradient(145deg, #ffffff, #bfe9ff)',
}

/** The forgetting-curve map: one dot/crystal per card, updating live. */
export function MemoryMap({ cards, recordFor, now, currentId, onPick }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {cards.map((card) => {
        const s = dotStyle(card, recordFor(card.id), now)
        const isCurrent = card.id === currentId
        const isCrystal = s.kind === 'crystal'

        const base: React.CSSProperties = {
          width: s.diameter,
          height: s.diameter,
          transition: 'background-color 0.6s ease, box-shadow 0.6s ease, transform 0.2s ease',
        }

        const style: React.CSSProperties = s.due
          ? {
              ...base,
              background: 'transparent',
              border: '1.5px solid rgba(0,0,0,0.85)',
              outline: '1px solid rgba(255,255,255,0.15)',
            }
          : isCrystal
            ? {
                ...base,
                background: MATERIAL_BG[s.material as CrystalMaterial],
                boxShadow: s.glow ? `0 0 10px 2px ${s.color}` : 'none',
              }
            : {
                ...base,
                background: s.color,
                boxShadow: s.glow ? `0 0 8px 2px ${s.color}` : 'none',
              }

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onPick(card.id)}
            title={`${card.target} · ${s.due ? 'due' : 'scheduled'}`}
            aria-label={`${card.target}, ${s.due ? 'due' : 'scheduled'}`}
            className="relative grid place-items-center"
            style={{ width: Math.max(s.diameter, 16), height: Math.max(s.diameter, 16) }}
          >
            <span
              style={{
                ...style,
                borderRadius: isCrystal ? '4px' : '9999px',
                transform: `${isCrystal ? 'rotate(45deg)' : ''} ${
                  isCurrent ? 'scale(1.25)' : 'scale(1)'
                }`,
                display: 'block',
              }}
            />
            {/* crack overlay for due crystals */}
            {s.cracked && (
              <svg
                viewBox="0 0 20 20"
                className="pointer-events-none absolute"
                style={{ width: s.diameter, height: s.diameter }}
              >
                <path
                  d="M10 0 L8 7 L12 9 L7 20 M8 7 L2 6 M12 9 L19 11"
                  stroke="rgba(0,0,0,0.7)"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
            )}
            {isCurrent && (
              <span className="pointer-events-none absolute -bottom-1 h-1 w-1 rounded-full bg-sky-300" />
            )}
          </button>
        )
      })}
    </div>
  )
}
