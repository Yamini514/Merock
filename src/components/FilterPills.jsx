import { cn } from '../utils/cn'

export const PILL_INDIGO = 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
export const PILL_SLATE = 'bg-slate-800 text-white'

export default function FilterPills({ options = [], value, onChange, activeClassName = PILL_INDIGO, getLabel }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {options.map((opt) => {
        const optValue = opt?.value ?? opt
        const optLabel = getLabel ? getLabel(opt) : (opt?.label ?? opt)
        const active = optValue === value
        return (
          <button
            key={optValue}
            onClick={() => onChange(optValue)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150',
              active ? activeClassName : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            {optLabel}
          </button>
        )
      })}
    </div>
  )
}
