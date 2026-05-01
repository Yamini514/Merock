import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  SlidersHorizontal, LayoutGrid, List, X, ChevronDown, MapPin,
  Search, ArrowUpDown, SortAsc, Building2
} from 'lucide-react'
import { USER_PROPERTIES, PROPERTY_LOCATIONS, USER_PROPERTY_TYPES } from '../../mock-data/userProperties'
import PropertyCard from '../components/PropertyCard'
import { cn } from '../../utils/cn'

const SORT_OPTIONS = [
  { label: 'Newest First',    value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Most Viewed',     value: 'views' },
]

const PRICE_RANGES = [
  { label: 'Any',              min: 0,        max: Infinity },
  { label: 'Under ₹50L',      min: 0,        max: 5000000 },
  { label: '₹50L – ₹1Cr',    min: 5000000,  max: 10000000 },
  { label: '₹1Cr – ₹2Cr',    min: 10000000, max: 20000000 },
  { label: '₹2Cr – ₹5Cr',    min: 20000000, max: 50000000 },
  { label: 'Above ₹5Cr',      min: 50000000, max: Infinity },
]

const BEDROOM_OPTIONS = ['Any', '1', '2', '3', '4', '5+']

export default function ListingsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [view, setView] = useState('grid')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sort, setSort] = useState('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const [page, setPage] = useState(1)
  const PER_PAGE = 9

  const [filters, setFilters] = useState({
    types: searchParams.get('type') ? [searchParams.get('type')] : [],
    priceRange: 0,
    bedrooms: 'Any',
    locations: searchParams.get('city') ? [searchParams.get('city')] : [],
  })

  const [searchQ, setSearchQ] = useState(searchParams.get('q') || '')

  useEffect(() => {
    setPage(1)
  }, [filters, sort])

  function toggleType(type) {
    setFilters(p => ({
      ...p,
      types: p.types.includes(type) ? p.types.filter(t => t !== type) : [...p.types, type],
    }))
  }

  function toggleLocation(loc) {
    setFilters(p => ({
      ...p,
      locations: p.locations.includes(loc) ? p.locations.filter(l => l !== loc) : [...p.locations, loc],
    }))
  }

  function clearFilters() {
    setFilters({ types: [], priceRange: 0, bedrooms: 'Any', locations: [] })
    setSearchQ('')
  }

  const hasFilters = filters.types.length > 0 || filters.priceRange > 0 || filters.bedrooms !== 'Any' || filters.locations.length > 0 || searchQ

  const filtered = useMemo(() => {
    const range = PRICE_RANGES[filters.priceRange]
    return USER_PROPERTIES.filter(p => {
      if (filters.types.length && !filters.types.includes(p.type)) return false
      if (p.price < range.min || p.price > range.max) return false
      if (filters.bedrooms !== 'Any') {
        const beds = parseInt(filters.bedrooms)
        if (filters.bedrooms === '5+' ? p.bedrooms < 5 : p.bedrooms !== beds) return false
      }
      if (filters.locations.length && !filters.locations.some(l => p.location.includes(l))) return false
      if (searchQ && !p.title.toLowerCase().includes(searchQ.toLowerCase()) && !p.location.toLowerCase().includes(searchQ.toLowerCase())) return false
      return true
    })
  }, [filters, searchQ])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price
      if (sort === 'price_desc') return b.price - a.price
      if (sort === 'views') return (b.views || 0) - (a.views || 0)
      return new Date(b.postedDate) - new Date(a.postedDate)
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
            onChange={e => setSearchQ(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Property Type</label>
        <div className="space-y-2">
          {USER_PROPERTY_TYPES.map(type => (
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
          {PRICE_RANGES.map((range, i) => (
            <button
              key={range.label}
              onClick={() => setFilters(p => ({ ...p, priceRange: i }))}
              className={cn(
                'w-full text-left px-3 py-2 rounded-xl text-sm transition-all',
                filters.priceRange === i
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
          {BEDROOM_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setFilters(p => ({ ...p, bedrooms: opt }))}
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
          {PROPERTY_LOCATIONS.map(loc => (
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
            {filters.types.length === 1 ? `${filters.types[0]}s` : 'All Properties'}
            {filters.locations.length === 1 && ` in ${filters.locations[0]}`}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {sorted.length} {sorted.length === 1 ? 'property' : 'properties'} found
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar – desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-bold text-slate-800">Filters</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-indigo-600 hover:underline font-medium">Clear all</button>
                )}
              </div>
              {Sidebar}
            </div>
          </aside>

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
                    {filters.types.length + filters.locations.length + (filters.priceRange > 0 ? 1 : 0) + (filters.bedrooms !== 'Any' ? 1 : 0)}
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
                          onClick={() => { setSort(opt.value); setSortOpen(false) }}
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
                {filters.priceRange > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">
                    {PRICE_RANGES[filters.priceRange].label}
                    <button onClick={() => setFilters(p => ({ ...p, priceRange: 0 }))}><X className="w-3 h-3" /></button>
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
            {paged.length === 0 ? (
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
                    onClick={() => navigate(`/property/${p.id}`)}
                    className="group bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex"
                  >
                    <div className="w-48 sm:w-64 shrink-0 overflow-hidden relative">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      {p.featured && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded-lg">Featured</span>
                      )}
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{p.type}</span>
                          <h3 className="text-slate-900 font-semibold text-base mt-1.5 group-hover:text-indigo-700 transition-colors">{p.title}</h3>
                          <p className="flex items-center gap-1 text-slate-500 text-xs mt-1"><MapPin className="w-3 h-3 text-indigo-400" />{p.location}</p>
                        </div>
                        <p className="text-xl font-bold text-indigo-700 shrink-0">
                          {p.price >= 10000000 ? `₹${(p.price / 10000000).toFixed(1)} Cr` : `₹${(p.price / 100000).toFixed(0)} L`}
                        </p>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed mt-2 line-clamp-2">{p.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
                        {p.bedrooms > 0 && <span>{p.bedrooms} Beds</span>}
                        {p.bathrooms > 0 && <span>{p.bathrooms} Baths</span>}
                        <span>{p.area} sqft</span>
                        <span className="text-slate-400">·</span>
                        <span>{p.furnishing}</span>
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

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-2xl overflow-y-auto animate-slide-in-left">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <p className="font-bold text-slate-900">Filters</p>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {Sidebar}
            </div>
            <div className="p-5 border-t border-slate-100 sticky bottom-0 bg-white">
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
              >
                Show {sorted.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
