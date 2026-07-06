'use client'

import { useCallback } from 'react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { ArrowUpRight, Building2, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import StatCard from '../../../components/StatCard'
import Card, { CardHeader } from '../../../components/Card'
import Badge from '../../../components/Badge'
import Button from '../../../components/Button'
import Spinner from '../../../components/Spinner'
import ErrorBanner from '../../../components/ErrorBanner'
import { getDashboardOverview } from '../../../api/dashboard'
import { listProperties } from '../../../api/properties'
import { useApi } from '../../../hooks/useApi'
import { useAuth } from '../../../context/AuthContext'
import { canWrite } from '../../../utils/permissions'
import { formatCurrency } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'

const ACTIVITY_META = {
  enquiry:  { color: 'bg-blue-100 text-blue-600',    letter: 'E' },
  property: { color: 'bg-indigo-100 text-indigo-600', letter: 'P' },
  client:   { color: 'bg-emerald-100 text-emerald-600', letter: 'C' },
  referral: { color: 'bg-amber-100 text-amber-600',  letter: 'R' },
}

const today = new Date()
const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening'

export default function Dashboard() {
  const router = useRouter()
  const { user } = useAuth()

  const overviewFetcher = useCallback(() => getDashboardOverview(), [])
  const { data: overview, loading, error } = useApi(overviewFetcher, [])

  const propsFetcher = useCallback(() => listProperties({ page_size: 4 }), [])
  const { data: propsData } = useApi(propsFetcher, [])
  const recentProperties = propsData?.data ?? []

  const stats = overview?.stats ?? []
  const monthly = overview?.monthly ?? []
  const byType = overview?.by_type ?? []
  const activity = overview?.activity ?? []

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <Calendar size={13} className="shrink-0" />
            {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {canWrite(user, 'properties') && (
          <Button variant="secondary" size="sm" onClick={() => router.push('/admin/properties/add')} className="shrink-0">
            <Building2 size={13} />
            Add Property
          </Button>
        )}
      </div>

      <ErrorBanner message={error?.message} />

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
            {stats.map((s, i) => (
              <StatCard key={i} label={s.label} value={s.value} icon={s.icon} color={s.color} />
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Area chart */}
            <Card className="lg:col-span-2">
              <CardHeader
                title="Enquiries & Conversions"
                subtitle="Monthly performance overview"
                action={
                  <button
                    onClick={() => router.push('/admin/enquiries')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    View all <ArrowUpRight size={12} />
                  </button>
                }
              />
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gEnq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ border: 'none', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '10px 14px' }}
                    cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                  />
                  <Area type="monotone" dataKey="enquiries"  stroke="#6366f1" strokeWidth={2.5} fill="url(#gEnq)"  name="Enquiries"   dot={false} activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2.5} fill="url(#gConv)" name="Conversions" dot={false} activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex items-center gap-5 mt-2">
                {[{ color: 'bg-indigo-500', label: 'Enquiries' }, { color: 'bg-emerald-500', label: 'Conversions' }].map(l => (
                  <div key={l.label} className="flex items-center gap-2">
                    <span className={cn('w-2.5 h-2.5 rounded-full', l.color)} />
                    <span className="text-xs text-slate-500 font-medium">{l.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Donut chart */}
            <Card>
              <CardHeader title="By Property Type" subtitle="Current listings" />
              {byType.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">No properties listed yet.</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={165}>
                    <PieChart>
                      <Pie data={byType} cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={4} dataKey="value">
                        {byType.map((e, i) => (
                          <Cell key={i} fill={e.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ border: 'none', borderRadius: 10, fontSize: 11, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        formatter={(v, n) => [`${v}%`, n]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2 mt-1">
                    {byType.map(d => (
                      <div key={d.name} className="flex items-center gap-2.5 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="text-slate-600 flex-1">{d.name}</span>
                        <span className="font-semibold text-slate-800">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Recent properties */}
            <Card className="lg:col-span-3" padding={false}>
              <div className="p-5 pb-0">
                <CardHeader
                  title="Recent Listings"
                  subtitle="Latest properties added"
                  action={
                    <button onClick={() => router.push('/admin/properties')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      View all <ArrowUpRight size={12} />
                    </button>
                  }
                />
              </div>
              {recentProperties.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">No properties yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3">Property</th>
                        <th className="text-left text-xs font-semibold text-slate-400 px-3 py-3">Status</th>
                        <th className="text-right text-xs font-semibold text-slate-400 px-5 py-3">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recentProperties.map(p => (
                        <tr
                          key={p.id}
                          onClick={() => router.push(`/admin/properties/${p.id}`)}
                          className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <img src={p.image} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0 bg-slate-100" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate max-w-[180px] group-hover:text-indigo-700 transition-colors">{p.title}</p>
                                <p className="text-xs text-slate-400 truncate">{p.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3.5"><Badge status={p.status} dot /></td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="text-sm font-bold text-slate-800">{formatCurrency(p.price)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Activity feed */}
            <Card className="lg:col-span-2">
              <CardHeader title="Activity Feed" subtitle="Real-time updates" />
              {activity.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">No activity yet.</div>
              ) : (
                <div className="relative flex flex-col gap-0">
                  <div className="absolute left-[15px] top-4 bottom-4 w-px bg-slate-100" />
                  {activity.map(item => {
                    const meta = ACTIVITY_META[item.type] ?? ACTIVITY_META.enquiry
                    return (
                      <div key={item.id} className="flex items-start gap-3 py-2.5 relative">
                        <span className={cn('w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 relative z-10', meta.color)}>
                          {meta.letter}
                        </span>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">{item.action}</p>
                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            {item.user && <span className="font-medium text-slate-500">{item.user}</span>}
                            {item.user && '· '}{item.time}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
