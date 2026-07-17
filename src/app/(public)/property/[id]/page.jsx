'use client'

import { Suspense, useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  ArrowLeft, Heart, Share2, BedDouble, Bath, Maximize2, Car,
  MapPin, BadgeCheck, Phone, ChevronLeft, ChevronRight,
  CheckCircle, Calendar, Layers, Compass, Home, ExternalLink, AlertCircle,
} from 'lucide-react'
import { getPublicProperty, listPublicProperties } from '../../../../api/properties'
import { useApi } from '../../../../hooks/useApi'
import { useShortlist } from '../../../../hooks/useShortlist'
import { useAuth } from '../../../../context/AuthContext'
import PropertyCard from '../../../../user/components/PropertyCard'
import EnquiryModal from '../../../../user/components/EnquiryModal'
import { formatDate } from '../../../../utils/formatters'
import { cn } from '../../../../utils/cn'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80'

function formatPrice(price) {
  if (!price) return 'Price on request'
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`
  if (price >= 100000) return `₹${(price / 100000).toFixed(0)} L`
  return `₹${price.toLocaleString('en-IN')}`
}

const ICON_MAP = {
  Floor:      Layers,
  Furnishing: Home,
  Facing:     Compass,
  Age:        Calendar,
  Parking:    Car,
  Possession: CheckCircle,
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
  const [autoPaused, setAutoPaused] = useState(false)

  // Remember a referral code carried in the link so any enquiry made later
  // in this browser is attributed to the referring member.
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) try { localStorage.setItem('merock-ref', ref) } catch { /* blocked */ }
  }, [searchParams])

  const fetcher = useCallback(() => getPublicProperty(id), [id])
  const { data: property, loading, error } = useApi(fetcher, [id])

  const similarFetcher = useCallback(
    () => property ? listPublicProperties({ property_type: property.property_type, page_size: 8 }) : Promise.resolve(null),
    [property]
  )
  const { data: similarData } = useApi(similarFetcher, [property?.id])
  const similar = (similarData?.data ?? []).filter(p => p.id !== property?.id).slice(0, 3)

  const images = useMemo(() => {
    const list = [...(property?.images ?? [])]
    if (property?.image && !list.includes(property.image)) list.unshift(property.image)
    return list.length ? list : [FALLBACK_IMG]
  }, [property])

  // Bulk-uploaded galleries autoscroll so visitors see every photo without
  // clicking through; hovering pauses it for a closer look.
  useEffect(() => {
    if (images.length <= 1 || autoPaused) return
    const t = setInterval(() => setActiveImg(i => (i + 1) % images.length), 4000)
    return () => clearInterval(t)
  }, [images.length, autoPaused])

  if (loading) return (
    <div className="min-h-screen bg-slate-50 pt-20 flex justify-center">
      <span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mt-20" />
    </div>
  )

  if (error || !property) return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-10 h-10 text-slate-300" />
        <p className="text-slate-500">{error?.message || 'This property is no longer available.'}</p>
        <button
          onClick={() => router.push('/properties')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          Browse all properties
        </button>
      </div>
    </div>
  )

  function requireAuth(action) {
    if (!user) {
      const search = searchParams.toString()
      router.push(`/login?redirect=${encodeURIComponent(pathname + (search ? `?${search}` : ''))}`)
      return
    }
    action()
  }

  const shortlisted = isShortlisted(property.id)

  const details = [
    { label: 'Floor',      value: property.floor },
    { label: 'Furnishing', value: property.furnishing },
    { label: 'Facing',     value: property.facing },
    { label: 'Age',        value: property.age },
    { label: 'Parking',    value: property.parking },
    { label: 'Possession', value: property.possession_status },
  ].filter(d => d.value)

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
              <div
                className="relative h-80 sm:h-[420px] overflow-hidden"
                onMouseEnter={() => setAutoPaused(true)}
                onMouseLeave={() => setAutoPaused(false)}
              >
                <img
                  key={activeImg}
                  src={images[activeImg]}
                  alt={property.title}
                  className="w-full h-full object-cover animate-fade-in"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm">
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <button
                      onClick={() => setActiveImg(i => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-700" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 right-4">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-medium">
                    {activeImg + 1} / {images.length}
                  </div>
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 p-3 bg-slate-50 border-t border-slate-100 overflow-x-auto">
                  {images.map((img, i) => (
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
              )}
            </div>

            {/* Title + Location */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{property.property_type}</span>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">{property.title}</h1>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1.5">
                    <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                    {property.location}{property.city ? `, ${property.city}` : ''}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-700">{formatPrice(property.price)}</p>
                  {property.area > 0 && property.price > 0 && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      ₹{Math.round(property.price / property.area).toLocaleString('en-IN')} / sqft
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">Listed {formatDate(property.listed_date || property.created_at)}</p>
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
                {property.bathrooms > 0 && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                      <Bath className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{property.bathrooms}</p>
                      <p className="text-xs text-slate-400">Bathrooms</p>
                    </div>
                  </div>
                )}
                {property.area > 0 && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <Maximize2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{property.area.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">sqft</p>
                    </div>
                  </div>
                )}
                {property.parking && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                      <Car className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{property.parking}</p>
                      <p className="text-xs text-slate-400">Parking</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            {details.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="text-base font-bold text-slate-900 mb-3">Property Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
            )}

            {/* Amenities */}
            {(property.amenities ?? []).length > 0 && (
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
            )}

            {/* Location / Map */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-slate-900 mb-4">Location</h2>
              <div className="h-52 bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
                <MapPin className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-500 font-medium">{property.location}{property.city ? `, ${property.city}` : ''}</p>
                {property.map_link ? (
                  <a
                    href={property.map_link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open in Maps
                  </a>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">Exact location shared after enquiry</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">
            {/* Price Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-24">
              <div className="mb-4">
                <p className="text-3xl font-bold text-indigo-700">{formatPrice(property.price)}</p>
                {property.area > 0 && property.price > 0 && (
                  <p className="text-xs text-slate-400 mt-1">₹{Math.round(property.price / property.area).toLocaleString('en-IN')}/sqft</p>
                )}
              </div>

              {/* Agent card */}
              {property.agent && (
                <div className="bg-slate-50 rounded-xl p-4 mb-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Listed by</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                      {property.agent.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{property.agent}</p>
                      <p className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-0.5">
                        <BadgeCheck className="w-3.5 h-3.5" /> Verified Rerock agent
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setEnquiryOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 mb-3"
              >
                <Phone className="w-4 h-4" /> Send Enquiry
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
                Our team usually responds within a few hours.
              </p>
            </div>

            {/* Tags */}
            {(property.tags ?? []).length > 0 && (
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
                onClick={() => router.push(`/properties?type=${property.property_type}`)}
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
