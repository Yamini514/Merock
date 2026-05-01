import { cn } from '../utils/cn'

const base = [
  'inline-flex items-center justify-center gap-2 font-medium rounded-xl',
  'transition-all duration-150 cursor-pointer select-none',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
].join(' ')

const variants = {
  primary:     'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus-visible:ring-indigo-500 shadow-sm shadow-indigo-600/20',
  secondary:   'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 focus-visible:ring-indigo-500',
  ghost:       'text-slate-600 hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200 focus-visible:ring-slate-400',
  destructive: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-rose-500 shadow-sm shadow-rose-600/20',
  success:     'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-emerald-500 shadow-sm',
  outline:     'border border-indigo-200 text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 focus-visible:ring-indigo-400',
}

const sizes = {
  xs: 'text-xs px-2.5 py-1.5 h-7',
  sm: 'text-xs px-3.5 py-2 h-8',
  md: 'text-sm px-4 py-2.5 h-9',
  lg: 'text-sm px-5 py-3 h-10',
  xl: 'text-base px-6 py-3.5 h-12',
  icon: 'p-2 h-9 w-9',
  'icon-sm': 'p-1.5 h-8 w-8',
}

export default function Button({
  variant = 'primary', size = 'md', loading = false,
  className, children, ...props
}) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-0.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
