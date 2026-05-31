import { useEffect, useState } from 'react'
import {
  BANDS,
  dueLabel,
  formatMinutes,
  minutesFromPos,
} from '../engine/interval'

interface Props {
  /** Suggested starting interval (e.g. the card's last interval). */
  initialMinutes?: number
  onCommit: (minutes: number) => void
  now: number
}

/**
 * Manual review control: pick the next interval, then commit. The learner sets
 * the interval directly (no Again/Hard/Good/Easy). `touch-action: none` on the
 * range keeps the drag from being stolen by page scroll on Android.
 */
export function IntervalSlider({ initialMinutes, onCommit, now }: Props) {
  const [bandIndex, setBandIndex] = useState(1)
  const [pos, setPos] = useState(0.4)
  const band = BANDS[bandIndex]
  const minutes = minutesFromPos(band, pos)

  // Reset toward the suggested interval when the card changes.
  useEffect(() => {
    setPos(0.4)
  }, [initialMinutes])

  return (
    <div className="select-none">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-zinc-400">Next review in</span>
        <span className="tabular-nums font-semibold text-sky-300">
          {formatMinutes(minutes)}{' '}
          <span className="text-zinc-500">· {dueLabel(minutes, now)}</span>
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={1000}
        value={Math.round(pos * 1000)}
        onChange={(e) => setPos(Number(e.target.value) / 1000)}
        aria-label="Review interval"
        className="w-full accent-sky-400"
        style={{ touchAction: 'none' }}
      />

      <div className="mt-3 flex items-center gap-2">
        <div className="flex gap-1 rounded-lg bg-zinc-800 p-1">
          {BANDS.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBandIndex(i)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                i === bandIndex
                  ? 'bg-sky-500 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onCommit(minutes)}
          className="ml-auto rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 active:scale-95"
        >
          Commit ↵
        </button>
      </div>
    </div>
  )
}
