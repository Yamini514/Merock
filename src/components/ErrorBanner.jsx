import { AlertCircle } from 'lucide-react'

export default function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
      <AlertCircle size={16} /> {message}
    </div>
  )
}
