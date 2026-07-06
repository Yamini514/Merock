import { cn } from '../utils/cn'
import { ChevronRight } from 'lucide-react'

export default function PageHeader({ title, subtitle, actions, breadcrumb, className }) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6', className)}>
      <div className="min-w-0">
        {breadcrumb && (
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-1.5">
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={10} />}
                <span className={i === breadcrumb.length - 1 ? 'text-slate-600 font-medium' : 'hover:text-slate-600 cursor-pointer'}>
                  {item}
                </span>
              </span>
            ))}
          </div>
        )}
        <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none truncate">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1.5">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:shrink-0 sm:justify-end">{actions}</div>
      )}
    </div>
  )
}
