'use client'

import { useState, useCallback } from 'react'
import { Bell, Building2, X, MessageSquare, Share2, Clock, AlertCircle, CheckCheck } from 'lucide-react'
import { listAlerts, markAlertRead, markAllAlertsRead, dismissAlert } from '../../../api/alerts'
import { useApi } from '../../../hooks/useApi'
import { formatRelativeTime } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'

const FILTERS = ['All', 'Unread', 'Read']

const TYPE_META = {
  Customer: { icon: MessageSquare, bg: 'bg-blue-100 text-blue-600',      label: 'Enquiry' },
  Property: { icon: Building2,     bg: 'bg-indigo-100 text-indigo-600',  label: 'Property' },
  Referral: { icon: Share2,        bg: 'bg-emerald-100 text-emerald-600', label: 'Referral' },
  Match:    { icon: Clock,         bg: 'bg-amber-100 text-amber-600',    label: 'Update' },
}
const DEFAULT_META = { icon: Bell, bg: 'bg-slate-100 text-slate-500', label: 'Notification' }

export default function AlertsPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [err, setErr] = useState('')

  const fetcher = useCallback(() => listAlerts(), [])
  const { data, loading, error, refetch } = useApi(fetcher, [])
  const alerts = data ?? []
  const unread = alerts.filter(a => !a.read).length

  const filtered = alerts.filter(a => {
    if (activeFilter === 'Unread') return !a.read
    if (activeFilter === 'Read') return a.read
    return true
  })

  async function markAllRead() {
    setErr('')
    try { await markAllAlertsRead(); refetch() } catch (e) { setErr(e.message) }
  }

  async function markRead(alert) {
    if (alert.read) return
    setErr('')
    try { await markAlertRead(alert.id); refetch() } catch (e) { setErr(e.message) }
  }

  async function dismiss(id) {
    setErr('')
    try { await dismissAlert(id); refetch() } catch (e) { setErr(e.message) }
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>

        {(error || err) && (
          <div className="flex items-center gap-2 px-4 py-3 mb-5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
            <AlertCircle size={16} /> {error?.message || err}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border',
                activeFilter === f
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
              )}
            >
              {f}
              {f === 'Unread' && unread > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                  {unread}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Alert list */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-16 flex justify-center">
              <span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-amber-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">No {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} alerts</h3>
              <p className="text-slate-400 text-sm">We'll notify you when something relevant comes up.</p>
            </div>
          ) : (
            filtered.map(alert => {
              const meta = TYPE_META[alert.linked_type] || DEFAULT_META
              const Icon = meta.icon
              return (
                <div
                  key={alert.id}
                  onClick={() => markRead(alert)}
                  className={cn(
                    'group bg-white rounded-2xl border shadow-sm p-4 flex items-start gap-4 cursor-pointer transition-all hover:shadow-md',
                    !alert.read ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-100'
                  )}
                >
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', meta.bg)}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{alert.title}</p>
                        <span className={cn('inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5', meta.bg)}>
                          {meta.label}
                        </span>
                      </div>
                      {!alert.read && <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{alert.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1.5">{formatRelativeTime(alert.created_at)}</p>
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); dismiss(alert.id) }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
