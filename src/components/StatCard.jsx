import { TrendingUp, TrendingDown } from 'lucide-react'
import * as Icons from 'lucide-react'
import { cn } from '../utils/cn'

const PALETTES = {
  indigo:  { icon: 'bg-indigo-50 text-indigo-600',  glow: 'shadow-indigo-100',  bar: 'bg-indigo-500' },
  violet:  { icon: 'bg-violet-50 text-violet-600',  glow: 'shadow-violet-100',  bar: 'bg-violet-500' },
  sky:     { icon: 'bg-sky-50 text-sky-600',         glow: 'shadow-sky-100',     bar: 'bg-sky-500' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600', glow: 'shadow-emerald-100', bar: 'bg-emerald-500' },
  amber:   { icon: 'bg-amber-50 text-amber-600',     glow: 'shadow-amber-100',   bar: 'bg-amber-500' },
  rose:    { icon: 'bg-rose-50 text-rose-600',       glow: 'shadow-rose-100',    bar: 'bg-rose-500' },
}

export default function StatCard({ label, value, pct, changeType, icon, color = 'indigo' }) {
  const Icon    = Icons[icon] ?? Icons.BarChart2
  const palette = PALETTES[color] ?? PALETTES.indigo
  const isUp    = changeType === 'up'

  return (
    <div className={cn('bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col gap-4', `shadow-sm ${palette.glow}`)}>
      <div className="flex items-center justify-between">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', palette.icon)}>
          <Icon size={18} />
        </div>
        {pct && (
          <div className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
            isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          )}>
            {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {pct}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{value}</p>
        <p className="text-xs font-medium text-slate-500 mt-1.5">{label}</p>
      </div>
      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full w-2/3', palette.bar)} />
      </div>
    </div>
  )
}
