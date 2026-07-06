'use client'

import { useState, useCallback, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, TrendingUp, IndianRupee, Share2, Plus, Star, Award, Trophy, Crown, Download } from 'lucide-react'
import PageHeader from '../../../components/PageHeader'
import Card, { CardHeader } from '../../../components/Card'
import Badge from '../../../components/Badge'
import DataTable from '../../../components/DataTable'
import Avatar from '../../../components/Avatar'
import Button from '../../../components/Button'
import Spinner from '../../../components/Spinner'
import ErrorBanner from '../../../components/ErrorBanner'
import InviteMemberModal from './_components/InviteMemberModal'
import { listMembers } from '../../../api/members'
import { listReferrals } from '../../../api/referrals'
import { getReferralDashboard } from '../../../api/dashboard'
import { exportEntity } from '../../../api/dataTransfer'
import { useApi } from '../../../hooks/useApi'
import { useAuth } from '../../../context/AuthContext'
import { canWrite, canExport } from '../../../utils/permissions'
import { formatCurrency } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'

const TIER_CONFIG = {
  Elite:    { icon: Crown,  color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', bar: 100 },
  Gold:     { icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', bar: 75 },
  Silver:   { icon: Award,  color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200',  bar: 45 },
  Standard: { icon: Star,   color: 'text-sky-600',    bg: 'bg-sky-50',    border: 'border-sky-200',    bar: 15 },
}

export default function Referrals() {
  const { user } = useAuth()
  const writable   = canWrite(user, 'members')
  const exportable = canExport(user, 'referrals')
  const [addOpen, setAddOpen] = useState(false)

  const membersFetcher = useCallback(() => listMembers({ page_size: 200 }), [])
  const { data: membersData, loading, error, refetch } = useApi(membersFetcher, [])
  const members = membersData?.data ?? []

  const referralsFetcher = useCallback(() => listReferrals({ page_size: 500 }), [])
  const { data: referralsData } = useApi(referralsFetcher, [])
  const referrals = referralsData?.data ?? []

  // Stat cards and tier counts come from the dashboard's own cheap aggregate
  // queries instead of being recomputed client-side from the full row sets
  // above (which are still needed for the table and the monthly chart).
  const dashboardFetcher = useCallback(() => getReferralDashboard(), [])
  const { data: referralStats } = useApi(dashboardFetcher, [])
  const stats = {
    totalMembers: referralStats?.total_members ?? 0,
    totalReferrals: referralStats?.total_referrals ?? 0,
    converted: referralStats?.converted ?? 0,
    totalEarningsPaid: referralStats?.total_earnings_paid ?? 0,
  }
  const tierCounts = Object.fromEntries((referralStats?.by_tier ?? []).map(t => [t.tier, t.count]))

  const monthly = useMemo(() => {
    const now = new Date()
    const buckets = Array.from({ length: 4 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (3 - i), 1)
      return { month: d.toLocaleDateString('en-US', { month: 'short' }), key: `${d.getFullYear()}-${d.getMonth()}`, referrals: 0, converted: 0 }
    })
    referrals.forEach(r => {
      if (!r.created_at) return
      const d = new Date(r.created_at)
      const bucket = buckets.find(b => b.key === `${d.getFullYear()}-${d.getMonth()}`)
      if (!bucket) return
      bucket.referrals += 1
      if (r.status === 'Converted') bucket.converted += 1
    })
    return buckets
  }, [referrals])

  const columns = [
    {
      key: 'name', label: 'Member', sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={val} size="sm" />
          <div>
            <p className="text-sm font-semibold text-slate-800">{val}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'referral_code', label: 'Code',
      render: v => <span className="font-mono text-xs bg-slate-100 text-indigo-700 px-2.5 py-1 rounded-xl font-semibold tracking-wide">{v}</span>,
    },
    { key: 'referral_count', label: 'Referrals', sortable: true },
    { key: 'converted_count', label: 'Converted', sortable: true },
    {
      key: 'total_earnings', label: 'Earnings', sortable: true,
      render: v => <span className="font-bold text-slate-800">{formatCurrency(v || 0)}</span>,
    },
    { key: 'tier',   label: 'Tier',   render: v => <Badge status={v} /> },
    { key: 'status', label: 'Status', render: v => <Badge status={v} dot /> },
  ]

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Referral Program"
        subtitle="Track member referrals, tiers, and earnings"
        breadcrumb={['Home', 'Referrals']}
        actions={
          <>
            {exportable && (
              <Button variant="secondary" onClick={() => exportEntity('referrals').catch(e => alert(e.message))} title="Export CSV">
                <Download size={14} /> Export
              </Button>
            )}
            {writable && (
              <Button className="w-full sm:w-auto justify-center" onClick={() => setAddOpen(true)}>
                <Plus size={14} /> Invite Member
              </Button>
            )}
          </>
        }
      />

      <ErrorBanner message={error?.message} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: stats.totalMembers, icon: Users, color: 'indigo' },
          { label: 'Total Referrals', value: stats.totalReferrals, icon: Share2, color: 'sky' },
          { label: 'Converted', value: stats.converted, icon: TrendingUp, color: 'emerald' },
          { label: 'Earnings Paid', value: formatCurrency(stats.totalEarningsPaid), icon: IndianRupee, color: 'amber' },
        ].map(({ label, value, icon: Icon, color }) => {
          const colors = { indigo: 'bg-indigo-50 text-indigo-600', sky: 'bg-sky-50 text-sky-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600' }
          return (
            <div key={label} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-center gap-4">
              <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center shrink-0', colors[color])}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5 leading-none">{value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <Card className="lg:col-span-2">
          <CardHeader title="Monthly Performance" subtitle="Referrals vs Conversions" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={6}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ border: 'none', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
              <Bar dataKey="referrals" fill="#a5b4fc" radius={[6, 6, 0, 0]} name="Referrals" maxBarSize={32} />
              <Bar dataKey="converted" fill="#34d399" radius={[6, 6, 0, 0]} name="Converted" maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-2">
            {[{ color: 'bg-indigo-300', label: 'Referrals' }, { color: 'bg-emerald-400', label: 'Converted' }].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <span className={cn('w-2.5 h-2.5 rounded-full', l.color)} />
                <span className="text-xs text-slate-500 font-medium">{l.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Tier breakdown */}
        <Card>
          <CardHeader title="Tier Breakdown" subtitle="Member progression" />
          <div className="flex flex-col gap-3">
            {Object.entries(TIER_CONFIG).map(([tier, cfg]) => {
              const Icon = cfg.icon
              const count = tierCounts[tier] ?? 0
              return (
                <div key={tier} className={cn('flex items-center gap-3 p-3.5 rounded-xl border', cfg.bg, cfg.border)}>
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', cfg.bg)}>
                    <Icon size={17} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={cn('text-xs font-bold', cfg.color)}>{tier}</span>
                      <span className="text-xs font-semibold text-slate-600">{count} members</span>
                    </div>
                    <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', cfg.color.replace('text-', 'bg-'))} style={{ width: `${cfg.bar}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Members table */}
      <Card>
        <CardHeader title="All Members" subtitle={`${members.length} registered`} />
        {loading ? (
          <Spinner />
        ) : (
          <DataTable columns={columns} data={members} searchable searchKeys={['name', 'email', 'referral_code']} pageSize={10} />
        )}
      </Card>

      {/* Invite member modal */}
      {addOpen && (
        <InviteMemberModal
          onClose={() => setAddOpen(false)}
          onCreated={() => { setAddOpen(false); refetch() }}
        />
      )}
    </div>
  )
}
