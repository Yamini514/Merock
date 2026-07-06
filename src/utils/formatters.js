export function formatCurrency(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(1).replace(/\.0$/, '')} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatRelativeTime(dateStr) {
  const now  = new Date()
  const date = new Date(dateStr)
  const diff = now - date
  const min  = Math.floor(diff / 60000)
  if (min < 1)   return 'Just now'
  if (min < 60)  return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24)   return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7)   return `${day}d ago`
  return formatDate(dateStr)
}

// Strips everything but digits and caps at 10 — used on phone inputs that
// should only ever hold a bare Indian mobile number.
export function sanitizePhone(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 10)
}

export function getInitials(name) {
  return (name || '?')
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function formatNumber(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000)    return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

// 'super_admin' -> 'Super Admin'
export function humanizeLabel(s) {
  return String(s).split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
