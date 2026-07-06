'use client'

import { X } from 'lucide-react'

export default function FilterSidebar({ title = 'Filters', open, onClose, hasFilters, onClear, children, resultsLabel }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-24">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-bold text-slate-800">{title}</p>
            {hasFilters && (
              <button onClick={onClear} className="text-xs text-indigo-600 hover:underline font-medium">Clear all</button>
            )}
          </div>
          {children}
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-2xl overflow-y-auto animate-slide-in-left">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <p className="font-bold text-slate-900">{title}</p>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {children}
            </div>
            {resultsLabel && (
              <div className="p-5 border-t border-slate-100 sticky bottom-0 bg-white">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
                >
                  {resultsLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
