'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Phone, Mail, Search, Download } from 'lucide-react'
import PageHeader from '../../../components/PageHeader'
import Badge from '../../../components/Badge'
import Avatar from '../../../components/Avatar'
import Button from '../../../components/Button'
import FilterPills from '../../../components/FilterPills'
import EmptyState from '../../../components/EmptyState'
import Spinner from '../../../components/Spinner'
import ErrorBanner from '../../../components/ErrorBanner'
import { listCustomers } from '../../../api/customers'
import { getCustomerDashboard } from '../../../api/dashboard'
import { exportEntity } from '../../../api/dataTransfer'
import { useApi } from '../../../hooks/useApi'
import { useAuth } from '../../../context/AuthContext'
import { canWrite, canExport } from '../../../utils/permissions'
import { formatCurrency, humanizeLabel } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'

// Backend lead_type is lowercase (buyer/seller/investor/tenant/owner/enquiry);
// the UI shows the capitalized subset the spec calls out as client "types".
const CLIENT_TYPES = ['Buyer', 'Seller', 'Investor', 'Tenant']
const humanizeType = (t) => (t ? humanizeLabel(t) : 'Enquiry')
const isActiveStatus = (status) => !['closed', 'lost'].includes(status)

export default function Clients() {
  const router = useRouter()
  const { user } = useAuth()
  const writable   = canWrite(user, 'customers')
  const exportable = canExport(user, 'customers')
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch]         = useState('')

  const fetcher = useCallback(
    () => listCustomers({
      lead_type: typeFilter ? typeFilter.toLowerCase() : undefined,
      search: search || undefined,
      page_size: 100,
    }),
    [typeFilter, search],
  )
  const { data, loading, error } = useApi(fetcher, [typeFilter, search])
  const clients = data?.data ?? []

  // Lead pipeline aggregates (spec: Customer Dashboard).
  const dashFetcher = useCallback(() => getCustomerDashboard(), [])
  const { data: dash } = useApi(dashFetcher, [])
  // Keep the funnel in pipeline order rather than count order.
  const PIPELINE_ORDER = ['new', 'contacted', 'qualified', 'shortlisted', 'visit_planned', 'negotiation', 'closed', 'lost', 'on_hold']
  const byStatus = [...(dash?.by_status ?? [])].sort(
    (a, b) => PIPELINE_ORDER.indexOf(a.status) - PIPELINE_ORDER.indexOf(b.status)
  )

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Clients"
        subtitle={`${data?.total ?? clients.length} registered clients`}
        breadcrumb={['Home', 'Clients']}
        actions={
          <>
            {exportable && (
              <Button variant="secondary" onClick={() => exportEntity('customers').catch(e => alert(e.message))} title="Export CSV">
                <Download size={14} /> Export
              </Button>
            )}
            {writable && (
              <Button className="w-full sm:w-auto justify-center" onClick={() => router.push('/admin/clients/add')}>
                <Plus size={14} /> Add Client
              </Button>
            )}
          </>
        }
      />

      {/* Lead pipeline strip (Customer Dashboard aggregates) */}
      {byStatus.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white border border-slate-200/80 px-4 py-3">
          <span className="text-xs font-semibold text-slate-400 mr-1">Pipeline</span>
          {byStatus.map(s => (
            <Badge key={s.status} status={s.status}>{humanizeLabel(s.status)} · {s.count}</Badge>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <FilterPills
          options={[{ value: '', label: 'All Types' }, ...CLIENT_TYPES.map(t => ({ value: t, label: t }))]}
          value={typeFilter}
          onChange={setTypeFilter}
        />
        <div className="relative sm:ml-auto sm:max-w-xs w-full">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="w-full h-10 pl-9 pr-4 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
          />
        </div>
      </div>

      <ErrorBanner message={error?.message} />

      {loading ? (
        <Spinner />
      ) : clients.length === 0 ? (
        <EmptyState icon={Search} title="No clients found" description="Try a different filter, or add your first client via a property enquiry." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map(client => (
            <ClientCard key={client.id} client={client} onClick={() => router.push(`/admin/clients/${client.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ClientCard({ client, onClick }) {
  const req = client.primary_requirement
  const active = isActiveStatus(client.status)
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={client.name} size="md" online={active} />
          <div>
            <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{client.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{client.email}</p>
          </div>
        </div>
        <Badge status={humanizeType(client.lead_type)} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Enquiries', value: client.enquiries ?? 0 },
          { label: 'Saved',     value: client.saved_property_ids?.length ?? 0 },
          { label: 'Status',    value: active ? '●' : '○' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-50 rounded-xl p-2.5 text-center">
            <p className={cn('text-base font-bold', label === 'Status' ? (value === '●' ? 'text-emerald-500' : 'text-slate-300') : 'text-slate-800')}>{value}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {['buyer', 'investor'].includes(client.lead_type) && req?.budget_max > 0 && (
        <div className="flex items-center justify-between px-3 py-2.5 bg-indigo-50 rounded-xl mb-4">
          <span className="text-xs text-slate-500">Budget</span>
          <span className="text-xs font-bold text-indigo-700">
            {formatCurrency(req.budget_min || 0)} – {formatCurrency(req.budget_max)}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-3.5">
        <div className="flex items-center gap-2">
          <a href={`tel:${client.phone}`} onClick={e => e.stopPropagation()} className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
            <Phone size={13} />
          </a>
          <a href={`mailto:${client.email}`} onClick={e => e.stopPropagation()} className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
            <Mail size={13} />
          </a>
        </div>
        {client.assigned_agent && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">{client.assigned_agent}</span>
            <Avatar name={client.assigned_agent} size="xs" />
          </div>
        )}
      </div>
    </div>
  )
}
