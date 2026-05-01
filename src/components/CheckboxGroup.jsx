import { cn } from '../utils/cn'
import { Check } from 'lucide-react'

export default function CheckboxGroup({ label, options = [], value = [], onChange, columns = 2 }) {
  function toggle(opt) {
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt])
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
      <div className={cn('grid gap-2', columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
        {options.map((opt) => {
          const checked = value.includes(opt)
          return (
            <label
              key={opt}
              className={cn(
                'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 cursor-pointer text-sm transition-all duration-150 select-none',
                checked
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <span className={cn(
                'w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                checked ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'
              )}>
                {checked && <Check size={10} className="text-white" strokeWidth={3} />}
              </span>
              <input type="checkbox" checked={checked} onChange={() => toggle(opt)} className="sr-only" />
              <span className="truncate">{opt}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
