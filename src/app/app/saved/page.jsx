'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, ArrowRight, Trash2, AlertCircle } from 'lucide-react'
import { getMySaved, toggleSaved } from '../../../api/customers'
import { useApi } from '../../../hooks/useApi'
import PropertyCard from '../../../user/components/PropertyCard'

export default function ShortlistPage() {
  const router = useRouter()
  const [clearing, setClearing] = useState(false)

  const fetcher = useCallback(() => getMySaved(), [])
  const { data, loading, error, refetch } = useApi(fetcher, [])
  const saved = data?.properties ?? []

  async function clearAll() {
    setClearing(true)
    try {
      await Promise.all((data?.ids ?? []).map(id => toggleSaved(id)))
    } finally {
      setClearing(false)
      refetch()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Shortlist</h1>
            <p className="text-slate-500 text-sm mt-1">{saved.length} saved {saved.length === 1 ? 'property' : 'properties'}</p>
          </div>
          {saved.length > 0 && (
            <button
              onClick={clearAll}
              disabled={clearing}
              className="flex items-center gap-2 px-4 py-2.5 border border-rose-200 text-rose-600 rounded-xl text-sm font-semibold hover:bg-rose-50 transition-colors disabled:opacity-60"
            >
              <Trash2 className="w-4 h-4" /> {clearing ? 'Clearing…' : 'Clear All'}
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 mb-5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
            <AlertCircle size={16} /> {error.message}
          </div>
        )}

        {loading ? (
          <div className="py-24 flex justify-center">
            <span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : saved.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-24 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mb-5">
              <Heart className="w-10 h-10 text-rose-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Your shortlist is empty</h2>
            <p className="text-slate-400 text-sm mb-8 max-w-xs">
              Save properties you love by clicking the heart icon on any listing.
            </p>
            <button
              onClick={() => router.push('/properties')}
              className="flex items-center gap-2 px-7 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
            >
              Browse Properties <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {saved.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
