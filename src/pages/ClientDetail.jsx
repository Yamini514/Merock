import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, Heart, Search, Edit2, Building2, MessageSquare, TrendingUp } from 'lucide-react'
import Card, { CardHeader, CardSection } from '../components/Card'
import Badge from '../components/Badge'
import Avatar from '../components/Avatar'
import Button from '../components/Button'
import { CLIENTS } from '../mock-data/clients'
import { PROPERTIES } from '../mock-data/properties'
import { formatCurrency, formatDate } from '../utils/formatters'
import { cn } from '../utils/cn'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const client = CLIENTS.find(c => c.id === id)

  if (!client) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-slate-400 text-sm">Client not found.</p>
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/clients')}>Back</Button>
    </div>
  )

  const savedProps = PROPERTIES.filter(p => client.savedProperties?.includes(p.id))

  return (
    <div className="flex flex-col gap-5 max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/clients')} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 shadow-sm transition-colors">
          <ArrowLeft size={15} />
        </button>
        <div className="flex-1" />
        <Button variant="secondary" size="sm"><Edit2 size={13} /> Edit</Button>
        <Button size="sm"><MessageSquare size={13} /> Message</Button>
      </div>

      {/* Hero profile banner */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative flex items-start gap-4">
          <Avatar name={client.name} size="xl" className="ring-4 ring-white/20 shadow-xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white leading-none">{client.name}</h2>
                <p className="text-indigo-200 text-sm mt-1.5 flex items-center gap-1.5">
                  <span>Client since {formatDate(client.joinedDate)}</span>
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Badge status={client.type} className="ring-white/20" />
                <Badge status={client.status} />
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 text-xs text-indigo-200 hover:text-white transition-colors">
                <Mail size={12} /> {client.email}
              </a>
              <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 text-xs text-indigo-200 hover:text-white transition-colors">
                <Phone size={12} /> {client.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Quick stats in the banner */}
        <div className="relative flex gap-3 mt-5">
          {[
            { label: 'Enquiries',  value: client.enquiries,                     icon: MessageSquare },
            { label: 'Saved',      value: client.savedProperties?.length ?? 0,   icon: Heart },
            { label: 'Agent',      value: client.assignedAgent,                  icon: Building2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2.5">
              <Icon size={13} className="text-indigo-200" />
              <div>
                <p className="text-[10px] text-indigo-300">{label}</p>
                <p className="text-xs font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Preferences */}
        <Card className="md:col-span-2">
          <CardHeader title="Buyer Preferences" subtitle="What this client is looking for" />
          {client.type === 'Seller' ? (
            <div className="py-6 text-center text-slate-400 text-sm">
              This client is registered as a <span className="font-semibold">Seller</span> — no buyer preferences set.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Budget Range</p>
                <p className="font-bold text-indigo-700 mt-1.5">
                  {formatCurrency(client.budget.min)} – {formatCurrency(client.budget.max)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Min Bedrooms</p>
                <p className="font-bold text-slate-800 mt-1.5">{client.preferences.bedrooms}+ BHK</p>
              </div>

              <div className="col-span-2 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-2.5">Preferred Locations</p>
                <div className="flex flex-wrap gap-1.5">
                  {client.preferences.locations.map(loc => (
                    <span key={loc} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-xl border border-indigo-100">
                      <MapPin size={9} /> {loc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-2.5">Property Types</p>
                <div className="flex flex-wrap gap-1.5">
                  {client.preferences.propertyType.map(t => (
                    <span key={t} className="text-xs bg-slate-200 text-slate-600 rounded-lg px-2 py-0.5 font-medium">{t}</span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-2.5">Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {client.preferences.amenities.map(a => (
                    <span key={a} className="text-xs bg-emerald-50 text-emerald-700 rounded-lg px-2 py-0.5 font-medium border border-emerald-100">{a}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Saved searches */}
        <Card>
          <CardHeader
            title="Saved Searches"
            subtitle="Active match alerts"
            action={<button className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"><Search size={12} /></button>}
          />
          <div className="flex flex-col gap-2">
            {[
              { label: '3BHK in Banjara Hills < ₹1Cr', active: true },
              { label: 'Villa with Pool, Jubilee Hills',  active: false },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Search size={12} className="text-slate-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">{s.label}</p>
                </div>
                <span className={cn('text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0', s.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-500')}>
                  {s.active ? 'Active' : 'Paused'}
                </span>
              </div>
            ))}
            <button className="text-xs text-indigo-600 font-semibold hover:underline text-center py-1">
              + Create new alert
            </button>
          </div>
        </Card>
      </div>

      {/* Saved properties */}
      {savedProps.length > 0 && (
        <Card>
          <CardHeader title="Shortlisted Properties" subtitle={`${savedProps.length} properties saved`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedProps.map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/admin/properties/${p.id}`)}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-all group"
              >
                <img src={p.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{p.title}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{p.location}</p>
                  <p className="text-sm font-bold text-indigo-600 mt-1.5">{formatCurrency(p.price)}</p>
                </div>
                <Badge status={p.status} dot />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
