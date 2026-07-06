'use client'

import { useState, useCallback, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import {
  Sparkles, RefreshCw, Search, ArrowDownWideNarrow, Users, Building2,
  Check, X, UserPlus, ChevronDown, ChevronRight,
} from 'lucide-react'
import PageHeader from '../../../components/PageHeader'
import Card from '../../../components/Card'
import StatCard from '../../../components/StatCard'
import FilterPills from '../../../components/FilterPills'
import Pagination from '../../../components/Pagination'
import Modal from '../../../components/Modal'
import Badge from '../../../components/Badge'
import Button from '../../../components/Button'
import FormInput, { Textarea } from '../../../components/FormInput'
import Select from '../../../components/Select'
import Spinner from '../../../components/Spinner'
import EmptyState from '../../../components/EmptyState'
import ErrorBanner from '../../../components/ErrorBanner'
import { listMatches, updateMatch, recalculateMatches, bulkUpdateMatches } from '../../../api/matches'
import { getMatchDashboard } from '../../../api/dashboard'
import { listAgents } from '../../../api/users'
import { useApi } from '../../../hooks/useApi'
import { useAuth } from '../../../context/AuthContext'
import { canWrite, canBulkUpdateMatches } from '../../../utils/permissions'
import { formatCurrency } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'

const PAGE_SIZE = 20
const BAND_PILLS = ['All', 'High', 'Medium', 'Low', 'Not Recommended']
const STATUS_OPTIONS = ['All', 'New', 'Contacted', 'Shortlisted', 'Rejected', 'Visit Planned', 'Negotiation', 'Closed']
const BAND_COLORS = { High: '#10b981', Medium: '#f59e0b', Low: '#94a3b8', 'Not Recommended': '#f43f5e' }

export default function MatchingDashboard() {
  const { user } = useAuth()
  const canBulk  = canBulkUpdateMatches(user)
  const writable = canWrite(user, 'matches')

  // ── Filters / view state ──
  const [view, setView] = useState('buyer') // buyer → property | property → buyer
  const [band, setBand] = useState('All')
  const [status, setStatus] = useState('All')
  const [search, setSearch] = useState('')
  const [sortByScore, setSortByScore] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState([])
  const [actionErr, setActionErr] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [rejecting, setRejecting] = useState(null) // match | {bulk: true}
  const [rejectNote, setRejectNote] = useState('')
  const [assigning, setAssigning] = useState(null) // match
  const [assignTo, setAssignTo] = useState('')

  // ── Data ──
  const analyticsFetcher = useCallback(() => getMatchDashboard(), [])
  const { data: analytics, refetch: refetchAnalytics } = useApi(analyticsFetcher, [])

  const listFetcher = useCallback(() => listMatches({
    score_band: band === 'All' ? undefined : band,
    status: status === 'All' ? undefined : status,
    search: search || undefined,
    sort: sortByScore ? 'score' : undefined,
    dir: sortByScore ? 'desc' : undefined,
    page,
    page_size: PAGE_SIZE,
  }), [band, status, search, sortByScore, page])
  const { data: listData, loading, error, refetch } = useApi(listFetcher, [band, status, search, sortByScore, page])

  const matches = listData?.data ?? []
  const total = listData?.total ?? 0
  const totalPages = listData?.total_pages ?? 1

  const agentsFetcher = useCallback(() => listAgents(), [])
  const { data: agents } = useApi(agentsFetcher, [])

  // Group rows for the two directional views.
  const groups = useMemo(() => {
    const key = view === 'buyer'
      ? m => `c-${m.customer_id ?? 'unknown'}`
      : m => `p-${m.property_id ?? 'unknown'}`
    const label = view === 'buyer'
      ? m => m.customer_name || 'Unknown client'
      : m => m.property_title || 'Unknown property'
    const map = new Map()
    matches.forEach(m => {
      const k = key(m)
      if (!map.has(k)) map.set(k, { key: k, label: label(m), items: [] })
      map.get(k).items.push(m)
    })
    map.forEach(g => g.items.sort((a, b) => (b.score ?? -1) - (a.score ?? -1)))
    return [...map.values()]
  }, [matches, view])

  const refreshAll = () => { refetch(); refetchAnalytics() }

  const resetPage = (setter) => (value) => { setter(value); setPage(1); setSelectedIds([]) }

  // ── Mutations (single fn, mirrors enquiries' changeStatus pattern) ──
  const changeStatus = async (match, newStatus, notes) => {
    setActionErr('')
    try {
      await updateMatch(match.id, { status: newStatus, notes: notes ?? match.notes })
      refreshAll()
    } catch (err) {
      setActionErr(err.message)
    }
  }

  const handleAssign = async () => {
    if (!assigning || !assignTo) return
    setActionErr('')
    try {
      await updateMatch(assigning.id, { assigned_user_id: Number(assignTo) })
      setAssigning(null)
      refreshAll()
    } catch (err) {
      setActionErr(err.message)
    }
  }

  const handleRecalculate = async () => {
    if (!window.confirm('Re-score every open requirement against every available property now?')) return
    setBusy(true)
    setActionErr('')
    setNotice('')
    try {
      const res = await recalculateMatches()
      setNotice(typeof res === 'string' ? res : 'Recalculation complete.')
      refreshAll()
    } catch (err) {
      setActionErr(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleBulk = async (newStatus, notes) => {
    setBusy(true)
    setActionErr('')
    try {
      const res = await bulkUpdateMatches({ ids: selectedIds, status: newStatus, notes })
      if (res?.failed?.length) {
        setActionErr(`${res.failed.length} match(es) could not be updated (a note is required to close or reject).`)
      }
      setSelectedIds([])
      refreshAll()
    } catch (err) {
      setActionErr(err.message)
    } finally {
      setBusy(false)
    }
  }

  const submitReject = async () => {
    if (!rejectNote.trim()) return
    const note = rejectNote.trim()
    const target = rejecting
    setRejecting(null)
    setRejectNote('')
    if (target?.bulk) await handleBulk(target.targetStatus || 'Rejected', note)
    else await changeStatus(target, target.targetStatus || 'Rejected', note)
  }

  const toggleSelect = (id) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])
  }

  // ── Analytics ──
  const bandChart = (analytics?.by_band ?? []).map(b => ({ ...b, fill: BAND_COLORS[b.band] || '#6366f1' }))
  const stats = [
    { label: 'Total Matches', value: analytics?.total ?? '—', icon: 'Sparkles', color: 'indigo' },
    { label: 'High Matches', value: bandChart.find(b => b.band === 'High')?.count ?? 0, icon: 'TrendingUp', color: 'emerald' },
    { label: 'Pending Contact', value: analytics?.pending_contact ?? 0, icon: 'Clock', color: 'amber' },
    { label: 'Closed', value: analytics?.closed ?? 0, icon: 'CheckCircle2', color: 'violet' },
  ]

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Matching"
        subtitle="Score-ranked buyer ↔ property suggestions from the matching engine"
        breadcrumb={['Manage', 'Matching']}
        actions={writable && (
          <Button variant="secondary" onClick={handleRecalculate} loading={busy}>
            <RefreshCw size={13} /> Recalculate
          </Button>
        )}
      />

      {/* Analytics strip */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
        <Card padding={false} className="col-span-2 xl:col-span-1 p-3">
          <p className="text-xs font-semibold text-slate-400 mb-1 px-1">By Score Band</p>
          {bandChart.length === 0 ? (
            <p className="text-xs text-slate-400 px-1 py-4">No scored matches yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={72}>
              <BarChart data={bandChart} margin={{ top: 0, right: 4, left: 4, bottom: 0 }}>
                <XAxis dataKey="band" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ border: 'none', borderRadius: 10, fontSize: 11, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {bandChart.map((b, i) => <Cell key={i} fill={b.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* View toggle + filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 shrink-0">
          {[
            { id: 'buyer', label: 'Buyer → Property', icon: Users },
            { id: 'property', label: 'Property → Buyer', icon: Building2 },
          ].map(v => {
            const Icon = v.icon
            return (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-colors',
                  view === v.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <Icon size={13} /> {v.label}
              </button>
            )
          })}
        </div>
        <FormInput
          id="match-search" size="sm" placeholder="Search client or property…"
          prefix={<Search size={13} />}
          value={search} onChange={e => resetPage(setSearch)(e.target.value)}
          wrapperClass="w-full lg:w-64"
        />
        <Select
          id="match-status" size="sm" wrapperClass="w-full lg:w-44"
          options={STATUS_OPTIONS.map(s => ({ value: s, label: s === 'All' ? 'All Statuses' : s }))}
          value={status} onChange={e => resetPage(setStatus)(e.target.value)}
        />
        <button
          onClick={() => resetPage(setSortByScore)(!sortByScore)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold shrink-0 transition-colors',
            sortByScore
              ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
              : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800'
          )}
        >
          <ArrowDownWideNarrow size={13} /> {sortByScore ? 'Sorted by score' : 'Sorted by date'}
        </button>
      </div>

      <FilterPills options={BAND_PILLS.map(b => ({ value: b, label: b === 'All' ? 'All Bands' : b }))}
        value={band} onChange={resetPage(setBand)} />

      <ErrorBanner message={error?.message || actionErr} />
      {notice && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3">{notice}</div>
      )}

      {/* Bulk action bar */}
      {canBulk && selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-slate-900 text-white px-4 py-2.5 sticky top-2 z-10">
          <span className="text-xs font-semibold">{selectedIds.length} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" variant="success" onClick={() => handleBulk('Shortlisted')} loading={busy}>
              <Check size={13} /> Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => { setRejecting({ bulk: true }); setRejectNote('') }}>
              <X size={13} /> Reject
            </Button>
            <Button size="sm" variant="ghost" className="text-slate-300" onClick={() => setSelectedIds([])}>Clear</Button>
          </div>
        </div>
      )}

      {/* Grouped match list */}
      {loading ? (
        <Spinner />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No matches found"
          description="Try clearing filters, or run a recalculation to score current requirements against the catalogue."
          action={writable ? <Button onClick={handleRecalculate}><RefreshCw size={14} /> Recalculate Now</Button> : undefined}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map(group => (
            <MatchGroup
              key={group.key}
              group={group}
              view={view}
              canBulk={canBulk}
              writable={writable}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onApprove={m => changeStatus(m, 'Shortlisted')}
              onReject={m => { setRejecting(m); setRejectNote('') }}
              onAssign={m => { setAssigning(m); setAssignTo(String(m.assigned_user_id ?? '')) }}
              onStatus={(m, s) => {
                // Closed/Rejected require an outcome note server-side — route
                // them through the note modal instead of failing the save.
                if (['Closed', 'Rejected'].includes(s) && !m.notes) {
                  setRejecting({ ...m, targetStatus: s })
                  setRejectNote('')
                } else {
                  changeStatus(m, s)
                }
              }}
            />
          ))}
          <div className="bg-white rounded-2xl border border-slate-200/80">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={total} pageSize={PAGE_SIZE} />
          </div>
        </div>
      )}

      {/* Reject-with-note modal (backend requires a note for Rejected) */}
      <Modal
        open={rejecting !== null}
        onClose={() => setRejecting(null)}
        title={rejecting?.bulk
          ? `${rejecting.targetStatus || 'Reject'} ${selectedIds.length} matches`
          : `${rejecting?.targetStatus === 'Closed' ? 'Close' : 'Reject'} match`}
        subtitle="An outcome note is required for this status"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejecting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={submitReject} disabled={!rejectNote.trim()}>Reject</Button>
          </div>
        }
      >
        <Textarea
          label="Outcome note" id="reject-note" rows={3} required
          value={rejectNote} onChange={e => setRejectNote(e.target.value)}
          placeholder="e.g. Client found the location unsuitable…"
        />
      </Modal>

      {/* Assign modal */}
      <Modal
        open={assigning !== null}
        onClose={() => setAssigning(null)}
        title="Assign match"
        subtitle={assigning ? `${assigning.customer_name || 'Client'} — ${assigning.property_title || 'Property'}` : ''}
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setAssigning(null)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!assignTo}>Assign</Button>
          </div>
        }
      >
        <Select
          label="Assign to" id="assign-agent"
          options={(agents ?? []).map(a => ({ value: String(a.id), label: `${a.full_name} (${a.role})` }))}
          value={assignTo} onChange={e => setAssignTo(e.target.value)}
        />
      </Modal>
    </div>
  )
}

function MatchGroup({ group, view, canBulk, writable, selectedIds, onToggleSelect, onApprove, onReject, onAssign, onStatus }) {
  const [open, setOpen] = useState(true)
  const GroupIcon = view === 'buyer' ? Users : Building2

  return (
    <Card padding={false}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-5 py-3.5 text-left"
      >
        {open ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
        <GroupIcon size={15} className="text-indigo-500" />
        <span className="text-sm font-semibold text-slate-800">{group.label}</span>
        <span className="text-xs text-slate-400 ml-auto">{group.items.length} match{group.items.length === 1 ? '' : 'es'}</span>
      </button>

      {open && (
        <div className="divide-y divide-slate-50 border-t border-slate-100">
          {group.items.map(m => {
            const terminal = ['Closed', 'Rejected'].includes(m.status)
            return (
              <div key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5">
                {canBulk && (
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-indigo-600 shrink-0"
                    checked={selectedIds.includes(m.id)}
                    onChange={() => onToggleSelect(m.id)}
                  />
                )}

                {/* Score */}
                <div className="w-14 shrink-0 text-center">
                  {m.score != null ? (
                    <>
                      <p className="text-lg font-bold text-slate-800 leading-none">{m.score}%</p>
                      <Badge status={m.score_band} className="mt-1 !px-1.5 !text-[10px]" />
                    </>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Manual</span>
                  )}
                </div>

                {/* Counterpart + explanation */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {view === 'buyer' ? (m.property_title || 'Unknown property') : (m.customer_name || 'Unknown client')}
                    {view === 'buyer' && m.property_price != null && (
                      <span className="text-xs text-slate-400 font-normal ml-2">{formatCurrency(m.property_price)}</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 truncate" title={m.explanation || ''}>
                    {m.explanation || m.notes || '—'}
                  </p>
                </div>

                <Badge status={m.status} dot />

                {/* Actions (read-only roles see the status, not the controls) */}
                {writable && (
                  <div className="flex items-center gap-1 shrink-0">
                    {!terminal && (
                      <>
                        <Button size="icon-sm" variant="ghost" title="Approve (shortlist)" onClick={() => onApprove(m)}>
                          <Check size={14} className="text-emerald-600" />
                        </Button>
                        <Button size="icon-sm" variant="ghost" title="Reject" onClick={() => onReject(m)}>
                          <X size={14} className="text-rose-500" />
                        </Button>
                        <Button size="icon-sm" variant="ghost" title="Assign" onClick={() => onAssign(m)}>
                          <UserPlus size={14} className="text-slate-500" />
                        </Button>
                      </>
                    )}
                    <select
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 outline-none focus:border-indigo-400"
                      value={m.status}
                      onChange={e => onStatus(m, e.target.value)}
                    >
                      {STATUS_OPTIONS.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
