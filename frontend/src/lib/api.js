const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function rewriteTone({ text, formality, warmth, intensity, signal }) {
  const res = await fetch(`${API_BASE}/api/tone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, formality, warmth, intensity }),
    signal
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const message = data.error || res.statusText
    const code = data.code || res.status
    throw new Error(`${code}: ${message}`)
  }
  const data = await res.json()
  return data.text
}
