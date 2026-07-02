'use client'

import { useState } from 'react'
import { Heart, Share2, MapPin, Bed, Bath, Maximize2, SlidersHorizontal, X, Star } from 'lucide-react'
import PageHeader from '../../../components/PageHeader'
import Card, { CardHeader } from '../../../components/Card'
import Badge from '../../../components/Badge'
import Modal from '../../../components/Modal'
import FormInput from '../../../components/FormInput'
import Select from '../../../components/Select'
import CheckboxGroup from '../../../components/CheckboxGroup'
import Button from '../../../components/Button'
import Avatar from '../../../components/Avatar'
import { PROPERTIES, PROPERTY_TYPES } from '../../../mock-data/properties'
import { CLIENTS } from '../../../mock-data/clients'
import { AGENTS_LIST } from '../../../mock-data/agents'
import { formatCurrency } from '../../../utils/formatters'
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

  function setFilter(k, v) { setFilters(f => ({ ...f, [k]: v })) }

  const priceFilter = PRICE_RANGES.find(r => r.label === filters.priceRange) ?? PRICE_RANGES[0]
  const filtered = PROPERTIES.filter(p => {
    if (filters.types.length && !filters.types.includes(p.type)) return false
    if (p.price < priceFilter.min || p.price >= priceFilter.max) return false
    if (filters.minBed && p.bedrooms < Number(filters.minBed)) return false
    if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) return false
    return true
  })

  const shortlisted = PROPERTIES.filter(p => shortlist.includes(p.id))
  const hasFilters = filters.types.length || filters.priceRange !== 'Any Price' || filters.minBed || filters.location

  function toggleShortlist(id) {
    setShortlist(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  function handleCopy() {
    navigator.clipboard?.writeText('https://merock.app/share/shortlist?token=abc123xyz')
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
            <Button onClick={() => setShareModal(true)}>
              <Share2 size={14} /> Share Shortlist ({shortlisted.length})
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Filter sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-indigo-600" />
                <span className="text-sm font-bold text-slate-800">Filters</span>
              </div>
              {hasFilters && (
                <button
                  onClick={() => setFilters({ types: [], priceRange: 'Any Price', minBed: '', location: '' })}
                  className="text-xs text-rose-500 font-medium hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-col gap-5">
              <CheckboxGroup label="Property Type" options={PROPERTY_TYPES} value={filters.types} onChange={v => setFilter('types', v)} columns={1} />
              <Select label="Price Range" value={filters.priceRange} onChange={e => setFilter('priceRange', e.target.value)}
                options={PRICE_RANGES.map(r => ({ value: r.label, label: r.label }))} />
              <Select label="Min Bedrooms" value={filters.minBed} onChange={e => setFilter('minBed', e.target.value)}
                options={[{ value: '', label: 'Any' }, { value: '1', label: '1+ BHK' }, { value: '2', label: '2+ BHK' }, { value: '3', label: '3+ BHK' }, { value: '4', label: '4+ BHK' }]} />
              <FormInput label="Location" value={filters.location} onChange={e => setFilter('location', e.target.value)} placeholder="e.g. Banjara Hills" />
            </div>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              <span className="font-bold text-slate-800">{filtered.length}</span> properties found
            </p>
            {shortlisted.length > 0 && (
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2">
                <Heart size={13} className="text-indigo-600" fill="currentColor" />
                <span className="text-xs font-semibold text-indigo-700">{shortlisted.length} shortlisted</span>
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
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
            options={[{ value: '', label: 'Choose a client…' }, ...CLIENTS.map(c => ({ value: c.id, label: c.name }))]}
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
              <p className="text-xs text-indigo-800 font-mono truncate">
                https://merock.app/share/shortlist?token=abc123
              </p>
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
          <span className="flex items-center gap-1"><Maximize2 size={11} />{p.area.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-slate-100">
          <span className="text-base font-bold text-indigo-600">{formatCurrency(p.price)}</span>
          <div className="flex items-center gap-1.5">
            <Avatar name={p.agent} size="xs" />
            <span className="text-xs text-slate-400">{p.agent.split(' ')[0]}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
