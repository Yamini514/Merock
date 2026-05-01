import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Phone, Mail, Eye, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import Avatar from '../components/Avatar'
import Button from '../components/Button'
import Select from '../components/Select'
import { CLIENTS, CLIENT_TYPES } from '../mock-data/clients'
import { formatCurrency } from '../utils/formatters'
import { cn } from '../utils/cn'

export default function Clients() {
  const navigate      = useNavigate()
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch]         = useState('')

  const filtered = CLIENTS.filter(c => {
    if (typeFilter && c.type !== typeFilter) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Clients"
        subtitle={`${CLIENTS.length} registered clients`}
        breadcrumb={['Home', 'Clients']}
        actions={
          <>
            <Select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              options={[{ value: '', label: 'All Types' }, ...CLIENT_TYPES.map(t => ({ value: t, label: t }))]}
              wrapperClass="min-w-[130px]"
            />
            <Button><Plus size={14} /> Add Client</Button>
          </>
        }
      />

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clients…"
          className="w-full h-10 pl-9 pr-4 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
        />
      </div>

      {/* Client cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(client => (
          <ClientCard key={client.id} client={client} onClick={() => navigate(`/clients/${client.id}`)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <p className="text-sm">No clients found.</p>
        </div>
      )}
    </div>
  )
}

function ClientCard({ client, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={client.name} size="md" online={client.status === 'active'} />
          <div>
            <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{client.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{client.email}</p>
          </div>
        </div>
        <Badge status={client.type} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Enquiries', value: client.enquiries },
          { label: 'Saved',     value: client.savedProperties?.length ?? 0 },
          { label: 'Status',    value: client.status === 'active' ? '●' : '○' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-50 rounded-xl p-2.5 text-center">
            <p className={cn('text-base font-bold', label === 'Status' ? (value === '●' ? 'text-emerald-500' : 'text-slate-300') : 'text-slate-800')}>{value}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {(client.type === 'Buyer' || client.type === 'Investor') && client.budget?.max > 0 && (
        <div className="flex items-center justify-between px-3 py-2.5 bg-indigo-50 rounded-xl mb-4">
          <span className="text-xs text-slate-500">Budget</span>
          <span className="text-xs font-bold text-indigo-700">
            {formatCurrency(client.budget.min)} – {formatCurrency(client.budget.max)}
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
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400">{client.assignedAgent}</span>
          <Avatar name={client.assignedAgent} size="xs" />
        </div>
      </div>
    </div>
  )
}
