import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart, Bell, Search, ArrowRight, CheckCircle, Clock,
  Eye, Trash2, TrendingDown, MapPin, BedDouble, X,
  MessageSquare, LogOut, Building2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useShortlist } from '../../hooks/useShortlist'
import { USER_PROPERTIES } from '../../mock-data/userProperties'
import { USER_PROFILE } from '../../mock-data/userData'
import PropertyCard from '../components/PropertyCard'
import { cn } from '../../utils/cn'

const TABS = ['Saved Properties', 'My Enquiries', 'Alerts', 'Saved Searches']

const STATUS_STYLES = {
  enquired:    'bg-blue-100 text-blue-700',
  visited:     'bg-emerald-100 text-emerald-700',
  negotiating: 'bg-amber-100 text-amber-700',
  closed:      'bg-slate-100 text-slate-600',
}

const ALERT_ICONS = {
  match:      { icon: Building2, bg: 'bg-indigo-100 text-indigo-600' },
  price_drop: { icon: TrendingDown, bg: 'bg-emerald-100 text-emerald-600' },
  visit:      { icon: CheckCircle, bg: 'bg-blue-100 text-blue-600' },
}

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`
  return `₹${(price / 100000).toFixed(0)} L`
}

export default function UserDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { shortlist, toggle, clear } = useShortlist()
  const [tab, setTab] = useState('Saved Properties')
  const [alerts, setAlerts] = useState(USER_PROFILE.alerts)

  const savedProperties = USER_PROPERTIES.filter(p => shortlist.includes(p.id))

  const unreadAlerts = alerts.filter(a => !a.read).length

  function markAllRead() {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })))
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ── */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 sm:p-8 mb-7 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -right-4 w-36 h-36 bg-white/5 rounded-full" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border border-white/30">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-white/70 text-sm">Welcome back,</p>
                <h1 className="text-2xl font-bold">{user?.name || 'User'}</h1>
                <p className="text-white/60 text-xs mt-0.5">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/properties')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Search className="w-4 h-4" /> Browse
              </button>
              <button
                onClick={() => { logout(); navigate('/login') }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="relative grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
            {[
              { label: 'Saved',     value: shortlist.length, icon: Heart },
              { label: 'Enquiries', value: USER_PROFILE.enquiries.length, icon: MessageSquare },
              { label: 'Alerts',    value: unreadAlerts, icon: Bell },
            ].map(stat => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center">
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center mx-auto mb-1.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-white/60 text-xs">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 mb-6 overflow-x-auto scrollbar-hide">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2',
                tab === t
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              )}
            >
              {t}
              {t === 'Alerts' && unreadAlerts > 0 && (
                <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadAlerts}
                </span>
              )}
              {t === 'Saved Properties' && shortlist.length > 0 && (
                <span className="w-5 h-5 bg-indigo-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {shortlist.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}

        {/* Saved Properties */}
        {tab === 'Saved Properties' && (
          <div>
            {savedProperties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-rose-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No saved properties yet</h3>
                <p className="text-slate-400 text-sm mb-6">Browse listings and click the heart icon to save properties you love.</p>
                <button
                  onClick={() => navigate('/properties')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
                >
                  Browse Properties <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-500">{savedProperties.length} saved {savedProperties.length === 1 ? 'property' : 'properties'}</p>
                  <button
                    onClick={clear}
                    className="text-xs text-rose-500 hover:text-rose-600 font-semibold transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear all
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {savedProperties.map(p => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* My Enquiries */}
        {tab === 'My Enquiries' && (
          <div className="space-y-4">
            {USER_PROFILE.enquiries.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-indigo-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No enquiries yet</h3>
                <p className="text-slate-400 text-sm">Contact an agent on a property to see your enquiries here.</p>
              </div>
            ) : (
              USER_PROFILE.enquiries.map(enq => (
                <div
                  key={enq.id}
                  onClick={() => navigate(`/property/${enq.propertyId}`)}
                  className="group bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer p-4 flex items-center gap-4"
                >
                  <img src={enq.image} alt="" className="w-20 h-16 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors truncate">{enq.property}</h3>
                    <p className="text-xs text-indigo-700 font-bold mt-0.5">{formatPrice(enq.price)}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="text-xs text-slate-400">{enq.agent}</p>
                      <span className="text-slate-200">·</span>
                      <p className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{enq.date}</p>
                    </div>
                  </div>
                  <span className={cn('text-xs font-bold px-3 py-1.5 rounded-full shrink-0 capitalize', STATUS_STYLES[enq.status] || 'bg-slate-100 text-slate-600')}>
                    {enq.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Alerts */}
        {tab === 'Alerts' && (
          <div>
            {alerts.length > 0 && unreadAlerts > 0 && (
              <div className="flex justify-end mb-3">
                <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline font-semibold">
                  Mark all as read
                </button>
              </div>
            )}
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center">
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-amber-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No alerts yet</h3>
                  <p className="text-slate-400 text-sm">We'll notify you of price drops, new matches, and updates here.</p>
                </div>
              ) : (
                alerts.map(alert => {
                  const meta = ALERT_ICONS[alert.type] || ALERT_ICONS.match
                  const Icon = meta.icon
                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        'bg-white rounded-2xl border shadow-sm p-4 flex items-start gap-4 transition-all',
                        !alert.read ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-100'
                      )}
                    >
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', meta.bg)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800">{alert.title}</p>
                          {!alert.read && <span className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{alert.message}</p>
                        <p className="text-xs text-slate-400 mt-1.5">{new Date(alert.time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <button
                        onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Saved Searches */}
        {tab === 'Saved Searches' && (
          <div className="space-y-3">
            {USER_PROFILE.savedSearches.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">No saved searches</h3>
                <p className="text-slate-400 text-sm mt-1">Save searches to get notified of new matches.</p>
              </div>
            ) : (
              USER_PROFILE.savedSearches.map(s => (
                <div
                  key={s.id}
                  className="group bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                      <Search className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{s.label}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-slate-400">Created {s.createdAt}</p>
                        <span className="text-slate-200">·</span>
                        <p className="text-xs font-semibold text-emerald-600">{s.matches} new matches</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      'text-xs font-bold px-2.5 py-1 rounded-full',
                      s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    )}>
                      {s.active ? 'Active' : 'Paused'}
                    </span>
                    <button
                      onClick={() => navigate(`/properties?q=${encodeURIComponent(s.label)}`)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  )
}
