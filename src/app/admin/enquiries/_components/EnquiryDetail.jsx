'use client'

import { useState } from 'react'
import FormInput from '../../../../components/FormInput'
import Button from '../../../../components/Button'
import { formatDate } from '../../../../utils/formatters'
import { cn } from '../../../../utils/cn'
import { COLUMNS } from './columns'

export default function EnquiryDetail({ enquiry, onStatusChange, writable = true }) {
  const currentIdx = COLUMNS.findIndex(c => c.id === enquiry.status)
  const [notes, setNotes] = useState(enquiry.notes || '')
  const [pendingStatus, setPendingStatus] = useState(null)
  const needsNote = pendingStatus === 'Closed' || pendingStatus === 'Rejected'

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Pipeline Progress</p>
        <div className="flex items-center gap-0 overflow-x-auto pb-1">
          {COLUMNS.filter(c => c.id !== 'Rejected').map((s, i) => {
            const done   = i <= currentIdx
            const active = i === currentIdx
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none min-w-[64px]">
                <button
                  onClick={() => writable && setPendingStatus(s.id)}
                  disabled={!writable}
                  className="flex flex-col items-center gap-1.5 shrink-0 group disabled:cursor-default"
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 transition-all cursor-pointer',
                    done ? cn(s.count_bg) : 'bg-white text-slate-300 ring-slate-200',
                    !active && 'hover:ring-slate-300'
                  )}>
                    {i + 1}
                  </div>
                  <span className="text-[9px] font-semibold uppercase tracking-wide whitespace-nowrap text-slate-500">{s.label}</span>
                </button>
                {i < COLUMNS.length - 2 && (
                  <div className={cn('flex-1 h-0.5 mx-2 mb-4 rounded-full', i < currentIdx ? 'bg-indigo-400' : 'bg-slate-200')} />
                )}
              </div>
            )
          })}
        </div>
        {writable && <p className="text-[10px] text-slate-400 mt-3 text-center">Click a step to move this enquiry there</p>}
      </div>

      {pendingStatus && (
        <div className="flex flex-col gap-2.5 bg-indigo-50 border border-indigo-200 rounded-xl p-3.5">
          <p className="text-xs font-semibold text-indigo-800">Move to "{pendingStatus}"{needsNote && ' — a note is required to close/reject'}</p>
          {needsNote && (
            <FormInput value={notes} onChange={e => setNotes(e.target.value)} placeholder="Outcome note (required)…" />
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPendingStatus(null)}>Cancel</Button>
            <Button size="sm" disabled={needsNote && !notes.trim()} onClick={() => { onStatusChange(pendingStatus, notes); setPendingStatus(null) }}>Confirm</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {[
          ['Client', enquiry.customer_name || '—'],
          ['Score', enquiry.score != null ? `${enquiry.score}% (${enquiry.score_band})` : 'Manually logged'],
          ['Logged', formatDate(enquiry.created_at)],
          ['Follow Up', enquiry.next_followup_at ? formatDate(enquiry.next_followup_at) : '—'],
        ].map(([k, v]) => (
          <div key={k} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">{k}</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">{v}</p>
          </div>
        ))}
      </div>

      {enquiry.explanation && (
        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
          <p className="text-xs font-semibold text-indigo-700 mb-1.5">Match Explanation</p>
          <p className="text-sm text-slate-700 leading-relaxed">{enquiry.explanation}</p>
        </div>
      )}

      {enquiry.notes && (
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <p className="text-xs font-semibold text-amber-700 mb-1.5">Notes</p>
          <p className="text-sm text-slate-700 leading-relaxed">{enquiry.notes}</p>
        </div>
      )}
    </div>
  )
}
