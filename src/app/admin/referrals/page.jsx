'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Users, TrendingUp, IndianRupee, Share2, Plus, Star, Award, Trophy } from 'lucide-react'
import PageHeader from '../../../components/PageHeader'
import Card, { CardHeader } from '../../../components/Card'
import Badge from '../../../components/Badge'
import DataTable from '../../../components/DataTable'
import Avatar from '../../../components/Avatar'
import Button from '../../../components/Button'
import { REFERRAL_MEMBERS, REFERRAL_STATS } from '../../../mock-data/referrals'
import { formatCurrency } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'

const MONTHLY = [
  { month: 'Jan', referrals: 8,  converted: 3 },
  { month: 'Feb', referrals: 11, converted: 4 },
  { month: 'Mar', referrals: 15, converted: 7 },
  { month: 'Apr', referrals: 12, converted: 5 },
]

const TIER_CONFIG = {
  Gold:   { icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', bar: 100 },
  Silver: { icon: Award,  color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200',  bar: 66 },
  Bronze: { icon: Star,   color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', bar: 33 },
}

export default function Referrals() {
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
      key: 'referralCode', label: 'Code',
      render: v => <span className="font-mono text-xs bg-slate-100 text-indigo-700 px-2.5 py-1 rounded-xl font-semibold tracking-wide">{v}</span>,
    },
    { key: 'totalReferrals', label: 'Referrals', sortable: true },
    { key: 'converted', label: 'Converted', sortable: true },
    {
      key: 'earnings', label: 'Earnings', sortable: true,
      render: v => <span className="font-bold text-slate-800">{formatCurrency(v)}</span>,
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
        actions={<Button><Plus size={14} /> Invite Member</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: REFERRAL_STATS.totalMembers, icon: Users, color: 'indigo' },
          { label: 'Total Referrals', value: REFERRAL_STATS.totalReferrals, icon: Share2, color: 'sky' },
          { label: 'Converted', value: REFERRAL_STATS.converted, icon: TrendingUp, color: 'emerald' },
          { label: 'Earnings Paid', value: formatCurrency(REFERRAL_STATS.totalEarningsPaid), icon: IndianRupee, color: 'amber' },
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
            <BarChart data={MONTHLY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={6}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
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
              const count = REFERRAL_MEMBERS.filter(m => m.tier === tier).length
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
        <CardHeader title="All Members" subtitle={`${REFERRAL_MEMBERS.length} registered`} />
        <DataTable columns={columns} data={REFERRAL_MEMBERS} searchable searchKeys={['name', 'email', 'referralCode']} pageSize={10} />
      </Card>
    </div>
  )
}
