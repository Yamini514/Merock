import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../utils/cn'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
}

export default function Modal({ open, onClose, title, subtitle, children, size = 'md', footer, noPadding = false }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const handler = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed  pt-10 inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 py-8 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — always centered with visible breathing room from every
          edge (including the sticky top nav), never edge-to-edge. */}
      <div
        ref={ref}
        className={cn(
          'relative w-full bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 border border-slate-200/60',
          'flex flex-col max-h-[85vh] my-auto animate-slide-up shrink-0',
          SIZES[size]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900 leading-none">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-1.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className={cn('overflow-y-auto flex-1', !noPadding && 'px-6 py-5')}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 bg-slate-50/50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
