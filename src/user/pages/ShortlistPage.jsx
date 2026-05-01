import { useNavigate } from 'react-router-dom'
import { Heart, ArrowRight, Trash2 } from 'lucide-react'
import { useShortlist } from '../../hooks/useShortlist'
import { USER_PROPERTIES } from '../../mock-data/userProperties'
import PropertyCard from '../components/PropertyCard'

export default function ShortlistPage() {
  const navigate = useNavigate()
  const { shortlist, clear } = useShortlist()
  const saved = USER_PROPERTIES.filter(p => shortlist.includes(p.id))

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
              onClick={clear}
              className="flex items-center gap-2 px-4 py-2.5 border border-rose-200 text-rose-600 rounded-xl text-sm font-semibold hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>

        {saved.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-24 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mb-5">
              <Heart className="w-10 h-10 text-rose-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Your shortlist is empty</h2>
            <p className="text-slate-400 text-sm mb-8 max-w-xs">
              Save properties you love by clicking the heart icon on any listing.
            </p>
            <button
              onClick={() => navigate('/properties')}
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
