'use client'

import { useState, useCallback } from 'react'
import { Heart, Share2, MapPin, Bed, Bath, Maximize2, SlidersHorizontal, X } from 'lucide-react'
import PageHeader from '../../../components/PageHeader'
import Badge from '../../../components/Badge'
import Modal from '../../../components/Modal'
import FormInput from '../../../components/FormInput'
import Select from '../../../components/Select'
import CheckboxGroup from '../../../components/CheckboxGroup'
import Button from '../../../components/Button'
import Avatar from '../../../components/Avatar'
import Spinner from '../../../components/Spinner'
import ErrorBanner from '../../../components/ErrorBanner'
import { listProperties } from '../../../api/properties'
import { listCustomers } from '../../../api/customers'
import { useApi } from '../../../hooks/useApi'
import { formatCurrency } from '../../../utils/formatters'
import { deriveOptions, deriveAvailableRanges } from '../../../utils/deriveOptions'
import FilterSidebar from '../../../components/FilterSidebar'
import { cn } from '../../../utils/cn'

const PRICE_RANGES = [
  { label: 'Any Price', min: 0, max: Infinity },
  { label: 'Under ₹50L', min: 0, max: 5000000 },
  { label: '₹50L – ₹1Cr', min: 5000000, max: 10000000 },
  { label: '₹1Cr – ₹3Cr', min: 10000000, max: 30000000 },
  { label: 'Above ₹3Cr', min: 30000000, max: Infinity },
]

export default function Agents() {
  const [filters, setFilters]     = useState({ types: [], priceRange: 'Any Price', minBed: '', location: '' })
  const [shortlist, setShortlist] = useState([])
  const [shareModal, setShareModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState('')
  const [copied, setCopied]       = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const propsFetcher = useCallback(() => listProperties({ page_size: 300 }), [])
  const { data: propsData, loading, error } = useApi(propsFetcher, [])
  const properties = propsData?.data ?? []

  // Options derive from the live catalogue so a type/location/price band/
  // bedroom count with zero listings never shows up as a pickable-but-dead
  // filter.
  const propertyTypes = deriveOptions(properties, 'property_type')
  const locations = deriveOptions(properties, 'location')
  const availableRanges = deriveAvailableRanges(PRICE_RANGES, properties, 'Any Price')
  const maxBedrooms = properties.reduce((max, p) => Math.max(max, p.bedrooms || 0), 0)
  const minBedOptions = [
    { value: '', label: 'Any' },
    ...Array.from({ length: maxBedrooms }, (_, i) => ({ value: String(i + 1), label: `${i + 1}+ BHK` })),
  ]

  const clientsFetcher = useCallback(() => listCustomers({ page_size: 300 }), [])
  const { data: clientsData } = useApi(clientsFetcher, [])
  const clients = clientsData?.data ?? []

  function setFilter(k, v) { setFilters(f => ({ ...f, [k]: v })) }

  const priceFilter = PRICE_RANGES.find(r => r.label === filters.priceRange) ?? PRICE_RANGES[0]
  const filtered = properties.filter(p => {
    if (filters.types.length && !filters.types.includes(p.property_type)) return false
    if (p.price < priceFilter.min || p.price >= priceFilter.max) return false
    if (filters.minBed && p.bedrooms < Number(filters.minBed)) return false
    if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) return false
    return true
  })

  const shortlisted = properties.filter(p => shortlist.includes(p.id))
  const hasFilters = filters.types.length || filters.priceRange !== 'Any Price' || filters.minBed || filters.location

  function toggleShortlist(id) {
    setShortlist(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  // Real share link: the public catalogue supports ?ids= and renders
  // exactly this hand-picked selection to the client.
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/properties?ids=${shortlist.join(',')}`
    : ''

  function handleCopy() {
    navigator.clipboard?.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Property Search"
        subtitle="Filter, shortlist and share properties with clients"
        breadcrumb={['Home', 'Agents']}
        actions={
          shortlisted.length > 0 && (
            <Button onClick={() => setShareModal(true)} className="w-full sm:w-auto justify-center">
              <Share2 size={14} /> Share Shortlist ({shortlisted.length})
            </Button>
          )
        }
      />

      <ErrorBanner message={error?.message} />

      <div className="flex flex-col lg:flex-row gap-5">
        <FilterSidebar
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          hasFilters={hasFilters}
          onClear={() => setFilters({ types: [], priceRange: 'Any Price', minBed: '', location: '' })}
          resultsLabel={`Show ${filtered.length} Results`}
        >
          <div className="flex flex-col gap-5">
            <CheckboxGroup label="Property Type" options={propertyTypes} value={filters.types} onChange={v => setFilter('types', v)} columns={1} />
            <Select label="Price Range" value={filters.priceRange} onChange={e => setFilter('priceRange', e.target.value)}
              options={availableRanges.map(r => ({ value: r.label, label: r.label }))} />
            <Select label="Min Bedrooms" value={filters.minBed} onChange={e => setFilter('minBed', e.target.value)}
              options={minBedOptions} />
            <div>
              <FormInput label="Location" list="agent-location-options" value={filters.location} onChange={e => setFilter('location', e.target.value)} placeholder="e.g. Banjara Hills" />
              <datalist id="agent-location-options">
                {locations.map(loc => <option key={loc} value={loc} />)}
              </datalist>
            </div>
          </div>
        </FilterSidebar>

        {/* Results */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm text-slate-600 font-medium hover:text-indigo-600 transition-colors bg-white border border-slate-200 rounded-xl px-3.5 py-2.5"
            >
              <SlidersHorizontal size={14} />
              Filters
              {hasFilters && (
                <span className="w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {filters.types.length + (filters.priceRange !== 'Any Price' ? 1 : 0) + (filters.minBed ? 1 : 0) + (filters.location ? 1 : 0)}
                </span>
              )}
            </button>
            <p className="hidden lg:block text-sm text-slate-500">
              <span className="font-bold text-slate-800">{filtered.length}</span> properties found
            </p>
            {shortlisted.length > 0 && (
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2 ml-auto lg:ml-0">
                <Heart size={13} className="text-indigo-600" fill="currentColor" />
                <span className="text-xs font-semibold text-indigo-700">{shortlisted.length} shortlisted</span>
              </div>
            )}
          </div>

          {loading ? (
            <Spinner />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-3 bg-white rounded-2xl border border-slate-200">
              <SlidersHorizontal size={32} />
              <p className="text-sm text-slate-400">No properties match your filters</p>
              <Button variant="ghost" size="sm" onClick={() => setFilters({ types: [], priceRange: 'Any Price', minBed: '', location: '' })}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map(p => (
                <AgentPropertyCard
                  key={p.id}
                  property={p}
                  shortlisted={shortlist.includes(p.id)}
                  onToggle={() => toggleShortlist(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share modal */}
      <Modal
        open={shareModal}
        onClose={() => setShareModal(false)}
        title="Share Shortlist"
        subtitle="Send this shortlist to a client via link"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShareModal(false)}>Cancel</Button>
            <Button onClick={handleCopy}>
              {copied ? '✓ Copied!' : 'Copy Link'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Select
            label="Select Client"
            value={selectedClient}
            onChange={e => setSelectedClient(e.target.value)}
            options={[{ value: '', label: 'Choose a client…' }, ...clients.map(c => ({ value: c.id, label: c.name }))]}
          />

          <div>
            <p className="text-xs font-medium text-slate-600 mb-2">Shortlisted Properties ({shortlisted.length})</p>
            <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
              {shortlisted.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <img src={p.image} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{p.title}</p>
                    <p className="text-xs text-slate-400">{formatCurrency(p.price)}</p>
                  </div>
                  <button onClick={() => toggleShortlist(p.id)} className="text-slate-300 hover:text-rose-400 transition-colors p-1">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-indigo-50 rounded-xl border border-indigo-200">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wide mb-1">Share Link</p>
              <p className="text-xs text-indigo-800 font-mono truncate">{shareUrl}</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function AgentPropertyCard({ property: p, shortlisted, onToggle }) {
  return (
    <div className={cn(
      'bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
      shortlisted ? 'border-indigo-300 ring-1 ring-indigo-200/80' : 'border-slate-200/80'
    )}>
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img src={p.image} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        <button
          onClick={onToggle}
          className={cn(
            'absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm',
            shortlisted ? 'bg-rose-500 text-white' : 'bg-white/90 backdrop-blur-sm text-slate-400 hover:text-rose-500'
          )}
        >
          <Heart size={15} fill={shortlisted ? 'currentColor' : 'none'} />
        </button>
        <div className="absolute bottom-3 left-3"><Badge status={p.status} dot /></div>
      </div>
      <div className="p-4">
        <p className="text-sm font-bold text-slate-800 truncate leading-snug">{p.title}</p>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1.5"><MapPin size={10} />{p.location}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
          {p.bedrooms > 0 && <span className="flex items-center gap-1"><Bed size={11} />{p.bedrooms}</span>}
          <span className="flex items-center gap-1"><Bath size={11} />{p.bathrooms}</span>
          <span className="flex items-center gap-1"><Maximize2 size={11} />{(p.area ?? 0).toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-slate-100">
          <span className="text-base font-bold text-indigo-600">{formatCurrency(p.price)}</span>
          {p.agent && (
            <div className="flex items-center gap-1.5">
              <Avatar name={p.agent} size="xs" />
              <span className="text-xs text-slate-400">{p.agent.split(' ')[0]}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
