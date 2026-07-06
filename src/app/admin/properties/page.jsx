'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, SlidersHorizontal, LayoutGrid, List, MapPin, Bed, Bath, Maximize2, Edit2, Eye, Trash2, X, Download, Upload } from 'lucide-react'
import PageHeader from '../../../components/PageHeader'
import Badge from '../../../components/Badge'
import DataTable from '../../../components/DataTable'
import Button from '../../../components/Button'
import EmptyState from '../../../components/EmptyState'
import Spinner from '../../../components/Spinner'
import ErrorBanner from '../../../components/ErrorBanner'
import { listProperties, deleteProperty } from '../../../api/properties'
import { getPropertyDashboard } from '../../../api/dashboard'
import { exportEntity, importEntity } from '../../../api/dataTransfer'
import { useApi } from '../../../hooks/useApi'
import { useAuth } from '../../../context/AuthContext'
import { canWrite, canExport, canImportProperties } from '../../../utils/permissions'
import { formatCurrency, humanizeLabel } from '../../../utils/formatters'
import { deriveOptions } from '../../../utils/deriveOptions'
import FilterPills, { PILL_SLATE } from '../../../components/FilterPills'
import { cn } from '../../../utils/cn'

export default function Properties() {
  const router = useRouter()
  const { user } = useAuth()
  const writable   = canWrite(user, 'properties')
  const exportable = canExport(user, 'properties')
  const importable = canImportProperties(user)
  const importInputRef = useRef(null)
  const [importing, setImporting] = useState(false)
  const [view, setView]                  = useState('grid')
  const [activeType, setActiveType]      = useState('All')
  const [activeStatus, setActiveStatus]  = useState('All')

  // One unfiltered fetch — filter pills (which must reflect the FULL
  // catalogue, not just the currently-filtered subset) and the displayed
  // list both derive from this same result, instead of firing two full
  // property scans per render.
  const fetcher = useCallback(() => listProperties({ page_size: 300 }), [])
  const { data, loading, error, refetch } = useApi(fetcher, [])
  const allProperties = data?.data ?? []

  // Property pipeline aggregates (spec: Property Dashboard) — cheap dedicated
  // endpoint, independent of the row fetch above.
  const dashFetcher = useCallback(() => getPropertyDashboard(), [])
  const { data: dash } = useApi(dashFetcher, [])
  const byStatus = dash?.by_status ?? []

  const ALL_TYPES    = ['All', ...deriveOptions(allProperties, 'property_type')]
  const ALL_STATUSES = ['All', ...deriveOptions(allProperties, 'status')]

  const properties = allProperties.filter(p =>
    (activeType === 'All' || p.property_type === activeType) &&
    (activeStatus === 'All' || p.status === activeStatus)
  )
  const total = allProperties.length
  const hasFilter = activeType !== 'All' || activeStatus !== 'All'

  async function handleDelete(id) {
    if (!window.confirm('Mark this property inactive?')) return
    try { await deleteProperty(id); refetch() }
    catch (e) { alert(e.message) }
  }

  // SRS Property Intake Workflow: "creates property record or imports
  // property details" — CSV/XLSX, upserting on property code.
  async function handleImportFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    setImporting(true)
    try {
      const res = await importEntity('properties', file)
      alert(`Import complete: ${res.created} created, ${res.updated} updated, ${res.failed?.length ?? 0} failed.`)
      refetch()
    } catch (err) {
      alert(err.message)
    } finally {
      setImporting(false)
    }
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
          {writable && <button onClick={e => { e.stopPropagation(); router.push(`/admin/properties/edit/${row.id}`) }} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Edit2 size={13} /></button>}
          {writable && <button onClick={e => { e.stopPropagation(); handleDelete(row.id) }} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 size={13} /></button>}
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
            <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0">
              <button onClick={() => setView('grid')} className={cn('p-2.5 transition-colors', view === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600')}><LayoutGrid size={15} /></button>
              <button onClick={() => setView('table')} className={cn('p-2.5 transition-colors', view === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600')}><List size={15} /></button>
            </div>
            {importable && (
              <>
                <input ref={importInputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleImportFile} />
                <Button variant="secondary" onClick={() => importInputRef.current?.click()} disabled={importing} title="Import CSV/XLSX">
                  <Upload size={14} /> {importing ? 'Importing…' : 'Import'}
                </Button>
              </>
            )}
            {exportable && (
              <Button variant="secondary" onClick={() => exportEntity('properties').catch(e => alert(e.message))} title="Export CSV">
                <Download size={14} /> Export
              </Button>
            )}
            {writable && (
              <Button onClick={() => router.push('/admin/properties/add')} className="flex-1 sm:flex-initial justify-center">
                <Plus size={14} /> Add Property
              </Button>
            )}
          </>
        }
      />

      {/* Pipeline strip (Property Dashboard aggregates) */}
      {byStatus.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white border border-slate-200/80 px-4 py-3">
          <span className="text-xs font-semibold text-slate-400 mr-1">Pipeline</span>
          {byStatus.map(s => (
            <button
              key={s.status}
              onClick={() => setActiveStatus(activeStatus === s.status ? 'All' : s.status)}
              className={cn('transition-opacity', activeStatus !== 'All' && activeStatus !== s.status && 'opacity-40')}
              title={`Filter by ${humanizeLabel(s.status)}`}
            >
              <Badge status={s.status}>{humanizeLabel(s.status)} · {s.count}</Badge>
            </button>
          ))}
        </div>
      )}

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterPills options={ALL_TYPES} value={activeType} onChange={setActiveType} />

        <div className="w-px h-5 bg-slate-200 hidden sm:block" />

        <FilterPills
          options={ALL_STATUSES}
          value={activeStatus}
          onChange={setActiveStatus}
          activeClassName={PILL_SLATE}
          getLabel={s => (s === 'All' ? 'All' : humanizeLabel(s))}
        />

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

      <ErrorBanner message={error?.message} />

      {loading ? (
        <Spinner />
      ) : view === 'grid' ? (
        properties.length === 0
          ? <EmptyState icon={SlidersHorizontal} title="No properties match your filters" action={<Button variant="secondary" size="sm" onClick={() => { setActiveType('All'); setActiveStatus('All') }}>Clear filters</Button>} />
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {properties.map(p => <PropertyCard key={p.id} property={p} onDelete={handleDelete} writable={writable} />)}
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

function PropertyCard({ property: p, writable }) {
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
        {writable && (
          <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
            <button
              onClick={e => { e.stopPropagation(); router.push(`/admin/properties/edit/${p.id}`) }}
              className="p-2 rounded-xl bg-white/90 backdrop-blur-sm text-slate-700 hover:text-indigo-600 shadow-sm transition-colors"
            >
              <Edit2 size={13} />
            </button>
          </div>
        )}
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
