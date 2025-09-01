export default function Spinner({ label }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-slate-600 animate-pulse" role="status" aria-live="polite">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.25"/>
        <path d="M22 12a10 10 0 0 1-10 10" fill="none" stroke="currentColor" strokeWidth="2"/>
      </svg>
      <span>{label || 'Working...'}</span>
    </div>
  )
}
