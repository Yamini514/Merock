'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Heart, MapPin, BedDouble, Bath, Maximize2, BadgeCheck, Star, Eye } from 'lucide-react'
import { useShortlist } from '../../hooks/useShortlist'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`
  if (price >= 100000) return `₹${(price / 100000).toFixed(0)} L`
  return `₹${price.toLocaleString('en-IN')}`
}

export default function PropertyCard({ property, className }) {
  const { isShortlisted, toggle } = useShortlist()
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [imgError, setImgError] = useState(false)
  const shortlisted = isShortlisted(property.id)

  function handleSave(e) {
    e.preventDefault()
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }
    toggle(property.id)
  }

  return (
    <div className={cn('group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1', className)}>
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={imgError ? 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80' : property.image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {property.featured && (
            <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded-lg">
              Featured
            </span>
          )}
          {property.verified && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg">
              <BadgeCheck className="w-3 h-3" /> Verified
            </span>
          )}
        </div>

        {/* Shortlist button */}
        <button
          onClick={handleSave}
          className={cn(
            'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md',
            shortlisted
              ? 'bg-rose-500 text-white scale-110'
              : 'bg-white/90 text-slate-500 hover:bg-white hover:text-rose-500 hover:scale-110'
          )}
        >
          <Heart className={cn('w-4 h-4', shortlisted && 'fill-current')} />
        </button>

        {/* Price bottom-left */}
        <div className="absolute bottom-3 left-3">
          <span className="text-white text-xl font-bold drop-shadow-sm">
            {formatPrice(property.price)}
          </span>
          {property.type === 'Apartment' && (
            <span className="ml-1.5 text-white/80 text-xs">
              ≈ ₹{Math.round(property.price / property.area).toLocaleString('en-IN')}/sqft
            </span>
          )}
        </div>

        {/* Views bottom-right */}
        {property.views && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/80 text-xs">
            <Eye className="w-3.5 h-3.5" />
            {property.views}
          </div>
        )}
      </div>

      {/* Content */}
      <Link href={`/property/${property.id}`} className="block p-4">
        {/* Type chip */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {property.type}
          </span>
          <span className="text-xs text-slate-400">{property.postedDate}</span>
        </div>

        {/* Title */}
        <h3 className="text-slate-900 font-semibold text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-indigo-700 transition-colors">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-slate-500 text-xs mb-3">
          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          {property.location}
        </div>

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs text-slate-600 pb-3 border-b border-slate-100">
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-slate-400" />
              {property.bedrooms} Beds
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-slate-400" />
              {property.bathrooms} Baths
            </div>
          )}
          {property.area && (
            <div className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              {property.area} sqft
            </div>
          )}
        </div>

        {/* Agent */}
        {property.agent && (
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                {property.agent.name.charAt(0)}
              </div>
              <span className="text-xs text-slate-500">{property.agent.name}</span>
            </div>
            {property.agent.rating && (
              <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {property.agent.rating}
              </div>
            )}
          </div>
        )}
      </Link>
    </div>
  )
}
