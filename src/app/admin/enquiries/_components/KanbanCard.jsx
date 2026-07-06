'use client'

import { User, Calendar } from 'lucide-react'
import Badge from '../../../../components/Badge'
import Avatar from '../../../../components/Avatar'
import { formatDate } from '../../../../utils/formatters'
import { cn } from '../../../../utils/cn'

export default function KanbanCard({ item, col, dragging, onDragStart, onDragEnd, onClick }) {
  const isDraggingThis = dragging?.id === item.id
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, item)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border shadow-sm p-3.5 cursor-grab active:cursor-grabbing',
        'hover:shadow-md hover:-translate-y-0.5 transition-all duration-150',
        `border-${col.color}-100`,
        isDraggingThis && 'kanban-dragging'
      )}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Avatar name={item.customer_name || '?'} size="xs" />
          <span className="text-xs font-bold text-slate-800">{item.customer_name || 'Unknown'}</span>
        </div>
        <Badge status={item.priority} />
      </div>

      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{item.property_title}</p>

      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2.5 border-t border-slate-100">
        {item.score != null ? (
          <span className="flex items-center gap-1"><User size={9} />{item.score}% {item.score_band}</span>
        ) : (
          <span className="flex items-center gap-1"><User size={9} />Manual</span>
        )}
        <span className="flex items-center gap-1"><Calendar size={9} />{formatDate(item.created_at)}</span>
      </div>
    </div>
  )
}
