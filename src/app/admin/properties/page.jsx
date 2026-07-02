'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, SlidersHorizontal, LayoutGrid, List, MapPin, Bed, Bath, Maximize2, Edit2, Eye, Trash2, X, AlertCircle } from 'lucide-react'
import PageHeader from '../../../components/PageHeader'
import Badge from '../../../components/Badge'
import DataTable from '../../../components/DataTable'
import Button from '../../../components/Button'
import EmptyState from '../../../components/EmptyState'
import { listProperties, deleteProperty } from '../../../api/properties'
import { useApi } from '../../../hooks/useApi'
import { formatCurrency } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'

// Filter options mirror the backend Property enums.
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Studio', 'Penthouse', 'Commercial', 'Plot']
const STATUS_OPTIONS = ['available', 'under_discussion', 'sold', 'draft', 'inactive']
const ALL_TYPES    = ['All', ...PROPERTY_TYPES]
const ALL_STATUSES = ['All', ...STATUS_OPTIONS]

const humanize = (s) => s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

export default function Properties() {
  const router = useRouter()
  const [view, setView]                  = useState('grid')
  const [activeType, setActiveType]      = useState('All')
  const [activeStatus, setActiveStatus]  = useState('All')

  const fetcher = useCallback(
    () => listProperties({
      property_type: activeType   === 'All' ? undefined : activeType,
      status:        activeStatus === 'All' ? undefined : activeStatus,
      page_size: 300,
    }),
    [activeType, activeStatus],
  )
  const { data, loading, error, refetch } = useApi(fetcher, [activeType, activeStatus])

  const properties = data?.data ?? []
  const total = data?.total ?? properties.length
  const hasFilter = activeType !== 'All' || activeStatus !== 'All'

  async function handleDelete(id) {
    if (!window.confirm('Mark this property inactive?')) return
    try { await deleteProperty(id); refetch() }
    catch (e) { alert(e.message) }
  }

  const tableColumns = [
    {
      key: 'title', label: 'Property', sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <img src={row.image} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 bg-slate-100" />
          <div>
            <p className="font-semibold text-slate-800 text-sm">{val}</p>
            <p className="text-xs text-slate-400 flex items-center gap-0.5 mt-0.5"><MapPin size={9} />{row.location}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'property_type', label: 'Type', sortable: true,
      render: v => <span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-1 font-medium">{v}</span>,
    },
    {
      key: 'price', label: 'Price', sortable: true,
      render: v => <span className="font-bold text-slate-900">{formatCurrency(v)}</span>,
    },
    {
      key: 'area', label: 'Area',
      render: v => <span className="text-slate-500">{(v ?? 0).toLocaleString()} sqft</span>,
    },
    { key: 'status', label: 'Status', render: v => <Badge status={v} dot /> },
    { key: 'agent',  label: 'Agent', sortable: true },
    {
      key: 'id', label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={e => { e.stopPropagation(); router.push(`/admin/properties/${row.id}`) }} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><Eye size={13} /></button>
          <button onClick={e => { e.stopPropagation(); router.push(`/admin/properties/edit/${row.id}`) }} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Edit2 size={13} /></button>
          <button onClick={e => { e.stopPropagation(); handleDelete(row.id) }} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Properties"
        subtitle={`${total} total listings`}
        breadcrumb={['Home', 'Properties']}
        actions={
          <>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden">
              <button onClick={() => setView('grid')} className={cn('p-2.5 transition-colors', view === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600')}><LayoutGrid size={15} /></button>
              <button onClick={() => setView('table')} className={cn('p-2.5 transition-colors', view === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600')}><List size={15} /></button>
            </div>
            <Button onClick={() => router.push('/admin/properties/add')}>
              <Plus size={14} /> Add Property
            </Button>
          </>
        }
      />

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {ALL_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150',
                activeType === t
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-1.5 flex-wrap">
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150',
                activeStatus === s
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              {s === 'All' ? 'All' : humanize(s)}
            </button>
          ))}
        </div>

        {hasFilter && (
          <button
            onClick={() => { setActiveType('All'); setActiveStatus('All') }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <X size={11} /> Clear filters
          </button>
        )}

        <span className="ml-auto text-xs text-slate-400 font-medium">{properties.length} results</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <AlertCircle size={16} /> {error.message}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center"><span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
      ) : view === 'grid' ? (
        properties.length === 0
          ? <EmptyState icon={SlidersHorizontal} title="No properties match your filters" action={<Button variant="secondary" size="sm" onClick={() => { setActiveType('All'); setActiveStatus('All') }}>Clear filters</Button>} />
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {properties.map(p => <PropertyCard key={p.id} property={p} onDelete={handleDelete} />)}
            </div>
          )
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <DataTable
            columns={tableColumns}
            data={properties}
            searchable
            searchKeys={['title', 'location', 'agent', 'property_type', 'code']}
            pageSize={8}
            onRowClick={row => router.push(`/admin/properties/${row.id}`)}
          />
        </div>
      )}
    </div>
  )
}

function PropertyCard({ property: p }) {
  const router = useRouter()
  return (
    <div
      onClick={() => router.push(`/admin/properties/${p.id}`)}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden group cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={p.image}
          alt={p.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3">
          <Badge status={p.status} dot />
        </div>
        <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={e => { e.stopPropagation(); router.push(`/admin/properties/edit/${p.id}`) }}
            className="p-2 rounded-xl bg-white/90 backdrop-blur-sm text-slate-700 hover:text-indigo-600 shadow-sm transition-colors"
          >
            <Edit2 size={13} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="font-semibold text-slate-800 leading-snug text-sm group-hover:text-indigo-700 transition-colors">{p.title}</p>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1.5">
          <MapPin size={10} /> {p.location}
        </p>
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
          {p.bedrooms > 0 && <span className="flex items-center gap-1"><Bed size={11} />{p.bedrooms} Bed</span>}
          {p.bathrooms > 0 && <span className="flex items-center gap-1"><Bath size={11} />{p.bathrooms} Bath</span>}
          <span className="flex items-center gap-1"><Maximize2 size={11} />{(p.area ?? 0).toLocaleString()} sqft</span>
        </div>
        <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-slate-100">
          <span className="text-base font-bold text-indigo-600">{formatCurrency(p.price)}</span>
          <div className="flex gap-1">
            {(p.tags ?? []).slice(0, 1).map(tag => (
              <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 font-medium">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
