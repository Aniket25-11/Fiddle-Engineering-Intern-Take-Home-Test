import { useCallback, useMemo, useRef, useState } from 'react'

export default function useHistory(initial) {
  const [history, setHistory] = useState([initial])
  const [index, setIndex] = useState(0)
  const isBusyRef = useRef(false)

  const current = history[index]

  const canUndo = index > 0
  const canRedo = index < history.length - 1

  const push = useCallback((next) => {
    setHistory((h) => {
      const sliced = h.slice(0, index + 1)
      sliced.push(next)
      return sliced
    })
    setIndex((i) => i + 1)
  }, [index])

  const undo = useCallback(() => {
    if (isBusyRef.current) return
    setIndex((i) => Math.max(0, i - 1))
  }, [])

  const redo = useCallback(() => {
    if (isBusyRef.current) return
    setIndex((i) => Math.min(history.length - 1, i + 1))
  }, [history.length])

  const setBusy = (v) => { isBusyRef.current = v }

  return { current, setHistory, history, index, canUndo, canRedo, push, undo, redo, setBusy }
}
