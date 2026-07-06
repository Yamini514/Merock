'use client'

import { Suspense, useState, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  SlidersHorizontal, LayoutGrid, List, X, ChevronDown, MapPin,
  Search, ArrowUpDown, Building2, Share2
} from 'lucide-react'
import { listPublicProperties } from '../../../api/properties'
import { useApi } from '../../../hooks/useApi'
import PropertyCard from '../../../user/components/PropertyCard'
import FilterSidebar from '../../../components/FilterSidebar'
import { deriveOptions, deriveBedroomOptions, deriveAvailableRanges } from '../../../utils/deriveOptions'
import { cn } from '../../../utils/cn'

const SORT_OPTIONS = [
  { label: 'Newest First',    value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
]

// Bucket boundaries/labels are a fixed design choice, but which buckets
// are shown is data-driven — see availableRanges below.
const PRICE_RANGES = [
  { label: 'Any',              min: 0,        max: Infinity },
  { label: 'Under ₹50L',      min: 0,        max: 5000000 },
  { label: '₹50L – ₹1Cr',    min: 5000000,  max: 10000000 },
  { label: '₹1Cr – ₹2Cr',    min: 10000000, max: 20000000 },
  { label: '₹2Cr – ₹5Cr',    min: 20000000, max: 50000000 },
  { label: 'Above ₹5Cr',      min: 50000000, max: Infinity },
]

export default function ListingsPage() {
  return (
    <Suspense fallback={null}>
      <ListingsContent />
    </Suspense>
  )
}

function ListingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [view, setView] = useState('grid')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sort, setSort] = useState('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const [page, setPage] = useState(1)
  const PER_PAGE = 9

  // A shared shortlist link (?ids=1,2,3) narrows the catalogue to those
  // exact listings — this is what the agent "Share Shortlist" copies.
  const sharedIds = useMemo(() => {
    const raw = searchParams.get('ids')
    return raw ? raw.split(',').map(Number).filter(Boolean) : null
  }, [searchParams])

  const fetcher = useCallback(() => listPublicProperties({ page_size: 300 }), [])
  const { data: propsData, loading } = useApi(fetcher, [])
  const allProperties = useMemo(() => propsData?.data ?? [], [propsData])

  // Filter options derive from the live catalogue so they never go stale.
  const locations = useMemo(() => deriveOptions(allProperties, 'location'), [allProperties])
  const propertyTypes = useMemo(() => deriveOptions(allProperties, 'property_type'), [allProperties])
  const bedroomOptions = useMemo(() => deriveBedroomOptions(allProperties), [allProperties])
  const availableRanges = useMemo(() => deriveAvailableRanges(PRICE_RANGES, allProperties), [allProperties])

  const [filters, setFilters] = useState({
    types: searchParams.get('type') ? [searchParams.get('type')] : [],
    priceRange: 'Any',
    bedrooms: 'Any',
    locations: searchParams.get('city') ? [searchParams.get('city')] : [],
  })

  const [searchQ, setSearchQ] = useState(searchParams.get('q') || '')

  function resetPage() { setPage(1) }

  function toggleType(type) {
    resetPage()
    setFilters(p => ({
      ...p,
      types: p.types.includes(type) ? p.types.filter(t => t !== type) : [...p.types, type],
    }))
  }

  function toggleLocation(loc) {
    resetPage()
    setFilters(p => ({
      ...p,
      locations: p.locations.includes(loc) ? p.locations.filter(l => l !== loc) : [...p.locations, loc],
    }))
  }

  function clearFilters() {
    resetPage()
    setFilters({ types: [], priceRange: 'Any', bedrooms: 'Any', locations: [] })
    setSearchQ('')
  }

  const hasFilters = filters.types.length > 0 || filters.priceRange !== 'Any' || filters.bedrooms !== 'Any' || filters.locations.length > 0 || searchQ

  const filtered = useMemo(() => {
    const range = PRICE_RANGES.find(r => r.label === filters.priceRange) ?? PRICE_RANGES[0]
    return allProperties.filter(p => {
      if (sharedIds && !sharedIds.includes(p.id)) return false
      if (filters.types.length && !filters.types.includes(p.property_type)) return false
      const price = p.price || 0
      if (price < range.min || price > range.max) return false
      if (filters.bedrooms !== 'Any') {
        const beds = parseInt(filters.bedrooms)
        if (filters.bedrooms === '5+' ? (p.bedrooms || 0) < 5 : p.bedrooms !== beds) return false
      }
      if (filters.locations.length && !filters.locations.some(l => (p.location || '').includes(l))) return false
      if (searchQ && !(p.title || '').toLowerCase().includes(searchQ.toLowerCase()) && !(p.location || '').toLowerCase().includes(searchQ.toLowerCase())) return false
      return true
    })
  }, [allProperties, sharedIds, filters, searchQ])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sort === 'price_asc') return (a.price || 0) - (b.price || 0)
      if (sort === 'price_desc') return (b.price || 0) - (a.price || 0)
      return new Date(b.created_at) - new Date(a.created_at)
    })
  }, [filtered, sort])

  const totalPages = Math.ceil(sorted.length / PER_PAGE)
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const Sidebar = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Keyword, location..."
            value={searchQ}
            onChange={e => { resetPage(); setSearchQ(e.target.value) }}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Property Type</label>
        <div className="space-y-2">
          {propertyTypes.length === 0 && <p className="text-xs text-slate-400">No types yet.</p>}
          {propertyTypes.map(type => (
            <label key={type} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.types.includes(type)}
                onChange={() => toggleType(type)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30"
              />
              <span className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Price Range</label>
        <div className="space-y-1.5">
          {availableRanges.map(range => (
            <button
              key={range.label}
              onClick={() => { resetPage(); setFilters(p => ({ ...p, priceRange: range.label })) }}
              className={cn(
                'w-full text-left px-3 py-2 rounded-xl text-sm transition-all',
                filters.priceRange === range.label
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Bedrooms</label>
        <div className="grid grid-cols-3 gap-2">
          {bedroomOptions.map(opt => (
            <button
              key={opt}
              onClick={() => { resetPage(); setFilters(p => ({ ...p, bedrooms: opt })) }}
              className={cn(
                'py-2 rounded-xl text-sm font-medium transition-all border',
                filters.bedrooms === opt
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Location</label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {locations.length === 0 && <p className="text-xs text-slate-400">No locations yet.</p>}
          {locations.map(loc => (
            <label key={loc} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.locations.includes(loc)}
                onChange={() => toggleLocation(loc)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30"
              />
              <span className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors">{loc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-rose-200 text-rose-600 rounded-xl text-sm font-semibold hover:bg-rose-50 transition-colors"
        >
          <X className="w-4 h-4" /> Clear All Filters
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {sharedIds ? 'Shared Shortlist' : filters.types.length === 1 ? `${filters.types[0]}s` : 'All Properties'}
            {filters.locations.length === 1 && ` in ${filters.locations[0]}`}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {sorted.length} {sorted.length === 1 ? 'property' : 'properties'} found
          </p>
          {sharedIds && (
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl">
              <Share2 className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs text-indigo-700 font-medium">An agent shared this hand-picked selection with you.</span>
              <button onClick={() => router.push('/properties')} className="text-xs text-indigo-600 font-bold hover:underline">View all instead</button>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          <FilterSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            hasFilters={hasFilters}
            onClear={clearFilters}
            resultsLabel={`Show ${sorted.length} Results`}
          >
            {Sidebar}
          </FilterSidebar>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-5 bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-sm">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 text-sm text-slate-600 font-medium hover:text-indigo-600 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasFilters && (
                  <span className="w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {filters.types.length + filters.locations.length + (filters.priceRange !== 'Any' ? 1 : 0) + (filters.bedrooms !== 'Any' ? 1 : 0)}
                  </span>
                )}
              </button>

              <span className="hidden lg:block text-sm text-slate-500">
                Showing <strong className="text-slate-800">{paged.length}</strong> of <strong className="text-slate-800">{sorted.length}</strong> results
              </span>

              <div className="flex items-center gap-2 ml-auto">
                {/* Sort */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(v => !v)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span className="hidden sm:block">{SORT_OPTIONS.find(s => s.value === sort)?.label}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 top-11 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 py-1.5 animate-slide-down">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { resetPage(); setSort(opt.value); setSortOpen(false) }}
                          className={cn(
                            'w-full text-left px-4 py-2.5 text-sm transition-colors',
                            sort === opt.value ? 'text-indigo-600 font-semibold bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View toggle */}
                <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setView('grid')}
                    className={cn('p-2.5 transition-colors', view === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={cn('p-2.5 transition-colors', view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600')}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.types.map(t => (
                  <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                    {t}
                    <button onClick={() => toggleType(t)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {filters.priceRange !== 'Any' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">
                    {filters.priceRange}
                    <button onClick={() => setFilters(p => ({ ...p, priceRange: 'Any' }))}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {filters.bedrooms !== 'Any' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                    {filters.bedrooms} Beds
                    <button onClick={() => setFilters(p => ({ ...p, bedrooms: 'Any' }))}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {filters.locations.map(l => (
                  <span key={l} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                    <MapPin className="w-3 h-3" />{l}
                    <button onClick={() => toggleLocation(l)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}

            {/* Results */}
            {loading ? (
              <div className="py-24 flex justify-center">
                <span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : paged.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No properties found</h3>
                <p className="text-slate-400 text-sm mb-6">Try adjusting your filters or search query</p>
                <button onClick={clearFilters} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paged.map(p => <PropertyCard key={p.id} property={p} />)}
              </div>
            ) : (
              <div className="space-y-4">
                {paged.map(p => (
                  <div
                    key={p.id}
                    onClick={() => router.push(`/property/${p.id}`)}
                    className="group bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex"
                  >
                    <div className="w-48 sm:w-64 shrink-0 overflow-hidden relative">
                      <img
                        src={p.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{p.property_type}</span>
                          <h3 className="text-slate-900 font-semibold text-base mt-1.5 group-hover:text-indigo-700 transition-colors">{p.title}</h3>
                          <p className="flex items-center gap-1 text-slate-500 text-xs mt-1"><MapPin className="w-3 h-3 text-indigo-400" />{p.location}</p>
                        </div>
                        <p className="text-xl font-bold text-indigo-700 shrink-0">
                          {!p.price ? 'On request' : p.price >= 10000000 ? `₹${(p.price / 10000000).toFixed(1)} Cr` : `₹${(p.price / 100000).toFixed(0)} L`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
                        {p.bedrooms > 0 && <span>{p.bedrooms} Beds</span>}
                        {p.bathrooms > 0 && <span>{p.bathrooms} Baths</span>}
                        {p.area > 0 && <span>{p.area} sqft</span>}
                        {p.furnishing && (
                          <>
                            <span className="text-slate-400">·</span>
                            <span>{p.furnishing}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={cn(
                      'w-10 h-10 rounded-xl text-sm font-semibold transition-all',
                      page === n ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
