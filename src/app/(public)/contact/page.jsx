'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, CheckCircle, Send, AlertCircle } from 'lucide-react'
import { createPublicEnquiry } from '../../../api/properties'
import { cn } from '../../../utils/cn'

const OFFICES = [
  { city: 'Hyderabad (HQ)', address: 'Plot 42, HITEC City, Madhapur', phone: '+91 40 4567 8900', email: 'hyd@rerockrealty.com' },
  { city: 'Bangalore',       address: '12th Floor, UB City, Vittal Mallya Rd', phone: '+91 80 4123 5600', email: 'blr@rerockrealty.com' },
  { city: 'Mumbai',          address: 'Bandra Kurla Complex, BKC', phone: '+91 22 6789 4500', email: 'mum@rerockrealty.com' },
]

const SUBJECTS = ['General Enquiry', 'Property Listing', 'Agent Partnership', 'Press & Media', 'Careers', 'Technical Support']

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!/^\+?[\d\s-]{10,}$/.test(form.phone)) e.phone = 'Valid phone required'
    if (!form.message.trim()) e.message = 'Required'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setApiError('')
    try {
      await createPublicEnquiry({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        message: [form.subject, form.message.trim()].filter(Boolean).join(': '),
      })
      setSubmitted(true)
    } catch (err) {
      setApiError(err.message || 'Could not send your message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-indigo-600 text-sm font-semibold mb-2">We'd love to hear from you</p>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Get in Touch</h1>
          <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
            Have a question about a property, want to list with us, or just want to say hello? We're here for you.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left info column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <h2 className="text-lg font-bold mb-1">Contact Information</h2>
              <p className="text-slate-400 text-sm mb-6">Reach us on any channel that's convenient.</p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-indigo-600/30 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4 text-indigo-300" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Toll-free</p>
                    <p className="text-sm font-semibold">1800-123-4567</p>
                    <p className="text-xs text-slate-500 mt-0.5">Mon–Sat, 9am – 7pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-indigo-600/30 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-indigo-300" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Email us</p>
                    <p className="text-sm font-semibold">hello@rerockrealty.com</p>
                    <p className="text-xs text-slate-500 mt-0.5">We respond within 4 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-indigo-600/30 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-indigo-300" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Working hours</p>
                    <p className="text-sm font-semibold">Mon – Sat: 9am – 7pm</p>
                    <p className="text-xs text-slate-500 mt-0.5">Sunday: 10am – 4pm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Offices */}
            <div className="space-y-3">
              {OFFICES.map(o => (
                <div key={o.city} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                    <p className="font-semibold text-slate-800 text-sm">{o.city}</p>
                  </div>
                  <p className="text-xs text-slate-500 mb-1.5">{o.address}</p>
                  <p className="text-xs text-slate-500">{o.phone}</p>
                  <p className="text-xs text-indigo-500">{o.email}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                  Thank you for reaching out. Our team will get back to you within 4 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}
                  className="mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Send us a Message</h2>
                <p className="text-slate-500 text-sm mb-6">Fill out the form and we'll be in touch shortly.</p>

                {apiError && (
                  <div className="flex items-center gap-2 px-3 py-2.5 mb-4 bg-rose-50 border border-rose-200 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <p className="text-xs text-rose-600 font-medium">{apiError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full name *</label>
                      <input
                        type="text"
                        placeholder="Ravi Kumar"
                        value={form.name}
                        onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })) }}
                        className={cn('w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all',
                          errors.name ? 'border-rose-300 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/20')}
                      />
                      {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address *</label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })) }}
                        className={cn('w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all',
                          errors.email ? 'border-rose-300 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/20')}
                      />
                      {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone number *</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={e => { setForm(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: '' })) }}
                        className={cn('w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all',
                          errors.phone ? 'border-rose-300 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/20')}
                      />
                      {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject</label>
                      <select
                        value={form.subject}
                        onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white"
                      >
                        <option value="">Select a subject</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Message *</label>
                    <textarea
                      rows={5}
                      placeholder="Tell us how we can help you..."
                      value={form.message}
                      onChange={e => { setForm(p => ({ ...p, message: e.target.value })); setErrors(p => ({ ...p, message: '' })) }}
                      className={cn('w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none',
                        errors.message ? 'border-rose-300 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/20')}
                    />
                    {errors.message && <p className="text-xs text-rose-500 mt-1">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-60 shadow-md shadow-indigo-600/20"
                  >
                    {loading
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><Send className="w-4 h-4" /> Send Message</>
                    }
                  </button>

                  <p className="text-center text-xs text-slate-400">
                    We respect your privacy. Your information will not be shared with third parties.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Map placeholder */}
        <div className="mt-8 h-56 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 text-sm font-medium">Interactive map would be embedded here</p>
            <p className="text-slate-400 text-xs mt-1">HITEC City, Madhapur, Hyderabad — 500081</p>
          </div>
        </div>
      </section>
    </div>
  )
}
