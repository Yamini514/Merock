'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Phone } from 'lucide-react'
import { listCustomers } from '../../../../api/customers'
import { useApi } from '../../../../hooks/useApi'
import { formatDate } from '../../../../utils/formatters'

// Enquiries submitted with no specific property in mind (e.g. the Contact Us
// form) can never become a Match — Match.property_id is required — so they'd
// otherwise be invisible from this page. Surface them here as plain leads.
export default function GeneralEnquiries() {
  const router = useRouter()
  const fetcher = useCallback(() => listCustomers({ lead_type: 'enquiry', page_size: 50 }), [])
  const { data } = useApi(fetcher, [])
  const leads = (data?.data ?? []).filter(c => (c.enquiries ?? 0) === 0)

  if (leads.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={14} className="text-blue-600" />
        <p className="text-sm font-bold text-slate-800">General Enquiries</p>
        <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{leads.length}</span>
        <p className="text-xs text-slate-400 ml-auto hidden sm:block">Not tied to a specific property — no match to track</p>
      </div>
      <div className="flex flex-col divide-y divide-slate-50">
        {leads.map(c => (
          <div
            key={c.id}
            onClick={() => router.push(`/admin/clients/${c.id}`)}
            className="flex items-center justify-between gap-3 py-2.5 px-2 -mx-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
              <p className="text-xs text-slate-400 truncate max-w-md">{c.notes || 'No message'}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Phone size={10} />{c.phone}</span>
              <span>{formatDate(c.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
