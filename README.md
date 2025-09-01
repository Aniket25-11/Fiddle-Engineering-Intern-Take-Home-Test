# Tone Picker Text Tool

A small React + Express app that lets you **adjust the tone of text** via a 3×3 picker (Formality × Warmth) and integrates with **Mistral Small** via the chat completions API. Includes **Undo/Redo**, **loading states**, **request caching**, and optional **local persistence**.

> Left: editable text field. Right: 3×3 tone picker + reset. Undo/Redo buttons and keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Y / Ctrl+Shift+Z).

---

## Quick Start

### 1) Backend (API proxy)

```bash
cd backend
cp .env.example .env   # add your Mistral API key
npm install
npm run dev            # starts on http://localhost:8787
```

- Get a Mistral API key from their console.
- The backend proxies requests to Mistral's `/v1/chat/completions` and caches responses.

### 2) Frontend (React UI)

```bash
cd ../frontend
npm install
npm run dev            # opens http://localhost:5173
```

The dev server proxies `/api/*` → `http://localhost:8787`.

---

## Deployment

- **Frontend**: Vercel (or Netlify) — static build via `npm run build` in `/frontend`.
- **Backend**: Render (Free Web Service) or Railway — Node service from `/backend` listening on the provided port.
- Update the frontend's API URL if your backend lives elsewhere (in `vite.config.js` or switch to an env var).

---

## How it works

### 3×3 Tone Picker

- Rows = **Formality**: Formal / Neutral / Casual
- Columns = **Warmth**: Stern / Neutral / Friendly
- Each cell maps to a system prompt that guides rewriting while preserving meaning & length.

### Undo/Redo

- We maintain a simple **history array** (`useHistory`) with a cursor index.
- Pushing new text truncates future states, then appends the new version.
- Disabled while an API call is in flight to avoid odd interleavings.

### Selection-aware edits

- If you highlight a portion of text, only that selection is rewritten; otherwise the entire text is transformed.

### Caching

- The backend uses an **LRU cache** keyed by `{text, formality, warmth, intensity, model}` to return identical requests instantly and reduce latency/cost.

### Persistence (Optional)

- We write `{ history, index, selected }` to **localStorage** after every change.
- Click **Clear** to wipe local storage.

### Error Handling

- Network and API errors render a prominent inline error with the HTTP code/message and a Dismiss action.
- Invalid input is validated on the server with Zod (e.g., empty text).

---

## Configuration

Backend `.env`

```
PORT=8787
MISTRAL_API_KEY=your_api_key_here
MISTRAL_MODEL=mistral-small-latest
CACHE_TTL_MS=300000
CACHE_MAX=200
```

> `mistral-small-latest` currently points to the latest small model (per Mistral docs).

---

## Scripts

**Backend**

- `npm run dev` – start with live reload
- `npm start` – start without nodemon

**Frontend**

- `npm run dev` – Vite dev server
- `npm run build` – production build
- `npm run preview` – preview production build locally

---

## Testing guide (manual)

1. Paste a paragraph into the editor.
2. Click different cells in the grid and observe tone changes with loading indicator.
3. Verify **Undo/Redo** via buttons and keyboard shortcuts.
4. Highlight a sentence then apply a tone; ensure only the selection changes.
5. Toggle **Reset** to return to the initial state.
6. Kill the backend and try again to confirm an error is shown.
7. Reload the page — your text/history should persist (until **Clear**).

---

## Architecture notes

- **Frontend**: Vite + React + Tailwind, minimal dependencies, simple state via hooks.
- **Backend**: Express proxy to Mistral; no secrets leak to the client; LRU cache reduces duplicate calls; Zod for input validation; Axios with timeouts for resilience.
- **Prompting**: system prompt codifies tone axes; temperature scales with *intensity* (distance from center cell).
- **Accessibility**: keyboard shortcuts, ARIA roles on grid cells, high-contrast focus rings.

---

## Recording a short demo

- Use Loom/Screen Studio or QuickTime.
- Show: paste text → pick a couple cells → selection-only change → undo/redo → reset → error state (disable backend) → reload to show persistence.
- Keep it under 90 seconds.

---

## Notes / Trade-offs

- No streaming — simpler and sufficient for short rewrites.
- LRU cache in-memory only; for multi-instance deployment, consider Redis.
- If you need strict length preservation, add a server-side `max_tokens` cap and a more constrained prompt.
