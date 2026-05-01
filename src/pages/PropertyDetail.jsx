import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Bed, Bath, Maximize2, Edit2, Share2, Heart, Building2, User, Calendar, CheckCircle } from 'lucide-react'
import Card, { CardHeader } from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import { PROPERTIES } from '../mock-data/properties'
import { formatCurrency, formatDate } from '../utils/formatters'
import { cn } from '../utils/cn'

const AMENITY_ICONS = { Gym: '🏋️', 'Swimming Pool': '🏊', Parking: '🚗', Security: '🔒', 'Gated Community': '🏘️', Clubhouse: '🏛️', Garden: '🌿', Lift: '🛗' }

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeImg, setActiveImg] = useState(0)
  const [wishlisted, setWishlisted] = useState(false)

  const property = PROPERTIES.find(p => p.id === id)

  if (!property) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Building2 size={32} className="text-slate-300" />
      <p className="text-slate-400 text-sm">Property not found.</p>
      <Button variant="ghost" size="sm" onClick={() => navigate('/properties')}>Back to Properties</Button>
    </div>
  )

  /* Mock multiple images */
  const images = [property.image, property.image, property.image]
  const similarProperties = PROPERTIES.filter(p => p.id !== id && p.type === property.type).slice(0, 3)
  const amenities = property.tags?.flatMap(t => [t]) ?? []

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Topbar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={15} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate-900 truncate">{property.title}</h1>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={10} />{property.location}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setWishlisted(w => !w)}
            className={cn('p-2.5 rounded-xl border transition-all', wishlisted ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50')}
          >
            <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
          <Button variant="secondary" size="sm"><Share2 size={13} /> Share</Button>
          <Button size="sm" onClick={() => navigate(`/properties/edit/${id}`)}><Edit2 size={13} /> Edit</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Images + Details */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Image gallery */}
          <div className="flex flex-col gap-2">
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-100">
              <img src={images[activeImg]} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
              <div className="absolute top-4 left-4"><Badge status={property.status} dot /></div>
              <div className="absolute top-4 right-4">
                <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm">
                  {activeImg + 1} / {images.length}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 flex gap-1.5">
                {property.tags.map(tag => (
                  <span key={tag} className="text-xs bg-white/20 backdrop-blur-sm text-white rounded-lg px-2.5 py-1 font-medium border border-white/20">{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn('relative h-20 rounded-xl overflow-hidden flex-1 bg-slate-100 transition-all', activeImg === i ? 'ring-2 ring-indigo-500' : 'opacity-60 hover:opacity-100')}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Key details */}
          <Card>
            <CardHeader title="Property Details" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Bed,       label: 'Bedrooms',  value: property.bedrooms > 0 ? `${property.bedrooms} BHK` : '—' },
                { icon: Bath,      label: 'Bathrooms', value: `${property.bathrooms} Baths` },
                { icon: Maximize2, label: 'Area',       value: `${property.area.toLocaleString()} sqft` },
                { icon: Building2, label: 'Type',       value: property.type },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3.5 flex flex-col gap-1.5">
                  <Icon size={16} className="text-indigo-500" />
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm font-bold text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader title="About this Property" />
            <p className="text-sm text-slate-600 leading-relaxed">
              Presenting a magnificent {property.type.toLowerCase()} in the heart of {property.location.split(',')[0]}.
              Spread across {property.area.toLocaleString()} sqft, this property offers spacious rooms with premium finishes
              and world-class amenities. Ideal for {property.type === 'Commercial' ? 'businesses and offices' : 'families looking for a comfortable lifestyle'}
              in a prime location.
            </p>
          </Card>

          {/* Amenities */}
          {amenities.length > 0 && (
            <Card>
              <CardHeader title="Amenities & Features" />
              <div className="flex flex-wrap gap-2">
                {['Premium Finishes', 'Power Backup', 'CCTV Surveillance', 'Gated Community', ...amenities].map(a => (
                  <span key={a} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-xl border border-indigo-100">
                    <CheckCircle size={11} className="text-indigo-500" />
                    {a}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right: Pricing + Agent */}
        <div className="flex flex-col gap-4">
          {/* Price card */}
          <Card className="sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(property.price)}</p>
                <p className="text-xs text-slate-400 mt-1">
                  ₹{Math.round(property.price / property.area).toLocaleString('en-IN')}/sqft
                </p>
              </div>
              <Badge status={property.status} dot />
            </div>

            <div className="flex flex-col gap-2 mb-5 text-sm">
              {[
                ['Property ID',  property.id],
                ['Listed On',    formatDate(property.listedDate)],
                ['Type',         property.type],
                ['Location',     property.location],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-xs text-slate-400">{k}</span>
                  <span className="text-xs font-semibold text-slate-700">{v}</span>
                </div>
              ))}
            </div>

            <Button className="w-full mb-2">Schedule a Visit</Button>
            <Button variant="secondary" className="w-full"><MessageSquareIcon /> Send Enquiry</Button>
          </Card>

          {/* Agent card */}
          <Card>
            <CardHeader title="Listing Agent" tight />
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={property.agent} size="lg" />
              <div>
                <p className="text-sm font-semibold text-slate-800">{property.agent}</p>
                <p className="text-xs text-slate-400">Senior Property Advisor</p>
                <div className="flex items-center gap-1 mt-1">
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i} className="text-amber-400 text-xs">{s}</span>
                  ))}
                  <span className="text-xs text-slate-400">(4.8)</span>
                </div>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="w-full">
              <User size={12} /> View Profile
            </Button>
          </Card>
        </div>
      </div>

      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <Card>
          <CardHeader title="Similar Properties" subtitle={`More ${property.type}s you might like`} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {similarProperties.map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/properties/${p.id}`)}
                className="rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="h-36 overflow-hidden bg-slate-100">
                  <img src={p.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-slate-800 truncate">{p.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{p.location}</p>
                  <p className="text-sm font-bold text-indigo-600 mt-2">{formatCurrency(p.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function MessageSquareIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
}
