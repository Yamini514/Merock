'use client'

import { useState, useCallback } from 'react'
import { Plus, CalendarClock, Building2, Users, Share2, GanttChart, Check } from 'lucide-react'
import PageHeader from '../../../components/PageHeader'
import Badge from '../../../components/Badge'
import Button from '../../../components/Button'
import Modal from '../../../components/Modal'
import FormInput, { Textarea } from '../../../components/FormInput'
import Select from '../../../components/Select'
import EmptyState from '../../../components/EmptyState'
import FilterPills from '../../../components/FilterPills'
import OptionPicker from '../../../components/OptionPicker'
import Spinner from '../../../components/Spinner'
import ErrorBanner from '../../../components/ErrorBanner'
import { listFollowUps, createFollowUp, completeFollowUp } from '../../../api/followups'
import { getFollowUpDashboard } from '../../../api/dashboard'
import { listCustomers } from '../../../api/customers'
import { listProperties } from '../../../api/properties'
import { listReferrals } from '../../../api/referrals'
import { listMatches } from '../../../api/matches'
import { useApi } from '../../../hooks/useApi'
import { useAuth } from '../../../context/AuthContext'
import { canWrite } from '../../../utils/permissions'
import { formatDate } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'

const STATUS_OPTIONS = ['All', 'pending', 'completed']

const LINKED_TYPE_META = {
  Customer: { icon: Users,      label: 'Client',   gradient: 'from-emerald-500 to-teal-600' },
  Property: { icon: Building2,  label: 'Property', gradient: 'from-indigo-500 to-blue-600' },
  Referral: { icon: Share2,     label: 'Referral', gradient: 'from-amber-500 to-orange-500' },
  Match:    { icon: GanttChart, label: 'Enquiry',  gradient: 'from-violet-500 to-purple-600' },
}

const LINKED_TYPE_OPTIONS = [
  { value: 'Customer', ...LINKED_TYPE_META.Customer },
  { value: 'Property', ...LINKED_TYPE_META.Property },
  { value: 'Referral', ...LINKED_TYPE_META.Referral },
  { value: 'Match', ...LINKED_TYPE_META.Match },
]

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High', dot: 'bg-rose-500' },
  { value: 'medium', label: 'Medium', dot: 'bg-amber-500' },
  { value: 'low', label: 'Low', dot: 'bg-slate-400' },
]

function dueMeta(dueDate, status) {
  if (status === 'completed') return { label: formatDate(dueDate), cls: 'text-slate-400' }
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due - today) / 86400000)
  if (diffDays < 0) return { label: `Overdue · ${formatDate(dueDate)}`, cls: 'text-rose-600 font-semibold' }
  if (diffDays === 0) return { label: 'Due today', cls: 'text-amber-600 font-semibold' }
  return { label: formatDate(dueDate), cls: 'text-slate-500' }
}

export default function FollowUps() {
  const { user } = useAuth()
  const writable = canWrite(user, 'followups')
  const [statusFilter, setStatusFilter] = useState('All')
  const [addOpen, setAddOpen] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [err, setErr] = useState('')

  const fetcher = useCallback(
    () => listFollowUps({ status: statusFilter === 'All' ? undefined : statusFilter, page_size: 300 }),
    [statusFilter],
  )
  const { data, loading, error, refetch } = useApi(fetcher, [statusFilter])
  const items = data?.data ?? []

  // Due/overdue/completed aggregates (spec: Follow-up Dashboard).
  const dashFetcher = useCallback(() => getFollowUpDashboard(), [])
  const { data: dash, refetch: refetchDash } = useApi(dashFetcher, [])
  const dueStats = [
    { label: 'Due Today', value: dash?.due_today, cls: 'text-amber-600' },
    { label: 'Overdue',   value: dash?.overdue,   cls: 'text-rose-600' },
    { label: 'Completed', value: dash?.completed,  cls: 'text-emerald-600' },
  ]

  async function handleComplete(id) {
    setBusyId(id)
    setErr('')
    try { await completeFollowUp(id); refetch(); refetchDash() }
    catch (e) { setErr(e.message) }
    finally { setBusyId(null) }
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Follow-ups"
        subtitle={`${items.length} task${items.length !== 1 ? 's' : ''}`}
        breadcrumb={['Home', 'Follow-ups']}
        actions={writable && (
          <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto justify-center">
            <Plus size={14} /> New Follow-up
          </Button>
        )}
      />

      {/* Due/overdue strip (Follow-up Dashboard aggregates) */}
      {dash && (
        <div className="grid grid-cols-3 gap-3">
          {dueStats.map(s => (
            <div key={s.label} className="rounded-2xl bg-white border border-slate-200/80 px-4 py-3 text-center sm:text-left">
              <p className={cn('text-xl font-bold leading-none', s.cls)}>{s.value ?? 0}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <FilterPills
        options={STATUS_OPTIONS}
        value={statusFilter}
        onChange={setStatusFilter}
        getLabel={s => (s === 'All' ? 'All' : s[0].toUpperCase() + s.slice(1))}
      />

      <ErrorBanner message={error?.message || err} />

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No follow-ups"
          description="Create one to remind yourself to check back on a client, property, referral, or enquiry."
          action={writable ? <Button size="sm" onClick={() => setAddOpen(true)}><Plus size={13} /> New Follow-up</Button> : undefined}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-50">
          {items.map(item => {
            const meta = LINKED_TYPE_META[item.linked_type] ?? LINKED_TYPE_META.Customer
            const Icon = meta.icon
            const due = dueMeta(item.due_date, item.status)
            return (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {item.linked_label || `${meta.label} #${item.linked_id}`}
                    </p>
                    <Badge status={item.priority} />
                  </div>
                  <p className={cn('text-xs mt-1', due.cls)}>{due.label}</p>
                  {item.notes && <p className="text-xs text-slate-400 mt-1 truncate">{item.notes}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-400 hidden sm:block">{item.owner_name}</span>
                  {item.status === 'completed' ? (
                    <Badge status="completed" />
                  ) : writable ? (
                    <Button size="sm" variant="secondary" disabled={busyId === item.id} onClick={() => handleComplete(item.id)}>
                      <Check size={13} /> Complete
                    </Button>
                  ) : (
                    <Badge status="pending" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {addOpen && <AddFollowUpModal onClose={() => setAddOpen(false)} onCreated={() => { setAddOpen(false); refetch() }} />}
    </div>
  )
}

function AddFollowUpModal({ onClose, onCreated }) {
  const [linkedType, setLinkedType] = useState('Customer')
  const [linkedId, setLinkedId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const customersFetcher = useCallback(() => listCustomers({ page_size: 300 }), [])
  const { data: customersData } = useApi(customersFetcher, [])
  const propertiesFetcher = useCallback(() => listProperties({ page_size: 300 }), [])
  const { data: propertiesData } = useApi(propertiesFetcher, [])
  const referralsFetcher = useCallback(() => listReferrals({ page_size: 300 }), [])
  const { data: referralsData } = useApi(referralsFetcher, [])
  const matchesFetcher = useCallback(() => listMatches({ page_size: 300 }), [])
  const { data: matchesData } = useApi(matchesFetcher, [])

  const OPTIONS_BY_TYPE = {
    Customer: (customersData?.data ?? []).map(c => ({ value: c.id, label: c.name })),
    Property: (propertiesData?.data ?? []).map(p => ({ value: p.id, label: p.title })),
    Referral: (referralsData?.data ?? []).map(r => ({ value: r.id, label: `${r.member_name} → ${r.customer_name || r.property_title || 'General'}` })),
    Match: (matchesData?.data ?? []).map(m => ({ value: m.id, label: `${m.customer_name || 'Client'} — ${m.property_title}` })),
  }

  function handleTypeChange(t) {
    setLinkedType(t)
    setLinkedId('')
  }

  async function handleSave() {
    if (!linkedId || !dueDate) { setErr('Select what this follow-up is about and a due date.'); return }
    setSaving(true)
    setErr('')
    try {
      await createFollowUp({ linked_type: linkedType, linked_id: linkedId, due_date: dueDate, priority, notes: notes || null })
      onCreated()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="New Follow-up"
      subtitle="Remind yourself to check back on something"
      size="md"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Follow-up'}</Button></>}
    >
      <div className="flex flex-col gap-4">
        <ErrorBanner message={err} />

        <OptionPicker
          label="Follow up about"
          options={LINKED_TYPE_OPTIONS}
          value={linkedType}
          onChange={handleTypeChange}
          columns={4}
        />

        <Select
          label={LINKED_TYPE_META[linkedType]?.label ?? 'Record'}
          value={linkedId}
          onChange={e => setLinkedId(e.target.value)}
          options={[{ value: '', label: 'Select…' }, ...OPTIONS_BY_TYPE[linkedType]]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormInput label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Priority</label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map(opt => {
                const active = priority === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 rounded-xl border h-10 text-xs font-semibold transition-all duration-150',
                      active
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <span className={cn('w-1.5 h-1.5 rounded-full', opt.dot)} />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <Textarea label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="What needs to happen…" rows={3} />
      </div>
    </Modal>
  )
}
