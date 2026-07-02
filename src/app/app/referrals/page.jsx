'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Share2, Copy, CheckCircle, TrendingUp, Users, IndianRupee,
  Clock, ArrowRight, Building2, ExternalLink
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { cn } from '../../../utils/cn'

const MOCK_REFERRALS = [
  { id: 'R001', property: 'Luxury 3BHK in Banjara Hills', referee: 'Suresh K.',    status: 'converted', date: '2024-04-10', commission: 15000 },
  { id: 'R002', property: 'Villa in Jubilee Hills',        referee: 'Anita M.',    status: 'pending',   date: '2024-04-08', commission: 0 },
  { id: 'R003', property: 'Studio in Gachibowli',          referee: 'Raj P.',      status: 'converted', date: '2024-04-05', commission: 4000 },
  { id: 'R004', property: '4BHK Penthouse Madhapur',       referee: 'Divya S.',    status: 'visited',   date: '2024-04-02', commission: 0 },
  { id: 'R005', property: '2BHK in Kondapur',              referee: 'Mohan R.',    status: 'converted', date: '2024-03-28', commission: 8000 },
]

const STATUS_STYLES = {
  pending:   'bg-amber-100 text-amber-700',
  visited:   'bg-blue-100 text-blue-700',
  converted: 'bg-emerald-100 text-emerald-700',
}

function RefCode({ user }) {
  const code = `MRK-${(user?.name || 'USER').split(' ')[0].toUpperCase().slice(0, 4)}${Math.abs(user?.email?.length * 17 % 900) + 100}`
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard?.writeText(`https://merockrealty.com?ref=${code}`).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return { code, copied, copy }
}

export default function MemberReferralsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { code, copied, copy } = RefCode({ user })

  const totalEarned = MOCK_REFERRALS.reduce((s, r) => s + r.commission, 0)
  const converted   = MOCK_REFERRALS.filter(r => r.status === 'converted').length
  const pending     = MOCK_REFERRALS.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Referrals</h1>
          <p className="text-slate-500 text-sm mt-0.5">Refer properties, earn commissions on every successful deal.</p>
        </div>

        {/* Referral Code Card */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-2xl p-6 mb-6 text-white overflow-hidden shadow-xl shadow-indigo-600/20">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-10 -left-4 w-32 h-32 bg-white/5 rounded-full" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="text-indigo-200 text-sm mb-1">Your Referral Code</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold font-mono tracking-wider">{code}</span>
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-sm font-semibold transition-all"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-indigo-200 text-xs mt-2 font-mono">
                https://merockrealty.com?ref={code}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push('/properties')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors shadow-sm"
              >
                <ExternalLink className="w-4 h-4" /> Browse to Refer
              </button>
              <p className="text-indigo-200 text-xs text-center">Earn up to ₹20,000/deal</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
          {[
            { label: 'Total Referrals', value: MOCK_REFERRALS.length, icon: Users,       color: 'bg-indigo-50 text-indigo-600' },
            { label: 'Converted',       value: converted,             icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Pending',         value: pending,               icon: Clock,       color: 'bg-amber-50 text-amber-600' },
            { label: 'Earned',          value: `₹${(totalEarned / 1000).toFixed(0)}K`,  icon: IndianRupee, color: 'bg-violet-50 text-violet-600' },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', s.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xl font-bold text-slate-900">{s.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
              </div>
            )
          })}
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-7">
          <h2 className="text-base font-bold text-slate-900 mb-4">How Referrals Work</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Share your link', desc: 'Send your referral link to friends looking for property.' },
              { step: '2', title: 'They enquire',    desc: 'When they submit an enquiry, your code is captured.' },
              { step: '3', title: 'You earn',        desc: 'Earn ₹4K–₹20K when the deal closes successfully.' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{s.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referral history */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Referral History</h2>
            <span className="text-xs text-slate-400">{MOCK_REFERRALS.length} referrals</span>
          </div>

          <div className="divide-y divide-slate-50">
            {MOCK_REFERRALS.map(ref => (
              <div key={ref.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{ref.property}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Referred to <span className="font-medium text-slate-600">{ref.referee}</span> · {ref.date}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {ref.commission > 0 && (
                    <span className="text-sm font-bold text-emerald-600">+₹{ref.commission.toLocaleString('en-IN')}</span>
                  )}
                  <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full capitalize', STATUS_STYLES[ref.status] || 'bg-slate-100 text-slate-600')}>
                    {ref.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Total commissions earned</span>
              <span className="font-bold text-indigo-700">₹{totalEarned.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-indigo-900 text-sm">Know someone looking for property?</p>
            <p className="text-indigo-600 text-xs mt-0.5">Share your link and earn when they close a deal.</p>
          </div>
          <button
            onClick={() => router.push('/properties')}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shrink-0"
          >
            Browse Properties <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
