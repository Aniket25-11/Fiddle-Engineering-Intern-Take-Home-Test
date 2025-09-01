import Spinner from './Spinner'

export default function Toolbar({ busy, onUndo, onRedo, canUndo, canRedo, onReset, onClear, error, onDismissError }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={onUndo}
        disabled={!canUndo || busy}
        className="px-3 py-2 rounded-lg border bg-white disabled:opacity-50"
        title="Undo (Ctrl+Z)"
      >Undo</button>
      <button
        onClick={onRedo}
        disabled={!canRedo || busy}
        className="px-3 py-2 rounded-lg border bg-white disabled:opacity-50"
        title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
      >Redo</button>
      <button
        onClick={onReset}
        disabled={busy}
        className="px-3 py-2 rounded-lg border bg-white"
        title="Reset to original"
      >Reset</button>
      <button
        onClick={onClear}
        disabled={busy}
        className="px-3 py-2 rounded-lg border bg-white"
        title="Clear local data"
      >Clear</button>
      <div className="ml-auto">
        {busy ? <Spinner label="Rewriting tone..." /> : null}
      </div>
      {error ? (
        <div className="w-full mt-2 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start justify-between">
          <div>
            <div className="font-medium">Something went wrong</div>
            <div>{error}</div>
          </div>
          <button onClick={onDismissError} className="ml-4 underline">Dismiss</button>
        </div>
      ) : null}
    </div>
  )
}
