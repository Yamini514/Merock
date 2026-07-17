'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, MapPin, IndianRupee, Clock, AlertCircle, Search } from 'lucide-react'
import { getMyEnquiries } from '../../../api/customers'
import { useApi } from '../../../hooks/useApi'
import Badge from '../../../components/Badge'
import { formatCurrency, formatRelativeTime, humanizeLabel } from '../../../utils/formatters'

export default function MyEnquiriesPage() {
  const router = useRouter()

  const fetcher = useCallback(() => getMyEnquiries(), [])
  const { data, loading, error } = useApi(fetcher, [])
  const enquiries = data ?? []

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Enquiries</h1>
          <p className="text-slate-500 text-sm mt-0.5">Requirements you've submitted or our team has logged for you</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 mb-5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
            <AlertCircle size={16} /> {error.message}
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <div className="py-16 flex justify-center">
              <span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : enquiries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">No enquiries yet</h3>
              <p className="text-slate-400 text-sm mb-5">Tell us what you're looking for and our team will get in touch.</p>
              <button
                onClick={() => router.push('/properties')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
              >
                <Search className="w-4 h-4" /> Browse Properties
              </button>
            </div>
          ) : (
            enquiries.map(req => (
              <div key={req.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {humanizeLabel(req.transaction_type)}
                        {req.property_types?.length > 0 && ` · ${req.property_types.join(', ')}`}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatRelativeTime(req.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge status={req.status} />
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3.5 pt-3.5 border-t border-slate-100 text-xs text-slate-500">
                  {req.locations?.length > 0 && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {req.locations.join(', ')}</span>
                  )}
                  {(req.budget_min || req.budget_max) && (
                    <span className="flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                      {req.budget_min ? formatCurrency(req.budget_min) : 'Any'} – {req.budget_max ? formatCurrency(req.budget_max) : 'Any'}
                    </span>
                  )}
                  {req.urgency && <Badge status={req.urgency} className="!py-0" />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
