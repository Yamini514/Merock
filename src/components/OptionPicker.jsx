'use client'

import { Check } from 'lucide-react'
import { cn } from '../utils/cn'

// Canonical "choose one of N" card — gradient icon badge, optional
// description, checkmark on active. The single picker style used for every
// choice field across the app (roles, account types, follow-up targets,
// etc.) instead of each form inventing its own.
function OptionCard({ opt, active, onClick }) {
  const Icon = opt.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
        active
          ? 'border-indigo-400 bg-indigo-50/60 shadow-sm'
          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 hover:-translate-y-0.5'
      )}
    >
      {Icon && (
        <span className={cn(
          'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 shadow-sm',
          opt.gradient || 'from-indigo-500 to-violet-600'
        )}>
          <Icon size={15} className="text-white" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-slate-800 truncate">{opt.label}</span>
        {opt.description && (
          <span className="block text-[11px] text-slate-500 mt-0.5 leading-snug">{opt.description}</span>
        )}
      </span>
      {active && <Check size={14} className="ml-auto text-indigo-600 shrink-0" />}
    </button>
  )
}

const COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
}

export default function OptionPicker({ label, required, error, options, groups, value, onChange, columns = 3 }) {
  const colClass = COLS[columns] || COLS[3]

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <label className="text-xs font-medium text-slate-600 leading-none">
          {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
      )}
      {groups ? (
        groups.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {group.label}
              {group.hint && <span className="normal-case font-normal text-slate-400"> · {group.hint}</span>}
            </p>
            <div className={cn('grid gap-2.5', colClass)}>
              {group.options.map(opt => (
                <OptionCard key={opt.value} opt={opt} active={value === opt.value} onClick={() => onChange(opt.value)} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className={cn('grid gap-2.5', colClass)}>
          {options.map(opt => (
            <OptionCard key={opt.value} opt={opt} active={value === opt.value} onClick={() => onChange(opt.value)} />
          ))}
        </div>
      )}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
}
