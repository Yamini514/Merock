import { cn } from '../utils/cn'
import { Check } from 'lucide-react'

export function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, i) => {
        const done   = i < currentStep
        const active = i === currentStep
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none min-w-0">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center font-semibold border-2 transition-all duration-300',
                done   && 'bg-indigo-600 border-indigo-600 text-white',
                active && 'bg-white border-indigo-600 text-indigo-600 shadow-md shadow-indigo-100',
                !done && !active && 'bg-white border-slate-200 text-slate-400'
              )}>
                {done ? <Check size={16} strokeWidth={3} /> : <span className="text-sm">{i + 1}</span>}
              </div>
              <span className={cn(
                'text-xs font-medium whitespace-nowrap',
                active ? 'text-indigo-700' : done ? 'text-slate-700' : 'text-slate-400'
              )}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-3 mb-5 rounded-full transition-all duration-500',
                done ? 'bg-indigo-500' : 'bg-slate-200'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function MultiStepForm({ steps, currentStep, children }) {
  return (
    <div className="flex flex-col gap-8">
      <StepIndicator steps={steps} currentStep={currentStep} />
      <div className="animate-slide-up">{children}</div>
    </div>
  )
}

export function StepActions({ onBack, onNext, onSubmit, isLast, isFirst, loading, nextLabel = 'Continue' }) {
  return (
    <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-6">
      <button
        type="button"
        onClick={onBack}
        disabled={isFirst}
        className={cn(
          'px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl',
          'hover:bg-slate-50 transition-colors',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
      >
        ← Back
      </button>
      {isLast ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="px-6 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-all shadow-sm shadow-indigo-600/20"
        >
          {loading ? 'Saving…' : 'Submit →'}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20"
        >
          {nextLabel} →
        </button>
      )}
    </div>
  )
}
