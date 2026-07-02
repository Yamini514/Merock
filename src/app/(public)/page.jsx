'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, MapPin, Building2, Home, Briefcase, Trees, Star,
  ArrowRight, CheckCircle, Phone, TrendingUp, Shield, Award
} from 'lucide-react'
import { USER_PROPERTIES } from '../../mock-data/userProperties'
import PropertyCard from '../../user/components/PropertyCard'
import { cn } from '../../utils/cn'

const CATEGORIES = [
  { label: 'Apartments',  icon: Building2, type: 'Apartment',  count: '3.2K', color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
  { label: 'Villas',      icon: Home,      type: 'Villa',       count: '840',  color: 'bg-violet-50 text-violet-600 hover:bg-violet-100' },
  { label: 'Studios',     icon: Building2, type: 'Studio',      count: '1.1K', color: 'bg-pink-50 text-pink-600 hover:bg-pink-100' },
  { label: 'Penthouses',  icon: Star,      type: 'Penthouse',   count: '220',  color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
  { label: 'Commercial',  icon: Briefcase, type: 'Commercial',  count: '560',  color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
  { label: 'Plots',       icon: Trees,     type: 'Plot',        count: '920',  color: 'bg-teal-50 text-teal-600 hover:bg-teal-100' },
]

const POPULAR_CITIES = [
  { name: 'Banjara Hills',  count: '420',  img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=70' },
  { name: 'Jubilee Hills',  count: '310',  img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=70' },
  { name: 'Gachibowli',     count: '580',  img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=70' },
  { name: 'HITEC City',     count: '390',  img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=70' },
]

const WHY_US = [
  { icon: Shield,   title: 'Verified Listings',   desc: 'Every property is manually verified by our experts before it goes live.' },
  { icon: Award,    title: 'Expert Agents',        desc: '500+ certified agents with an average of 4.8★ rating from clients.' },
  { icon: TrendingUp, title: 'Best Price Match',  desc: 'Our algorithm ensures you never overpay. Price history & market data included.' },
]

const PROPERTY_TYPES = ['Buy', 'Rent', 'Commercial']

export default function HomePage() {
  const router = useRouter()
  const [searchTab, setSearchTab] = useState('Buy')
  const [searchQuery, setSearchQuery] = useState('')

  const featured = USER_PROPERTIES.filter(p => p.featured).slice(0, 4)

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (searchTab !== 'Buy') params.set('mode', searchTab.toLowerCase())
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1600&q=85"
            alt="Luxury home"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600/30 border border-indigo-400/40 rounded-full mb-6 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-indigo-200 text-xs font-medium">10,000+ verified listings across 25 cities</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
              Find the Home<br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                You've Always
              </span><br />
              Dreamed Of
            </h1>

            <p className="text-slate-300 text-lg mb-10 leading-relaxed max-w-lg">
              India's most trusted real estate platform with verified listings, expert guidance, and transparent pricing.
            </p>

            {/* Search Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-2 max-w-xl">
              {/* Tabs */}
              <div className="flex gap-1 mb-2 px-1 pt-1">
                {PROPERTY_TYPES.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSearchTab(tab)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                      searchTab === tab
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSearch} className="flex items-center gap-2 p-2">
                <div className="flex-1 flex items-center gap-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by location, project, or keyword..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 py-3 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </form>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-5">
              <span className="text-slate-400 text-xs font-medium">Trending:</span>
              {['Banjara Hills', 'HITEC City', '3BHK Apartments', 'Luxury Villas'].map(tag => (
                <button
                  key={tag}
                  onClick={() => { setSearchQuery(tag); router.push(`/properties?q=${tag}`) }}
                  className="text-xs text-slate-300 hover:text-white border border-slate-600 hover:border-indigo-400 px-3 py-1 rounded-full transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-wrap items-center gap-8">
              {[
                { value: '10,000+', label: 'Active Listings' },
                { value: '500+',    label: 'Verified Agents' },
                { value: '25+',     label: 'Cities Covered' },
                { value: '98%',     label: 'Client Satisfaction' },
              ].map(stat => (
                <div key={stat.label} className="text-center sm:text-left">
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-slate-400 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Property Categories ── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-indigo-600 text-sm font-semibold mb-1">Browse by Type</p>
            <h2 className="text-2xl font-bold text-slate-900">Find Your Property Type</h2>
          </div>
          <button
            onClick={() => router.push('/properties')}
            className="hidden sm:flex items-center gap-1.5 text-indigo-600 text-sm font-semibold hover:text-indigo-700 transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            return (
              <button
                key={cat.label}
                onClick={() => router.push(`/properties?type=${cat.type}`)}
                className={cn(
                  'group flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-200 border border-transparent hover:border-current/10 hover:-translate-y-0.5 hover:shadow-lg',
                  cat.color
                )}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{cat.label}</p>
                  <p className="text-xs opacity-70 mt-0.5">{cat.count} listings</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-indigo-600 text-sm font-semibold mb-1">Handpicked for You</p>
              <h2 className="text-2xl font-bold text-slate-900">Featured Properties</h2>
              <p className="text-slate-500 text-sm mt-1">Premium verified listings with the best value</p>
            </div>
            <button
              onClick={() => router.push('/properties?featured=true')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 border border-indigo-200 text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
            >
              See All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <button
              onClick={() => router.push('/properties')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
            >
              View All Properties <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Popular Locations ── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-indigo-600 text-sm font-semibold mb-1">Top Neighbourhoods</p>
            <h2 className="text-2xl font-bold text-slate-900">Popular Locations</h2>
          </div>
          <button
            onClick={() => router.push('/properties')}
            className="hidden sm:flex items-center gap-1.5 text-indigo-600 text-sm font-semibold hover:text-indigo-700 transition-colors"
          >
            Explore All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_CITIES.map(city => (
            <button
              key={city.name}
              onClick={() => router.push(`/properties?city=${city.name.replace(' ', '+')}`)}
              className="group relative h-52 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <img
                src={city.img}
                alt={city.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 text-left">
                <p className="text-white font-bold text-sm">{city.name}</p>
                <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {city.count} properties
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-16 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-indigo-400 text-sm font-semibold mb-2">Why Merock?</p>
            <h2 className="text-3xl font-bold text-white">The Smart Way to Find Property</h2>
            <p className="text-slate-400 mt-3 max-w-lg mx-auto text-sm leading-relaxed">
              Thousands of happy homeowners trust Merock for a transparent, expert-guided property journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHY_US.map(item => {
              const Icon = item.icon
              return (
                <div key={item.title} className="group bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition-all duration-200">
                  <div className="w-12 h-12 bg-indigo-600/30 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-indigo-600/50 transition-colors">
                    <Icon className="w-6 h-6 text-indigo-300" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/properties')}
              className="flex items-center gap-2 px-7 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/40"
            >
              Browse Properties <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="tel:18001234567"
              className="flex items-center gap-2 px-7 py-3.5 bg-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20"
            >
              <Phone className="w-4 h-4" /> Talk to an Expert
            </a>
          </div>
        </div>
      </section>

      {/* ── Recent Listings ── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-indigo-600 text-sm font-semibold mb-1">Just Added</p>
            <h2 className="text-2xl font-bold text-slate-900">Recently Listed</h2>
          </div>
          <button
            onClick={() => router.push('/properties')}
            className="flex items-center gap-1.5 text-indigo-600 text-sm font-semibold hover:text-indigo-700"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {USER_PROPERTIES.slice(4, 8).map(p => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-white rounded-3xl p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Building2 className="w-7 h-7 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Ready to Find Your Dream Home?
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-7 max-w-md mx-auto">
              Join 50,000+ homebuyers who found their perfect property on Merock. Start your search today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => router.push('/properties')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
              >
                Search Properties <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push('/app/dashboard')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                My Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
