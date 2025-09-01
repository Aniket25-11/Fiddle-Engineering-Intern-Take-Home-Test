import { clsx } from 'clsx'
import { FORMALITY, WARMTH, styleFromCell } from '../lib/prompt'

export default function ToneGrid({ onPick, selected, disabled }) {
  return (
    <div
      className={clsx(
        "grid grid-cols-3 grid-rows-3 gap-2",
        disabled && "opacity-60 pointer-events-none"
      )}
      role="grid"
      aria-disabled={disabled}
    >
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => {
          const isSelected = selected && selected.r === r && selected.c === c
          const style = styleFromCell(r, c)
          return (
            <button
              key={`${r}-${c}`}
              onClick={() => onPick({ r, c, ...style })}
              className={clsx(
                "h-16 rounded-xl border text-xs px-2 py-1 transition-colors",
                "hover:bg-slate-200 active:translate-y-px",
                isSelected
                  ? "border-slate-200 bg-slate-300" // ✅ selected → darker bg, normal border
                  : "border-slate-200 bg-slate-50"
              )}
              aria-pressed={isSelected}
              role="gridcell"
            >
              <div className="font-medium">{style.formality}</div>
              <div className="text-slate-600">{style.warmth}</div>
            </button>
          )
        })
      )}
      <Legend />
    </div>
  )
}

function Legend() {
  return (
    <div className="col-span-3 mt-2 text-xs text-slate-600">
      <div className="flex items-center justify-between">
        <span>← Stern</span>
        <span>Neutral</span>
        <span>Friendly →</span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span>↑ Formal</span>
        <span>Neutral</span>
        <span>Casual ↓</span>
      </div>
    </div>
  )
}
