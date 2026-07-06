import { cn } from '../utils/cn'

export default function FormInput({
  label, id, error, hint, wrapperClass,
  prefix, suffix, size = 'md', ...props
}) {
  const inputSize = { sm: 'h-8 text-xs px-3', md: 'h-10 text-sm px-3.5', lg: 'h-11 text-base px-4' }[size]
  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClass)}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-slate-600 leading-none">
          {label}
          {props.required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
      )}
      <div className={cn(
        'flex items-center w-full rounded-xl border bg-white transition-all duration-150',
        'focus-within:ring-2 focus-within:ring-offset-0',
        error
          ? 'border-rose-300 focus-within:ring-rose-400/20 focus-within:border-rose-400'
          : 'border-slate-200 focus-within:ring-indigo-500/20 focus-within:border-indigo-400',
        props.disabled && 'bg-slate-50 opacity-60'
      )}>
        {prefix && (
          <span className="pl-3.5 text-slate-400 shrink-0 text-sm">{prefix}</span>
        )}
        <input
          id={id}
          className={cn(
            'w-full bg-transparent text-slate-800 placeholder:text-slate-400',
            'outline-none border-none',
            inputSize,
            prefix && 'pl-2',
            suffix && 'pr-2',
          )}
          {...props}
        />
        {suffix && (
          <span className="pr-3.5 text-slate-400 shrink-0 text-sm">{suffix}</span>
        )}
      </div>
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-rose-500 flex items-center gap-1">{error}</p>}
    </div>
  )
}

export function Textarea({ label, id, error, hint, wrapperClass, className, ...props }) {
  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClass)}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-slate-600 leading-none">
          {label}
          {props.required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5',
          'text-sm text-slate-800 placeholder:text-slate-400',
          'outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400',
          'transition-colors duration-150 resize-none',
          error && 'border-rose-300',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
}
