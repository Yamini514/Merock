import { useState } from 'react'
import { Bell, Building2, TrendingDown, MessageSquare, Clock, CheckCheck, Trash2, BellOff } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { ALERTS } from '../mock-data/alerts'
import { formatRelativeTime } from '../utils/formatters'
import { cn } from '../utils/cn'

const TYPE_META = {
  new_property: { icon: Building2,    label: 'New Property', color: 'bg-indigo-50 text-indigo-600',  border: 'border-indigo-200/60' },
  price_drop:   { icon: TrendingDown, label: 'Price Drop',   color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-200/60' },
  enquiry:      { icon: MessageSquare, label: 'Enquiry',      color: 'bg-blue-50 text-blue-600',      border: 'border-blue-200/60' },
  follow_up:    { icon: Clock,        label: 'Follow Up',    color: 'bg-amber-50 text-amber-600',    border: 'border-amber-200/60' },
}

const TABS = [
  { key: 'all',    label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read',   label: 'Read' },
]

export default function Alerts() {
  const [alerts, setAlerts] = useState(ALERTS)
  const [activeTab, setActiveTab] = useState('all')

  const unread = alerts.filter(a => !a.read).length

  function markRead(id) { setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a)) }
  function markAllRead() { setAlerts(prev => prev.map(a => ({ ...a, read: true }))) }
  function dismiss(id) { setAlerts(prev => prev.filter(a => a.id !== id)) }

  const filtered = alerts.filter(a => {
    if (activeTab === 'unread') return !a.read
    if (activeTab === 'read')   return a.read
    return true
  })

  return (
    <div className="flex flex-col gap-5 animate-fade-in max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread alert${unread !== 1 ? 's' : ''}`}
        breadcrumb={['Home', 'Alerts']}
        actions={
          unread > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllRead}>
              <CheckCheck size={13} /> Mark all read
            </Button>
          )
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-xl p-1 w-fit shadow-sm">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
            {tab.key === 'unread' && unread > 0 && (
              <span className="text-[10px] font-bold bg-rose-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-slate-200/80">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <BellOff size={22} className="text-slate-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">All clear!</p>
            <p className="text-sm text-slate-400 mt-1">No {activeTab !== 'all' ? activeTab : ''} notifications.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(alert => {
            const meta = TYPE_META[alert.type] ?? TYPE_META.follow_up
            const Icon = meta.icon
            return (
              <div
                key={alert.id}
                onClick={() => markRead(alert.id)}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-2xl border cursor-pointer',
                  'hover:shadow-sm transition-all duration-150 group',
                  !alert.read
                    ? `bg-white ${meta.border} shadow-sm`
                    : 'bg-white border-slate-200/60 opacity-70 hover:opacity-100'
                )}
              >
                <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center shrink-0', meta.color)}>
                  <Icon size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className={cn('text-sm font-semibold leading-none', alert.read ? 'text-slate-600' : 'text-slate-900')}>{alert.title}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge status={alert.priority} />
                      {!alert.read && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2.5">
                    <span className="text-xs text-slate-400">{formatRelativeTime(alert.time)}</span>
                    <span className={cn('text-[10px] font-semibold rounded-full px-2 py-0.5', meta.color)}>
                      {meta.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); dismiss(alert.id) }}
                  className="p-1.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
