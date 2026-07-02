'use client'

import { Suspense, useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams, usePathname, redirect } from 'next/navigation'
import {
  ArrowLeft, Heart, Share2, BedDouble, Bath, Maximize2, Car,
  MapPin, BadgeCheck, Star, Phone, ChevronLeft, ChevronRight,
  CheckCircle, Eye, Calendar, Layers, Compass, Zap, Home, X
} from 'lucide-react'
import { USER_PROPERTIES } from '../../../../mock-data/userProperties'
import { useShortlist } from '../../../../hooks/useShortlist'
import { useAuth } from '../../../../context/AuthContext'
import PropertyCard from '../../../../user/components/PropertyCard'
import EnquiryModal from '../../../../user/components/EnquiryModal'
import { cn } from '../../../../utils/cn'

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`
  if (price >= 100000) return `₹${(price / 100000).toFixed(0)} L`
  return `₹${price.toLocaleString('en-IN')}`
}

const ICON_MAP = {
  'Floor':       Layers,
  'Furnishing':  Home,
  'Facing':      Compass,
  'Age':         Calendar,
  'Parking':     Car,
}

export default function PropertyDetailPage() {
  return (
    <Suspense fallback={null}>
      <PropertyDetailContent />
    </Suspense>
  )
}

function PropertyDetailContent() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { user } = useAuth()
  const { isShortlisted, toggle } = useShortlist()
  const [activeImg, setActiveImg] = useState(0)
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [shareMsg, setShareMsg] = useState(false)

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) localStorage.setItem('merock-ref', ref)
  }, [searchParams])

  const property = USER_PROPERTIES.find(p => p.id === id)
  if (!property) redirect('/properties')

  function requireAuth(action) {
    if (!user) {
      const search = searchParams.toString()
      router.push(`/login?redirect=${encodeURIComponent(pathname + (search ? `?${search}` : ''))}`)
      return
    }
    action()
  }

  const shortlisted = isShortlisted(property.id)
  const similar = USER_PROPERTIES.filter(p => p.type === property.type && p.id !== property.id).slice(0, 3)

  const details = [
    { label: 'Floor',      value: property.floor },
    { label: 'Furnishing', value: property.furnishing },
    { label: 'Facing',     value: property.facing },
    { label: 'Age',        value: property.age },
    { label: 'Parking',    value: `${property.parking} Slot${property.parking !== 1 ? 's' : ''}` },
  ]

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href).catch(() => {})
    setShareMsg(true)
    setTimeout(() => setShareMsg(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Back + Actions */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to listings
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="relative flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:block">Share</span>
              {shareMsg && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-slate-800 text-white px-2 py-1 rounded-lg whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>
            <button
              onClick={() => requireAuth(() => toggle(property.id))}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 border rounded-xl text-sm font-medium transition-all',
                shortlisted
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-500'
              )}
            >
              <Heart className={cn('w-4 h-4', shortlisted && 'fill-current')} />
              <span className="hidden sm:block">{shortlisted ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-5">

            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
              {/* Main image */}
              <div className="relative h-80 sm:h-[420px] overflow-hidden">
                <img
                  key={activeImg}
                  src={property.images[activeImg]}
                  alt={property.title}
                  className="w-full h-full object-cover animate-fade-in"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  {property.featured && (
                    <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-sm">Featured</span>
                  )}
                  {property.verified && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm">
                      <BadgeCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>

                {/* Navigation arrows */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg(i => (i - 1 + property.images.length) % property.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <button
                      onClick={() => setActiveImg(i => (i + 1) % property.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-700" />
                    </button>
                  </>
                )}

                {/* Views + count */}
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-medium">
                    <Eye className="w-3.5 h-3.5" /> {property.views} views
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-medium">
                    {activeImg + 1} / {property.images.length}
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 p-3 bg-slate-50 border-t border-slate-100">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      'w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0',
                      activeImg === i ? 'border-indigo-500 scale-105 shadow-md' : 'border-transparent hover:border-slate-300'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Title + Location */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{property.type}</span>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">{property.title}</h1>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1.5">
                    <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                    {property.location}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-700">{formatPrice(property.price)}</p>
                  {property.type === 'Apartment' && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      ₹{Math.round(property.price / property.area).toLocaleString('en-IN')} / sqft
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">Posted {property.postedDate}</p>
                </div>
              </div>

              {/* Specs row */}
              <div className="flex flex-wrap items-center gap-5 mt-5 pt-5 border-t border-slate-100">
                {property.bedrooms > 0 && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <BedDouble className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{property.bedrooms}</p>
                      <p className="text-xs text-slate-400">Bedrooms</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                    <Bath className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{property.bathrooms}</p>
                    <p className="text-xs text-slate-400">Bathrooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Maximize2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{property.area.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">sqft</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Car className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{property.parking}</p>
                    <p className="text-xs text-slate-400">Parking</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-slate-900 mb-3">About This Property</h2>
              <p className="text-slate-600 text-sm leading-relaxed">{property.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
                {details.map(({ label, value }) => {
                  const Icon = ICON_MAP[label] || CheckCircle
                  return (
                    <div key={label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-1">{label}</p>
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <p className="text-sm font-semibold text-slate-700">{value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-slate-900 mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map(a => (
                  <span
                    key={a}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-100"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500" /> {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Nearby */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-slate-900 mb-4">Nearby Places</h2>
              <div className="grid grid-cols-2 gap-2">
                {property.nearBy.map(n => (
                  <div key={n} className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-sm text-slate-700 font-medium">{n}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-slate-900 mb-4">Location Map</h2>
              <div className="h-52 bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
                <MapPin className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-500 font-medium">{property.location}</p>
                <p className="text-xs text-slate-400 mt-1">Map view would be embedded here</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">
            {/* Price Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-24">
              <div className="mb-4">
                <p className="text-3xl font-bold text-indigo-700">{formatPrice(property.price)}</p>
                {property.type === 'Apartment' && (
                  <p className="text-xs text-slate-400 mt-1">₹{Math.round(property.price / property.area).toLocaleString('en-IN')}/sqft</p>
                )}
              </div>

              {/* Agent card */}
              <div className="bg-slate-50 rounded-xl p-4 mb-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Listed by</p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                    {property.agent.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{property.agent.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn('w-3 h-3', i < Math.floor(property.agent.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">{property.agent.rating} · {property.agent.deals} deals</span>
                    </div>
                  </div>
                </div>
                <a
                  href={`tel:${property.agent.phone}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Phone className="w-4 h-4" /> {property.agent.phone}
                </a>
              </div>

              <button
                onClick={() => requireAuth(() => setEnquiryOpen(true))}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 mb-3"
              >
                Send Enquiry
              </button>

              <button
                onClick={() => requireAuth(() => toggle(property.id))}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all border',
                  shortlisted
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600'
                )}
              >
                <Heart className={cn('w-4 h-4', shortlisted && 'fill-current')} />
                {shortlisted ? 'Saved to Shortlist' : 'Add to Shortlist'}
              </button>

              <p className="text-center text-xs text-slate-400 mt-4">
                Response time: Usually within 2 hours
              </p>
            </div>

            {/* Tags */}
            {property.tags?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {property.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-xl">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Properties */}
        {similar.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">Similar Properties</h2>
              <button
                onClick={() => router.push(`/properties?type=${property.type}`)}
                className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                View all →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        )}
      </div>

      {enquiryOpen && (
        <EnquiryModal property={property} onClose={() => setEnquiryOpen(false)} />
      )}
    </div>
  )
}
