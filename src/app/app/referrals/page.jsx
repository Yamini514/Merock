'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Copy, CheckCircle, Users, IndianRupee,
  Clock, ArrowRight, Building2, ExternalLink, AlertCircle
} from 'lucide-react'
import { getMyReferrals } from '../../../api/referrals'
import { useApi } from '../../../hooks/useApi'
import { formatDate } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'

const STATUS_STYLES = {
  New:          'bg-slate-100 text-slate-600',
  Reviewed:     'bg-sky-100 text-sky-700',
  Contacted:    'bg-blue-100 text-blue-700',
  Qualified:    'bg-violet-100 text-violet-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Converted:    'bg-emerald-100 text-emerald-700',
  Rejected:     'bg-rose-100 text-rose-700',
  Duplicate:    'bg-slate-100 text-slate-500',
}

const PENDING_STATUSES = ['New', 'Reviewed', 'Contacted', 'Qualified', 'In Progress']

export default function MemberReferralsPage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const fetcher = useCallback(() => getMyReferrals(), [])
  const { data, loading, error } = useApi(fetcher, [])

  const member = data?.member
  const referrals = data?.referrals ?? []
  const code = member?.referral_code
  const converted = referrals.filter(r => r.status === 'Converted').length
  const pending = referrals.filter(r => PENDING_STATUSES.includes(r.status)).length
  const totalEarned = member?.total_earnings ?? 0

  function copy() {
    if (!code) return
    navigator.clipboard?.writeText(`https://rerockrealty.com?ref=${code}`).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 pt-20 flex justify-center">
      <span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mt-16" />
    </div>
  )

  if (error || !member) return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center gap-3 text-center">
        <AlertCircle size={28} className="text-slate-300" />
        <p className="text-slate-500 text-sm">{error?.message || 'No member profile is linked to this account yet. Contact your admin.'}</p>
      </div>
    </div>
  )

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
              <div className="flex items-center gap-2 mb-1">
                <p className="text-indigo-200 text-sm">Your Referral Code</p>
                <span className="text-[10px] font-bold uppercase tracking-wide bg-white/20 rounded-full px-2 py-0.5">{member.tier}</span>
              </div>
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
                https://rerockrealty.com?ref={code}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push('/properties')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors shadow-sm"
              >
                <ExternalLink className="w-4 h-4" /> Browse to Refer
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
          {[
            { label: 'Total Referrals', value: referrals.length,   icon: Users,       color: 'bg-indigo-50 text-indigo-600' },
            { label: 'Converted',       value: converted,          icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Pending',         value: pending,            icon: Clock,       color: 'bg-amber-50 text-amber-600' },
            { label: 'Earned',          value: `₹${(totalEarned / 1000).toFixed(0)}K`, icon: IndianRupee, color: 'bg-violet-50 text-violet-600' },
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
              { step: '3', title: 'You earn',        desc: 'Earn a commission when the deal closes successfully.' },
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
            <span className="text-xs text-slate-400">{referrals.length} referrals</span>
          </div>

          {referrals.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">No referrals logged yet. Share your code to get started.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {referrals.map(ref => (
                <div key={ref.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{ref.property_title || 'Referral'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {ref.customer_name ? <>Referred <span className="font-medium text-slate-600">{ref.customer_name}</span> · </> : null}
                      {formatDate(ref.date || ref.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {ref.status === 'Converted' && ref.closure_value > 0 && (
                      <span className="text-sm font-bold text-emerald-600">+₹{ref.closure_value.toLocaleString('en-IN')}</span>
                    )}
                    <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', STATUS_STYLES[ref.status] || 'bg-slate-100 text-slate-600')}>
                      {ref.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

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
