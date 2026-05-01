import { getInitials } from '../utils/formatters'
import { cn } from '../utils/cn'

const PALETTE = [
  'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
]

function colorFor(name) {
  const sum = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return PALETTE[sum % PALETTE.length]
}

const SIZES = {
  xs: 'w-6 h-6 text-[9px] ring-1',
  sm: 'w-8 h-8 text-xs ring-1',
  md: 'w-10 h-10 text-sm ring-2',
  lg: 'w-12 h-12 text-base ring-2',
  xl: 'w-16 h-16 text-lg ring-2',
}

export default function Avatar({ name, src, size = 'md', online, className }) {
  const sizeClass = SIZES[size] ?? SIZES.md
  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img src={src} alt={name} className={cn('rounded-full object-cover ring-white', sizeClass)} />
      ) : (
        <span className={cn(
          'inline-flex items-center justify-center rounded-full font-semibold ring-white select-none',
          sizeClass, colorFor(name)
        )}>
          {getInitials(name || '?')}
        </span>
      )}
      {online !== undefined && (
        <span className={cn(
          'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white',
          online ? 'bg-emerald-400' : 'bg-slate-300'
        )} />
      )}
    </div>
  )
}

export function AvatarGroup({ names = [], max = 3, size = 'sm' }) {
  const shown = names.slice(0, max)
  const rest  = names.length - max
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((name, i) => (
        <Avatar key={i} name={name} size={size} className="ring-2 ring-white" />
      ))}
      {rest > 0 && (
        <div className={cn(
          'inline-flex items-center justify-center rounded-full bg-slate-200 text-slate-600 font-semibold text-xs ring-2 ring-white',
          SIZES[size]
        )}>+{rest}</div>
      )}
    </div>
  )
}
