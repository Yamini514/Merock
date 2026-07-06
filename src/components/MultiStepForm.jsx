import { cn } from '../utils/cn'
import { Check } from 'lucide-react'
import Button from './Button'

export function StepIndicator({ steps, currentStep }) {
  return (
    <div>
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
                {/* Per-step labels collide at narrow widths — shown only from sm up;
                    mobile gets a single summary line below instead. */}
                <span className={cn(
                  'hidden sm:block text-xs font-medium whitespace-nowrap',
                  active ? 'text-indigo-700' : done ? 'text-slate-700' : 'text-slate-400'
                )}>
                  {step}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-3 sm:mb-5 rounded-full transition-all duration-500',
                  done ? 'bg-indigo-500' : 'bg-slate-200'
                )} />
              )}
            </div>
          )
        })}
      </div>
      <p className="sm:hidden text-center text-xs font-semibold text-indigo-700 mt-3">
        Step {currentStep + 1} of {steps.length} — {steps[currentStep]}
      </p>
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
      <Button type="button" variant="secondary" onClick={onBack} disabled={isFirst}>
        ← Back
      </Button>
      {isLast ? (
        <Button type="button" onClick={onSubmit} disabled={loading}>
          {loading ? 'Saving…' : 'Submit →'}
        </Button>
      ) : (
        <Button type="button" onClick={onNext}>
          {nextLabel} →
        </Button>
      )}
    </div>
  )
}
