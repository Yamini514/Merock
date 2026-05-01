import { useState, useEffect } from 'react'
import { X, Phone, Mail, MessageSquare, Star, CheckCircle, Send } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function EnquiryModal({ property, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!/^\+?[\d\s\-]{10,}$/.test(form.phone)) e.phone = 'Enter valid phone'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter valid email'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  const agent = property?.agent

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Contact Agent</h2>
            {property && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{property.title}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="px-5 py-12 flex flex-col items-center text-center animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Enquiry Sent!</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs">
              {agent?.name || 'The agent'} will contact you within 2 hours. Check your phone for a confirmation.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="px-5 py-4">
            {/* Agent Card */}
            {agent && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                  {agent.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn('w-3 h-3', i < Math.floor(agent.rating || 4) ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">{agent.deals || 40}+ deals</span>
                  </div>
                </div>
                <a
                  href={`tel:${agent.phone}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Your full name *"
                  value={form.name}
                  onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })) }}
                  className={cn(
                    'w-full px-3.5 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all',
                    errors.name
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-400'
                  )}
                />
                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="Phone number *"
                  value={form.phone}
                  onChange={e => { setForm(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: '' })) }}
                  className={cn(
                    'w-full px-3.5 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all',
                    errors.phone
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-400'
                  )}
                />
                {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email address (optional)"
                  value={form.email}
                  onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })) }}
                  className={cn(
                    'w-full px-3.5 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all',
                    errors.email
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-400'
                  )}
                />
                {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
              </div>

              <textarea
                placeholder="I'm interested in this property and would like more information..."
                rows={3}
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                className="w-full px-3.5 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none transition-all"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Enquiry
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-400">
                By submitting, you agree to our{' '}
                <a href="#" className="text-indigo-500 underline">Terms</a> and{' '}
                <a href="#" className="text-indigo-500 underline">Privacy Policy</a>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
