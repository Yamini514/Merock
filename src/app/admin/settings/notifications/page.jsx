'use client'

import { useState, useCallback } from 'react'
import { BellRing, RotateCcw } from 'lucide-react'
import PageHeader from '../../../../components/PageHeader'
import FilterPills from '../../../../components/FilterPills'
import Pagination from '../../../../components/Pagination'
import Badge from '../../../../components/Badge'
import Button from '../../../../components/Button'
import Spinner from '../../../../components/Spinner'
import EmptyState from '../../../../components/EmptyState'
import ErrorBanner from '../../../../components/ErrorBanner'
import { listOutbox, retryDelivery } from '../../../../api/templates'
import { useApi } from '../../../../hooks/useApi'
import { formatRelativeTime, humanizeLabel } from '../../../../utils/formatters'

const PAGE_SIZE = 20
const STATUS_PILLS = ['All', 'pending', 'sent', 'failed']
const CHANNEL_PILLS = ['All', 'in_app', 'email', 'sms', 'whatsapp']

export default function NotificationCenterPage() {
  const [status, setStatus] = useState('All')
  const [channel, setChannel] = useState('All')
  const [page, setPage] = useState(1)
  const [busyId, setBusyId] = useState(null)
  const [actionErr, setActionErr] = useState('')

  const fetcher = useCallback(() => listOutbox({
    delivery_status: status === 'All' ? undefined : status,
    channel: channel === 'All' ? undefined : channel,
    page,
    page_size: PAGE_SIZE,
  }), [status, channel, page])
  const { data, loading, error, refetch } = useApi(fetcher, [status, channel, page])

  const rows = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.total_pages ?? 1

  const resetPage = (setter) => (value) => { setter(value); setPage(1) }

  const handleRetry = async (row) => {
    setBusyId(row.id)
    setActionErr('')
    try { await retryDelivery(row.id); refetch() }
    catch (err) { setActionErr(err.message) }
    finally { setBusyId(null) }
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Notification Center"
        subtitle="Delivery history and retry queue across every channel"
        breadcrumb={['Settings', 'Notifications']}
      />

      <div className="flex flex-wrap items-center gap-3">
        <FilterPills
          options={STATUS_PILLS.map(s => ({ value: s, label: s === 'All' ? 'All Statuses' : humanizeLabel(s) }))}
          value={status} onChange={resetPage(setStatus)}
        />
        <div className="w-px h-5 bg-slate-200 hidden sm:block" />
        <FilterPills
          options={CHANNEL_PILLS.map(c => ({ value: c, label: c === 'All' ? 'All Channels' : humanizeLabel(c) }))}
          value={channel} onChange={resetPage(setChannel)}
        />
      </div>

      <ErrorBanner message={error?.message || actionErr} />

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No notifications"
          description="Nothing has been sent (or queued) matching these filters yet."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">When</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 py-3">Channel</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 py-3">Recipient</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 py-3">Message</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 py-3">Attempts</th>
                  <th className="text-right text-xs font-semibold text-slate-400 px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-500">{formatRelativeTime(row.created_at)}</td>
                    <td className="px-3 py-3 whitespace-nowrap"><Badge variant="indigo">{humanizeLabel(row.channel)}</Badge></td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-slate-600">User #{row.recipient}</td>
                    <td className="px-3 py-3 max-w-[320px]">
                      <p className="text-xs font-medium text-slate-700 truncate">{row.title}</p>
                      {row.last_error && <p className="text-[11px] text-rose-500 truncate" title={row.last_error}>{row.last_error}</p>}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap"><Badge status={row.delivery_status} dot /></td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-slate-500">{row.attempts ?? 0}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-right">
                      {row.delivery_status !== 'sent' && (
                        <Button size="sm" variant="secondary" loading={busyId === row.id} onClick={() => handleRetry(row)}>
                          <RotateCcw size={12} /> Retry
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={total} pageSize={PAGE_SIZE} />
        </div>
      )}
    </div>
  )
}
