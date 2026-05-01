import { cn } from '../utils/cn'

export default function Card({ children, className, hover = false, padding = true, as: Tag = 'div' }) {
  return (
    <Tag className={cn(
      'bg-white rounded-2xl border border-slate-200/80 shadow-sm',
      hover && 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
      padding && 'p-5',
      className
    )}>
      {children}
    </Tag>
  )
}

export function CardHeader({ title, subtitle, action, className, tight = false }) {
  return (
    <div className={cn('flex items-start justify-between', tight ? 'mb-3' : 'mb-5', className)}>
      <div>
        <h3 className="text-sm font-semibold text-slate-800 leading-none">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-3 shrink-0">{action}</div>}
    </div>
  )
}

export function CardSection({ children, className }) {
  return (
    <div className={cn('border-t border-slate-100 pt-4 mt-4', className)}>
      {children}
    </div>
  )
}
