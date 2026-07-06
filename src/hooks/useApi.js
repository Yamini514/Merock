import { useState, useEffect, useCallback, useRef } from 'react'

// Runs an async function on mount (and when `deps` change), tracking
// loading / error / data and exposing a `refetch`. Ignores results from
// stale calls so rapid filter changes don't race.
export function useApi(fn, deps = []) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const callId = useRef(0)

  // Callers pass their own dependency list (mirroring useMemo semantics),
  // so the static array-literal rule can't apply here by design.
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  const memoFn = useCallback(fn, deps)

  const run = useCallback(() => {
    const id = ++callId.current
    setLoading(true)
    setError(null)
    return Promise.resolve()
      .then(memoFn)
      .then(res => { if (id === callId.current) setData(res) ; return res })
      .catch(err => { if (id === callId.current) setError(err) })
      .finally(() => { if (id === callId.current) setLoading(false) })
  }, [memoFn])

  // Data fetching on mount/deps-change; the data/error setStates resolve
  // asynchronously — only the loading flag flips synchronously, which is
  // the canonical fetch-hook shape.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { run() }, [run])

  return { data, loading, error, refetch: run, setData }
}
