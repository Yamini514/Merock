'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Users, TrendingUp, Shield, Heart, MapPin, ArrowRight } from 'lucide-react'
import { getSiteStats } from '../../../api/properties'
import { useApi } from '../../../hooks/useApi'
import { formatNumber } from '../../../utils/formatters'

const TEAM = [
  { name: 'Suresh Reddy',   role: 'CEO & Founder',    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80', exp: '18 yrs' },
  { name: 'Anita Sharma',   role: 'Head of Sales',    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80', exp: '12 yrs' },
  { name: 'Kiran Babu',     role: 'Lead Architect',   img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', exp: '14 yrs' },
  { name: 'Meena Iyer',     role: 'Client Relations', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80', exp: '9 yrs' },
]

const VALUES = [
  { icon: Shield,    title: 'Transparency',  desc: 'Every listing is verified. Every price is fair. No hidden fees, ever.' },
  { icon: Heart,     title: 'Client First',  desc: 'We put your needs at the center of every decision we make.' },
  { icon: TrendingUp, title: 'Innovation',   desc: 'Leveraging AI and data to surface the best deals for you, faster.' },
]

const MILESTONES = [
  { year: '2014', event: 'Founded in Hyderabad with a 3-person team' },
  { year: '2017', event: 'Crossed 1,000 verified listings' },
  { year: '2020', event: 'Expanded to 10 cities across South India' },
  { year: '2022', event: 'Launched client matching AI algorithm' },
  { year: '2024', event: '10,000+ listings, 500+ agents, 25 cities' },
]

export default function AboutPage() {
  const router = useRouter()

  const statsFetcher = useCallback(() => getSiteStats(), [])
  const { data: stats } = useApi(statsFetcher, [])
  const siteStats = {
    listings: stats?.listings ?? 0,
    cities: stats?.cities ?? 0,
    agents: stats?.agents ?? 0,
    happy_clients: stats?.happy_clients ?? 0,
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-5">
            <Building2 className="w-3.5 h-3.5" /> Est. 2014 · Hyderabad
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-5 max-w-2xl mx-auto">
            We Help People Find{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Homes, Not Just Houses
            </span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-xl mx-auto mb-8">
            Rerock Realty is India's most trusted property platform — combining expert agents, verified listings, and smart technology to make every property transaction smooth and transparent.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => router.push('/properties')} className="flex items-center gap-2 px-7 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20">
              Browse Properties <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => router.push('/contact')} className="flex items-center gap-2 px-7 py-3.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: `${formatNumber(siteStats.listings)}+`,      label: 'Active Listings', icon: Building2 },
            { value: `${formatNumber(siteStats.agents)}+`,        label: 'Verified Agents', icon: Users },
            { value: `${formatNumber(siteStats.cities)}+`,        label: 'Cities Covered',  icon: MapPin },
            { value: `${formatNumber(siteStats.happy_clients)}+`, label: 'Happy Clients',   icon: Heart },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-indigo-600/30 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-indigo-300" />
                </div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-slate-400 text-xs">{s.label}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Story */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-indigo-600 text-sm font-semibold mb-2">Our Story</p>
            <h2 className="text-3xl font-bold text-slate-900 mb-5">From a Garage to India's Premier Realty Platform</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              Rerock started in 2014 when Suresh Reddy, frustrated by opaque property dealings, decided to build a platform where every listing was verified and every buyer was treated fairly. What began as a 3-person team in Hyderabad has grown into a 300-employee company serving 25 cities across India.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed">
              Today, Rerock processes over 500 enquiries a day, has helped 50,000+ families find their dream homes, and continues to innovate with AI-powered matching that reduces the time to close a deal by 60%.
            </p>

            <div className="mt-8 space-y-3">
              {MILESTONES.map(m => (
                <div key={m.year} className="flex items-start gap-4">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg shrink-0">{m.year}</span>
                  <p className="text-sm text-slate-600">{m.event}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80" alt="" className="rounded-2xl h-52 w-full object-cover col-span-2" />
              <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&q=80" alt="" className="rounded-2xl h-40 w-full object-cover" />
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80" alt="" className="rounded-2xl h-40 w-full object-cover" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-indigo-600 text-white rounded-2xl p-4 shadow-xl">
              <p className="text-2xl font-bold">10+</p>
              <p className="text-indigo-200 text-xs">Years of Trust</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-indigo-600 text-sm font-semibold mb-2">What We Stand For</p>
            <h2 className="text-3xl font-bold text-slate-900">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map(v => {
              const Icon = v.icon
              return (
                <div key={v.title} className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{v.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-indigo-600 text-sm font-semibold mb-2">The People Behind Rerock</p>
          <h2 className="text-3xl font-bold text-slate-900">Meet Our Leadership</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {TEAM.map(person => (
            <div key={person.name} className="group text-center">
              <div className="relative mb-4 mx-auto w-28 h-28 rounded-2xl overflow-hidden shadow-md">
                <img src={person.img} alt={person.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="font-semibold text-slate-800 text-sm">{person.name}</p>
              <p className="text-indigo-600 text-xs mt-0.5 font-medium">{person.role}</p>
              <p className="text-slate-400 text-xs mt-0.5">{person.exp} experience</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-indigo-600 to-violet-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-indigo-200 text-sm mb-8 leading-relaxed">
            {siteStats.happy_clients > 0
              ? `Join ${formatNumber(siteStats.happy_clients)}+ happy homeowners who trusted Rerock for their property journey.`
              : 'Trusted by homeowners for a transparent, expert-guided property journey.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => router.push('/properties')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-indigo-700 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-lg">
              Browse Properties <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => router.push('/contact')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-white/15 text-white rounded-xl font-semibold text-sm hover:bg-white/25 transition-colors border border-white/30">
              Talk to an Agent
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
