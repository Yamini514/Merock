'use client'

import { useCallback } from 'react'
import { History } from 'lucide-react'
import Card, { CardHeader } from './Card'
import Badge from './Badge'
import Spinner from './Spinner'
import { recordHistory } from '../api/activityLogs'
import { useApi } from '../hooks/useApi'
import { formatDate } from '../utils/formatters'

// Per-record audit history (SRS Auditability: "Users can see recent
// activity history on records"). Backed by GET /activity-logs/for/:type/:id;
// staff-readable, agent ownership enforced server-side.
export default function ActivityTimeline({ entityType, entityId }) {
  const fetcher = useCallback(
    () => recordHistory(entityType, entityId),
    [entityType, entityId],
  )
  const { data, loading, error } = useApi(fetcher, [entityType, entityId])
  const rows = data ?? []

  return (
    <Card>
      <CardHeader
        title="Activity History"
        subtitle="Who changed what, and when"
        action={<History size={16} className="text-slate-400" />}
      />
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-xs text-slate-400">{error.message}</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-slate-400">No recorded changes yet.</p>
      ) : (
        <ol className="flex flex-col">
          {rows.map(log => (
            <li key={log.id} className="flex gap-3 pb-4 last:pb-0 relative">
              <div className="flex flex-col items-center shrink-0">
                <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5" />
                <span className="flex-1 w-px bg-slate-200" />
              </div>
              <div className="min-w-0 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge status={log.action} />
                  <span className="text-xs text-slate-400">{formatDate(log.created_at)}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5">
                  {log.user_name || log.user_email || 'System'}
                  {log.details ? ` — ${log.details}` : ''}
                </p>
                {log.changes && <ChangeSummary changes={log.changes} />}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}

function ChangeSummary({ changes }) {
  let parsed
  try { parsed = typeof changes === 'string' ? JSON.parse(changes) : changes }
  catch { return null }
  const entries = Object.entries(parsed || {}).slice(0, 6)
  if (!entries.length) return null
  return (
    <ul className="mt-1.5 flex flex-col gap-0.5">
      {entries.map(([field, change]) => (
        <li key={field} className="text-[11px] text-slate-400 truncate">
          <span className="font-medium text-slate-500">{field}</span>
          {Array.isArray(change) ? `: ${String(change[0] ?? '—')} → ${String(change[1] ?? '—')}` : ''}
        </li>
      ))}
    </ul>
  )
}
