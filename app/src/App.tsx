import { useState } from 'react'
import { useStudy } from './app/useStudy'
import { frStromae, lineOf } from './content/fr-stromae'
import { CardView } from './components/CardView'
import { IntervalSlider } from './components/IntervalSlider'
import { MemoryMap } from './components/MemoryMap'

const VERSION = '0.1.0'

export default function App() {
  const study = useStudy(frStromae)
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [flash, setFlash] = useState<string | null>(null)

  const { current } = study
  const lineText = current ? lineOf(study.course, current) : undefined

  const note = (msg: string) => {
    setFlash(msg)
    setTimeout(() => setFlash(null), 2000)
  }

  const doExport = async () => {
    const s = study.exportProgress()
    try {
      await navigator.clipboard.writeText(s)
      note('Progress copied to clipboard')
    } catch {
      setImportText(s)
      setImportOpen(true)
      note('Copy this backup string')
    }
  }

  const doImport = () => {
    if (study.importProgress(importText.trim())) {
      note('Progress imported')
      setImportOpen(false)
      setImportText('')
    } else {
      note('Import failed — incompatible string')
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col gap-4 px-4 py-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-zinc-50">{study.course.title}</h1>
          <p className="text-xs text-zinc-500">{study.course.subtitle}</p>
        </div>
        <div className="text-right text-xs text-zinc-500">
          <div className="font-semibold text-sky-300">{study.dueCount} due</div>
          <div>{study.cards.length} cards</div>
        </div>
      </header>

      {/* Settings row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => study.setFreeScroll(!study.freeScroll)}
          className={`rounded-lg px-2.5 py-1 ${study.freeScroll ? 'bg-sky-500 text-white' : 'bg-zinc-800 text-zinc-300'}`}
        >
          {study.freeScroll ? 'Free scroll: on' : 'Free scroll: off'}
        </button>
        <button
          type="button"
          onClick={() => study.setHideTarget(!study.hideTarget)}
          className={`rounded-lg px-2.5 py-1 ${study.hideTarget ? 'bg-sky-500 text-white' : 'bg-zinc-800 text-zinc-300'}`}
        >
          {study.hideTarget ? 'Audio: hidden' : 'Audio: shown'}
        </button>
        <button
          type="button"
          onClick={doExport}
          className="rounded-lg bg-zinc-800 px-2.5 py-1 text-zinc-300"
        >
          Export
        </button>
        <button
          type="button"
          onClick={() => setImportOpen((v) => !v)}
          className="rounded-lg bg-zinc-800 px-2.5 py-1 text-zinc-300"
        >
          Import
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm('Reset all progress?')) study.reset()
          }}
          className="rounded-lg bg-zinc-800 px-2.5 py-1 text-zinc-400"
        >
          Reset
        </button>
      </div>

      {importOpen && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste a backup string…"
            className="h-20 w-full resize-none rounded bg-zinc-950 p-2 text-xs text-zinc-200"
          />
          <button
            type="button"
            onClick={doImport}
            className="mt-1 rounded bg-sky-500 px-3 py-1 text-xs font-semibold text-white"
          >
            Apply
          </button>
        </div>
      )}

      {/* Card */}
      {current ? (
        <CardView
          card={current}
          record={study.recordFor(current.id)}
          lineText={lineText}
          hideTarget={study.hideTarget}
        />
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-10 text-center text-zinc-400">
          🎉 Nothing due right now. Turn on free scroll to browse.
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={study.prev}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
        >
          ← Prev
        </button>
        {current && (
          <button
            type="button"
            onClick={() => current && study.remove(current.id)}
            className="rounded-lg px-3 py-2 text-xs text-zinc-500 hover:text-rose-400"
          >
            Hide card
          </button>
        )}
        <button
          type="button"
          onClick={study.next}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
        >
          Next →
        </button>
      </div>

      {/* Review control */}
      {current && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <IntervalSlider
            key={current.id}
            initialMinutes={study.recordFor(current.id).interval}
            onCommit={study.commit}
            now={study.now}
          />
        </div>
      )}

      {/* Memory map */}
      <div>
        <div className="mb-1 text-xs text-zinc-500">Memory map</div>
        <MemoryMap
          cards={study.cards}
          recordFor={study.recordFor}
          now={study.now}
          currentId={current?.id}
          onPick={study.goTo}
        />
      </div>

      <footer className="mt-auto flex items-center justify-between pt-2 text-[10px] text-zinc-600">
        <span>v{VERSION}</span>
        {study.deletedIds.length > 0 && (
          <button
            type="button"
            onClick={() => study.deletedIds.forEach(study.restore)}
            className="hover:text-zinc-400"
          >
            Restore {study.deletedIds.length} hidden
          </button>
        )}
      </footer>

      {flash && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-lg">
          {flash}
        </div>
      )}
    </div>
  )
}
