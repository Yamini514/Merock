'use client'

import { useState, useCallback } from 'react'
import { History, Search } from 'lucide-react'
import PageHeader from '../../../components/PageHeader'
import FilterPills from '../../../components/FilterPills'
import Pagination from '../../../components/Pagination'
import Modal from '../../../components/Modal'
import Badge from '../../../components/Badge'
import FormInput from '../../../components/FormInput'
import Select from '../../../components/Select'
import Spinner from '../../../components/Spinner'
import EmptyState from '../../../components/EmptyState'
import ErrorBanner from '../../../components/ErrorBanner'
import { listActivityLogs } from '../../../api/activityLogs'
import { useApi } from '../../../hooks/useApi'
import { formatRelativeTime, humanizeLabel } from '../../../utils/formatters'

const PAGE_SIZE = 25

const ACTION_PILLS = [
  'All', 'login', 'login_failed', 'create', 'update', 'deactivate',
  'role_changed', 'settings_changed', 'password_reset_requested', 'import', 'export',
]

const ENTITY_TYPES = [
  'All', 'User', 'Customer', 'Property', 'Requirement', 'Member',
  'Referral', 'Match', 'FollowUp', 'AppSetting', 'MasterDataItem', 'NotificationTemplate',
]

const parseChanges = (str) => { try { return JSON.parse(str) } catch { return null } }

export default function ActivityLogPage() {
  const [action, setAction] = useState('All')
  const [entityType, setEntityType] = useState('All')
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const fetcher = useCallback(() => listActivityLogs({
    action: action === 'All' ? undefined : action,
    entity_type: entityType === 'All' ? undefined : entityType,
    search: search || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    page_size: PAGE_SIZE,
  }), [action, entityType, search, from, to, page])
  const { data, loading, error } = useApi(fetcher, [action, entityType, search, from, to, page])

  const logs = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.total_pages ?? 1

  const resetPage = (setter) => (value) => { setter(value); setPage(1) }

  const selectedChanges = selected ? parseChanges(selected.changes) : null

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Activity Log"
        subtitle="Audit trail of logins, changes and administrative actions"
        breadcrumb={['Administration', 'Activity Log']}
      />

      <FilterPills
        options={ACTION_PILLS.map(a => ({ value: a, label: a === 'All' ? 'All Actions' : humanizeLabel(a) }))}
        value={action}
        onChange={resetPage(setAction)}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FormInput
          id="log-search" placeholder="Search user, entity, details…" size="sm"
          prefix={<Search size={13} />}
          value={search} onChange={e => resetPage(setSearch)(e.target.value)}
          wrapperClass="col-span-2"
        />
        <Select
          id="log-entity" size="sm"
          options={ENTITY_TYPES.map(t => ({ value: t, label: t === 'All' ? 'All Entities' : t }))}
          value={entityType} onChange={e => resetPage(setEntityType)(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <FormInput id="log-from" type="date" size="sm" value={from}
            onChange={e => resetPage(setFrom)(e.target.value)} wrapperClass="flex-1" />
          <span className="text-xs text-slate-400">to</span>
          <FormInput id="log-to" type="date" size="sm" value={to}
            onChange={e => resetPage(setTo)(e.target.value)} wrapperClass="flex-1" />
        </div>
      </div>

      <ErrorBanner message={error?.message} />

      {loading ? (
        <Spinner />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activity found"
          description="No log entries match the current filters."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">When</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 py-3">Action</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 py-3">Entity</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 py-3">Details</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map(log => (
                  <tr
                    key={log.id}
                    onClick={() => setSelected(log)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-500">
                      {formatRelativeTime(log.created_at)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="text-xs font-medium text-slate-700">
                        {log.user_name || log.user_email || 'System'}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Badge status={log.action} />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-slate-600">
                      {log.entity_type ? `${log.entity_type} #${log.entity_id ?? '—'}` : '—'}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500 max-w-[280px] truncate">
                      {log.details || (log.changes ? 'Field changes recorded' : '—')}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs font-mono text-slate-400">
                      {log.ip || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page} totalPages={totalPages} onPageChange={setPage}
            total={total} pageSize={PAGE_SIZE}
          />
        </div>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? humanizeLabel(selected.action) : ''}
        subtitle={selected ? `${selected.user_name || selected.user_email || 'System'} · ${formatRelativeTime(selected.created_at)}` : ''}
        size="md"
      >
        {selected && (
          <div className="flex flex-col gap-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Entity</p>
                <p className="text-slate-700">{selected.entity_type ? `${selected.entity_type} #${selected.entity_id ?? '—'}` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">IP Address</p>
                <p className="font-mono text-xs text-slate-600">{selected.ip || '—'}</p>
              </div>
            </div>
            {selected.details && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Details</p>
                <p className="text-slate-700">{selected.details}</p>
              </div>
            )}
            {selectedChanges && (
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Field Changes</p>
                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                  {Object.entries(selectedChanges).map(([field, change]) => (
                    <div key={field} className="grid grid-cols-[8rem_1fr] gap-2 px-3.5 py-2 text-xs">
                      <span className="font-mono text-slate-500">{field}</span>
                      <span className="text-slate-700 break-all">
                        <span className="text-rose-500 line-through mr-2">{String(Array.isArray(change) ? change[0] ?? '—' : '—')}</span>
                        <span className="text-emerald-600">{String(Array.isArray(change) ? change[1] ?? '—' : change)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
