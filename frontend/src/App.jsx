import { useEffect, useRef, useState } from 'react'
import ToneGrid from './components/ToneGrid'
import Toolbar from './components/Toolbar'
import useHistory from './hooks/useHistory'
import { intensityFromCell, styleFromCell, buildSystemPrompt } from './lib/prompt'
import { rewriteTone } from './lib/api'
import { loadState, saveState, clearState } from './lib/storage'

export default function App() {
  const persisted = loadState()
  const initialText = persisted?.history?.[persisted.index] ?? ""
  const history = useHistory(initialText, persisted?.history, persisted?.index ?? 0)
  const [selected, setSelected] = useState(persisted?.selected || null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const taRef = useRef(null)
  const abortRef = useRef(null)

  // Persist state
  useEffect(() => {
    saveState({
      history: history.history,
      index: history.index,
      selected
    })
  }, [history.history, history.index, selected])

  const onTextChange = (e) => {
    const val = e.target.value
    history.push(val)
  }

  const onPick = async ({ r, c }) => {
    const textArea = taRef.current
    const fullText = history.current
    const selectionStart = textArea ? textArea.selectionStart : 0
    const selectionEnd = textArea ? textArea.selectionEnd : fullText.length
    const hasSelection = selectionEnd > selectionStart

    const { formality, warmth } = styleFromCell(r, c)
    setSelected({ r, c, formality, warmth })

    const intensity = intensityFromCell(r, c)
    const system = buildSystemPrompt({ formality, warmth })
    const toSend = hasSelection ? fullText.slice(selectionStart, selectionEnd) : fullText

    abortRef.current?.abort?.()
    const controller = new AbortController()
    abortRef.current = controller

    setBusy(true)
    history.setBusy(true)
    setError('')
    try {
      const rewritten = await rewriteTone({
        text: toSend,
        formality,
        warmth,
        intensity
      })
      const nextText = hasSelection
        ? fullText.slice(0, selectionStart) + rewritten + fullText.slice(selectionEnd)
        : rewritten
      history.push(nextText)
    } catch (err) {
      setError(err.message || 'Request failed')
    } finally {
      setBusy(false)
      history.setBusy(false)
    }
  }

  const onReset = () => {
    if (history.history.length > 0) {
      const first = history.history[0]
      history.setHistory([first])
      setSelected(null)
      saveState({ history: [first], index: 0, selected: null })
    }
  }

  const onClear = () => {
    clearState()
    window.location.reload()
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-slate-50 min-h-screen">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Tone Picker Text Tool
        </h1>
        <p className="text-slate-600">
          Edit on the left, pick a tone on the right. Undo/Redo supported. Selection-aware tone changes.
        </p>
      </header>

      <Toolbar
        busy={busy}
        onUndo={history.undo}
        onRedo={history.redo}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onReset={onReset}
        onClear={onClear}
        error={error}
        onDismissError={() => setError('')}
      />

      <main className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="col-span-1">
          <label htmlFor="editor" className="sr-only">Editor</label>
          <textarea
            id="editor"
            ref={taRef}
            className="w-full h-[60vh] p-4 rounded-xl border border-slate-300 shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={history.current}
            onChange={onTextChange}
            placeholder="Paste or type your text here, then pick a tone on the right →"
            aria-label="Editable text"
          />
        </section>

        <aside className="col-span-1">
          <div className="p-3 sm:p-4 rounded-xl border border-blue-100 bg-white shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium text-blue-700">Tone Picker</h2>
              {selected ? (
                <span className="text-xs text-slate-600">
                  Selected: {selected.formality} &middot; {selected.warmth}
                </span>
              ) : <span className="text-xs text-slate-500">Pick a cell</span>}
            </div>
            <ToneGrid onPick={onPick} selected={selected} disabled={busy} />
            <p className="text-xs text-slate-500 mt-3">
              Tip: Highlight a passage to tone-shift only that section.
            </p>
          </div>
        </aside>
      </main>

      <footer className="mt-6 text-xs text-slate-400 text-center">
        <p>Built for the Fiddle Engineering Intern take-home.</p>
      </footer>
    </div>
  )
}
