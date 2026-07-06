export function deriveOptions(items = [], key) {
  return [...new Set(items.map(item => item?.[key]).filter(Boolean))].sort()
}

// Distinct bedroom counts actually present, collapsed into '5+', with a
// leading 'Any' — shared by every property-search filter in the app so a
// bedroom count with zero listings never shows up as a dead option.
export function deriveBedroomOptions(items = []) {
  const counts = [...new Set(items.map(p => p.bedrooms).filter(n => n > 0))].sort((a, b) => a - b)
  const options = counts.filter(n => n < 5).map(String)
  if (counts.some(n => n >= 5)) options.push('5+')
  return ['Any', ...options]
}

// Fixed bucket boundaries are a deliberate design choice (see callers), but
// which buckets are worth showing is data-driven — hide any with zero
// matches while always keeping `anyLabel` visible.
export function deriveAvailableRanges(ranges, items = [], anyLabel = 'Any') {
  return ranges.filter(r =>
    r.label === anyLabel || items.some(p => (p.price || 0) >= r.min && (p.price || 0) <= r.max)
  )
}
