import { cn } from '../utils/cn'

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center gap-4', className)}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Icon size={24} className="text-slate-400" />
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        {description && <p className="text-sm text-slate-400 mt-1 max-w-xs">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
