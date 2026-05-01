import { useState } from 'react'
import { Bell, TrendingDown, CheckCircle, Building2, X, Filter } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { USER_PROFILE } from '../../mock-data/userData'
import { cn } from '../../utils/cn'

const FILTERS = ['All', 'Matches', 'Price Drops', 'Visits']

const ALERT_META = {
  match:      { icon: Building2,   bg: 'bg-indigo-100 text-indigo-600',  label: 'Match' },
  price_drop: { icon: TrendingDown, bg: 'bg-emerald-100 text-emerald-600', label: 'Price Drop' },
  visit:      { icon: CheckCircle,  bg: 'bg-blue-100 text-blue-600',       label: 'Visit' },
}

const FILTER_MAP = { All: null, Matches: 'match', 'Price Drops': 'price_drop', Visits: 'visit' }

// Extra mock alerts for a richer page
const MORE_ALERTS = [
  { id: 'AL004', title: 'New Match Found',   message: 'A new villa in Jubilee Hills matches your saved search.', time: '2024-04-11T08:00:00', read: true,  type: 'match' },
  { id: 'AL005', title: 'Price Drop Alert',  message: '4BHK Penthouse in Madhapur dropped by ₹10L.',           time: '2024-04-10T15:00:00', read: true,  type: 'price_drop' },
  { id: 'AL006', title: 'Visit Reminder',    message: 'Your site visit for Manikonda property is tomorrow.',    time: '2024-04-09T09:00:00', read: true,  type: 'visit' },
]

export default function AlertsPage() {
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState('All')
  const [alerts, setAlerts] = useState([...USER_PROFILE.alerts, ...MORE_ALERTS])

  const typeKey = FILTER_MAP[activeFilter]
  const filtered = typeKey ? alerts.filter(a => a.type === typeKey) : alerts
  const unread = alerts.filter(a => !a.read).length

  function markAllRead() { setAlerts(prev => prev.map(a => ({ ...a, read: true }))) }
  function dismiss(id) { setAlerts(prev => prev.filter(a => a.id !== id)) }
  function markRead(id) { setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a)) }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
              Mark all read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border',
                activeFilter === f
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
              )}
            >
              {f}
              {f === 'All' && unread > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                  {unread}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Alert list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-amber-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">No {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} alerts</h3>
              <p className="text-slate-400 text-sm">We'll notify you when something relevant comes up.</p>
            </div>
          ) : (
            filtered.map(alert => {
              const meta = ALERT_META[alert.type] || ALERT_META.match
              const Icon = meta.icon
              return (
                <div
                  key={alert.id}
                  onClick={() => markRead(alert.id)}
                  className={cn(
                    'group bg-white rounded-2xl border shadow-sm p-4 flex items-start gap-4 cursor-pointer transition-all hover:shadow-md',
                    !alert.read ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-100'
                  )}
                >
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', meta.bg)}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{alert.title}</p>
                        <span className={cn('inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5', meta.bg)}>
                          {meta.label}
                        </span>
                      </div>
                      {!alert.read && <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{alert.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      {new Date(alert.time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); dismiss(alert.id) }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
