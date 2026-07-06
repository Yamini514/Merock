import { cn } from '../utils/cn'
import { humanizeLabel } from '../utils/formatters'

const VARIANTS = {
  /* Property status (backend enum) */
  active:           'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80',
  available:        'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80',
  sold:             'bg-rose-50 text-rose-700 ring-1 ring-rose-200/80',
  draft:            'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80',
  under_discussion: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/80',
  blocked:          'bg-orange-50 text-orange-700 ring-1 ring-orange-200/80',
  inactive:         'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
  pending:          'bg-blue-50 text-blue-700 ring-1 ring-blue-200/80',
  /* Customer pipeline (backend enum) */
  new:           'bg-sky-50 text-sky-700 ring-1 ring-sky-200/80',
  contacted:     'bg-blue-50 text-blue-700 ring-1 ring-blue-200/80',
  qualified:     'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/80',
  shortlisted:   'bg-violet-50 text-violet-700 ring-1 ring-violet-200/80',
  visit_planned: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200/80',
  negotiation:   'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80',
  closed:        'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80',
  lost:          'bg-rose-50 text-rose-700 ring-1 ring-rose-200/80',
  on_hold:       'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
  /* Enquiry pipeline */
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
  Elite:       'bg-violet-50 text-violet-700 ring-1 ring-violet-200/80',
  Standard:    'bg-sky-50 text-sky-700 ring-1 ring-sky-200/80',
  /* Match status (backend enum, Title Case) */
  New:             'bg-sky-50 text-sky-700 ring-1 ring-sky-200/80',
  Contacted:       'bg-blue-50 text-blue-700 ring-1 ring-blue-200/80',
  Shortlisted:     'bg-violet-50 text-violet-700 ring-1 ring-violet-200/80',
  Rejected:        'bg-rose-50 text-rose-700 ring-1 ring-rose-200/80',
  'Visit Planned': 'bg-purple-50 text-purple-700 ring-1 ring-purple-200/80',
  Negotiation:     'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80',
  Closed:          'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80',
  /* Match score band */
  High:              'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80',
  Medium:            'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80',
  Low:               'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
  'Not Recommended': 'bg-rose-50 text-rose-600 ring-1 ring-rose-200/80',
  /* Notification delivery status */
  sent:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80',
  failed: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/80',
  /* Activity log actions */
  create:                   'bg-sky-50 text-sky-700 ring-1 ring-sky-200/80',
  update:                   'bg-blue-50 text-blue-700 ring-1 ring-blue-200/80',
  deactivate:               'bg-rose-50 text-rose-700 ring-1 ring-rose-200/80',
  login:                    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80',
  login_failed:             'bg-rose-50 text-rose-700 ring-1 ring-rose-200/80',
  role_changed:             'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80',
  settings_changed:         'bg-violet-50 text-violet-700 ring-1 ring-violet-200/80',
  password_reset_requested: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80',
  password_reset_completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80',
  import: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/80',
  export: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/80',
  /* Type */
  Buyer:    'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/80',
  Seller:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80',
  Investor: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/80',
  Tenant:   'bg-sky-50 text-sky-700 ring-1 ring-sky-200/80',
  /* Staff role */
  super_admin: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/80',
  admin:       'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/80',
  agent:       'bg-sky-50 text-sky-700 ring-1 ring-sky-200/80',
  property_manager:     'bg-teal-50 text-teal-700 ring-1 ring-teal-200/80',
  referral_coordinator: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200/80',
  viewer:      'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  client:      'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  member:      'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80',
  /* Generic */
  default:  'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  indigo:   'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/80',
}

export default function Badge({ status, variant, children, dot = false, className }) {
  const key = status || variant || 'default'
  const label = children ?? (status ? humanizeLabel(status) : '')
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
