import { cn } from '../utils/cn'

const VARIANTS = {
  /* Status */
  active:      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80',
  sold:        'bg-rose-50 text-rose-700 ring-1 ring-rose-200/80',
  draft:       'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80',
  inactive:    'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
  pending:     'bg-blue-50 text-blue-700 ring-1 ring-blue-200/80',
  /* Pipeline */
  enquired:    'bg-blue-50 text-blue-700 ring-1 ring-blue-200/80',
  visited:     'bg-violet-50 text-violet-700 ring-1 ring-violet-200/80',
  negotiating: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80',
  converted:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80',
  /* Priority */
  high:        'bg-rose-50 text-rose-700 ring-1 ring-rose-200/80',
  medium:      'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80',
  low:         'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
  /* Tier */
  Gold:        'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
  Silver:      'bg-slate-100 text-slate-600 ring-1 ring-slate-300',
  Bronze:      'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  /* Type */
  Buyer:    'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/80',
  Seller:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80',
  Investor: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/80',
  Tenant:   'bg-sky-50 text-sky-700 ring-1 ring-sky-200/80',
  /* Generic */
  default:  'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  indigo:   'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/80',
}

export default function Badge({ status, variant, children, dot = false, className }) {
  const key = status || variant || 'default'
  const label = children ?? (status ? status.charAt(0).toUpperCase() + status.slice(1) : '')
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
      VARIANTS[key] ?? VARIANTS.default,
      className
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {label}
    </span>
  )
}
