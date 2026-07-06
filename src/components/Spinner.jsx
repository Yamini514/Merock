import { cn } from '../utils/cn'

export default function Spinner({ className = 'py-20' }) {
  return (
    <div className={cn('flex justify-center', className)}>
      <span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )
}
