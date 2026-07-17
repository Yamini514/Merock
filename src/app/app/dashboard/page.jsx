'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Heart, Bell, ArrowRight, Clock, MessageSquare,
  Building2, Share2, IndianRupee, Sparkles, Copy,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { getMySaved, getMyEnquiries } from '../../../api/customers'
import { listAlerts } from '../../../api/alerts'
import { getMyReferrals } from '../../../api/referrals'
import { useApi } from '../../../hooks/useApi'
import PropertyCard from '../../../user/components/PropertyCard'
import { formatRelativeTime, formatCurrency } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'

export default function UserDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const isMember = user?.role === 'member'

  const savedFetcher = useCallback(() => getMySaved(), [])
  const { data: savedData, loading: savedLoading } = useApi(savedFetcher, [])
  const savedProperties = savedData?.properties ?? []

  const alertsFetcher = useCallback(() => listAlerts(), [])
  const { data: alertsData, loading: alertsLoading } = useApi(alertsFetcher, [])
  const alerts = alertsData ?? []
  const unreadAlerts = alerts.filter(a => !a.read).length

  const enquiriesFetcher = useCallback(() => getMyEnquiries(), [])
  const { data: enquiriesData } = useApi(enquiriesFetcher, [])
  const enquiryCount = (enquiriesData ?? []).length

  const referralsFetcher = useCallback(() => (isMember ? getMyReferrals() : Promise.resolve(null)), [isMember])
  const { data: referralData } = useApi(referralsFetcher, [isMember])
  const member = referralData?.member

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ── */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 sm:p-8 mb-6 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -right-4 w-36 h-36 bg-white/5 rounded-full" />

          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border border-white/30 shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-white/70 text-sm">Welcome back,</p>
              <h1 className="text-2xl font-bold truncate">{user?.name || 'User'}</h1>
              <p className="text-white/60 text-xs mt-0.5 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* ── Stat tiles ── */}
        <div className={cn('grid gap-4 mb-6', isMember ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3')}>
          <StatTile icon={Heart} color="rose" label="Saved Properties" value={savedProperties.length} onClick={() => router.push('/app/saved')} />
          <StatTile icon={Bell} color="amber" label="Unread Alerts" value={unreadAlerts} onClick={() => router.push('/app/alerts')} />
          <StatTile icon={MessageSquare} color="indigo" label="Enquiries" value={enquiryCount} onClick={() => router.push('/app/enquiries')} />
          {isMember && (
            <>
              <StatTile icon={Share2} color="indigo" label="Referrals Sent" value={member?.referral_count ?? 0} onClick={() => router.push('/app/referrals')} />
              <StatTile icon={IndianRupee} color="emerald" label="Earnings" value={formatCurrency(member?.total_earnings ?? 0)} onClick={() => router.push('/app/referrals')} />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main column ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Saved properties preview */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">Saved Properties</h2>
                {savedProperties.length > 0 && (
                  <Link href="/app/saved" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
              {savedLoading ? (
                <div className="py-10 flex justify-center">
                  <span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : savedProperties.length === 0 ? (
                <EmptyRow
                  icon={Heart}
                  iconBg="bg-rose-50"
                  iconColor="text-rose-300"
                  title="No saved properties yet"
                  desc="Browse listings and tap the heart icon to save the ones you love."
                  ctaLabel="Browse Properties"
                  onCta={() => router.push('/properties')}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedProperties.slice(0, 4).map(p => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              )}
            </div>

            {/* Recent alerts preview */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">Recent Alerts</h2>
                {alerts.length > 0 && (
                  <Link href="/app/alerts" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
              {alertsLoading ? (
                <div className="py-10 flex justify-center">
                  <span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : alerts.length === 0 ? (
                <EmptyRow
                  icon={Bell}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-300"
                  title="No alerts yet"
                  desc="We'll notify you of updates on your enquiries and referrals here."
                />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {alerts.slice(0, 4).map(alert => (
                    <div
                      key={alert.id}
                      className={cn(
                        'flex items-start gap-3 p-3.5 rounded-xl border transition-colors',
                        !alert.read ? 'border-indigo-100 bg-indigo-50/40' : 'border-slate-100'
                      )}
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800 truncate">{alert.title}</p>
                          {!alert.read && <span className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{alert.message}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatRelativeTime(alert.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Side column ── */}
          <div className="flex flex-col gap-6">
            {isMember ? <ReferralSnapshotCard member={member} router={router} /> : <RecommendationsCard router={router} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatTile({ icon: Icon, color, label, value, onClick }) {
  const colors = {
    rose:    'bg-rose-50 text-rose-600',
    amber:   'bg-amber-50 text-amber-600',
    indigo:  'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', colors[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-slate-900 leading-none truncate">{value}</p>
        <p className="text-slate-500 text-xs mt-1 truncate">{label}</p>
      </div>
    </button>
  )
}

function EmptyRow({ icon: Icon, iconBg, iconColor, title, desc, ctaLabel, onCta }) {
  return (
    <div className="py-10 text-center">
      <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3', iconBg)}>
        <Icon className={cn('w-7 h-7', iconColor)} />
      </div>
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-slate-400 text-xs max-w-xs mx-auto">{desc}</p>
      {ctaLabel && (
        <button
          onClick={onCta}
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-xs hover:bg-indigo-700 transition-colors"
        >
          {ctaLabel} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

function ReferralSnapshotCard({ member, router }) {
  function copyCode() {
    if (!member?.referral_code) return
    navigator.clipboard?.writeText(`https://rerockrealty.com?ref=${member.referral_code}`).catch(() => {})
  }
  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 text-white shadow-lg">
      <div className="flex items-center gap-2 mb-1">
        <Share2 className="w-4 h-4 text-indigo-300" />
        <h2 className="text-sm font-bold">Referral Snapshot</h2>
        {member?.tier && (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wide bg-white/15 rounded-full px-2 py-0.5">{member.tier}</span>
        )}
      </div>
      <p className="text-2xl font-bold font-mono tracking-wider mt-3">{member?.referral_code || '—'}</p>
      <button
        onClick={copyCode}
        className="flex items-center gap-1.5 mt-2 text-xs text-indigo-300 hover:text-white transition-colors"
      >
        <Copy className="w-3 h-3" /> Copy referral link
      </button>
      <button
        onClick={() => router.push('/app/referrals')}
        className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 bg-white text-indigo-800 rounded-xl font-semibold text-xs hover:bg-indigo-50 transition-colors"
      >
        View Full Details <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function RecommendationsCard({ router }) {
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white shadow-lg">
      <Sparkles className="w-6 h-6 text-indigo-200 mb-3" />
      <h2 className="text-sm font-bold mb-1.5">Get Personalized Picks</h2>
      <p className="text-indigo-100 text-xs leading-relaxed mb-4">
        The more properties you save, the better we can tailor recommendations to what you're looking for.
      </p>
      <button
        onClick={() => router.push('/properties')}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white text-indigo-700 rounded-xl font-semibold text-xs hover:bg-indigo-50 transition-colors"
      >
        Browse Properties <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
