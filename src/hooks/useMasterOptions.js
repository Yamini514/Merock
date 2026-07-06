import { useState, useEffect } from 'react'
import { listOptions } from '../api/masterData'

// Returns [{value,label}] options for a master-data category, falling back to
// the given hardcoded list until (or if) the API responds. Forms render
// instantly with the fallback and swap to configured values when loaded.
// `fallback` items may be plain strings or {value,label} objects.
export function useMasterOptions(category, fallback = []) {
  const [options, setOptions] = useState(() => normalize(fallback))

  useEffect(() => {
    let cancelled = false
    listOptions(category)
      .then(opts => {
        if (!cancelled && opts.length > 0) setOptions(opts)
      })
      .catch(() => {}) // keep the fallback on any failure
    return () => { cancelled = true }
  }, [category])

  return options
}

function normalize(items) {
  return items.map(i =>
    typeof i === 'string'
      ? { value: i, label: i.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') }
      : i
  )
}
