import { cn } from '../utils/cn'
import { ChevronDown } from 'lucide-react'

export default function Select({ label, id, options = [], error, wrapperClass, className, size = 'md', ...props }) {
  const inputSize = { sm: 'h-8 text-xs', md: 'h-10 text-sm', lg: 'h-11 text-base' }[size]
  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClass)}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-slate-600 leading-none">
          {label}
          {props.required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={cn(
            'w-full appearance-none rounded-xl border border-slate-200 bg-white',
            'pl-3.5 pr-9 text-slate-800',
            'outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400',
            'transition-colors duration-150',
            inputSize,
            error && 'border-rose-300',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
}
