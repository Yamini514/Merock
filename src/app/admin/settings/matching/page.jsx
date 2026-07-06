'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Check, RefreshCw, SlidersHorizontal, Gauge } from 'lucide-react'
import PageHeader from '../../../../components/PageHeader'
import Card, { CardHeader } from '../../../../components/Card'
import FormInput from '../../../../components/FormInput'
import Select from '../../../../components/Select'
import Button from '../../../../components/Button'
import Spinner from '../../../../components/Spinner'
import ErrorBanner from '../../../../components/ErrorBanner'
import { listSettings, updateSettings } from '../../../../api/settings'
import { recalculateMatches } from '../../../../api/matches'
import { useApi } from '../../../../hooks/useApi'
import { cn } from '../../../../utils/cn'

const CRITERIA = [
  { key: 'location',      label: 'Location',              hint: 'Preferred location appears in the property location' },
  { key: 'budget',        label: 'Budget Fit',            hint: 'Property price within the stated budget range' },
  { key: 'property_type', label: 'Property Type',         hint: 'Exact property type preference' },
  { key: 'size',          label: 'Size / Configuration',  hint: 'Area range or bedroom count' },
  { key: 'intent',        label: 'Transaction Intent',    hint: 'Buy / rent / investment match' },
  { key: 'urgency',       label: 'Urgency / Availability', hint: 'Ready availability for urgent requirements' },
  { key: 'special',       label: 'Special Preferences',   hint: 'Amenities and other special needs' },
]

const BANDS = ['High', 'Medium', 'Low']
const DEFAULT_WEIGHTS = { location: 30, budget: 25, property_type: 15, size: 10, intent: 10, urgency: 5, special: 5 }
const DEFAULT_BANDS   = { High: 75, Medium: 50, Low: 25 }

const parseJson = (str, fallback) => { try { return JSON.parse(str) ?? fallback } catch { return fallback } }

export default function MatchingConfigPage() {
  const fetcher = useCallback(() => listSettings(), [])
  const { data, loading, error, refetch } = useApi(fetcher, [])

  const [weights, setWeights] = useState(DEFAULT_WEIGHTS)
  const [bands, setBands]     = useState(DEFAULT_BANDS)
  const [minScore, setMinScore] = useState(25)
  const [autoRecalc, setAutoRecalc] = useState('false')
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState('')
  const [saved, setSaved] = useState(false)
  const savedTimer = useRef(null)
  const [recalcMsg, setRecalcMsg] = useState('')
  const [recalcBusy, setRecalcBusy] = useState(false)

  useEffect(() => {
    if (!data?.data) return
    const byKey = Object.fromEntries(data.data.map(s => [s.setting_key, s.value]))
    // Hydrating a form from a completed fetch — same deliberate pattern as
    // AuthContext (set-state-in-effect is the intended behavior here).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWeights({ ...DEFAULT_WEIGHTS, ...parseJson(byKey['matching.weights'], {}) })
    setBands({ ...DEFAULT_BANDS, ...parseJson(byKey['matching.score_bands'], {}) })
    setMinScore(Number(byKey['matching.min_score'] ?? 25))
    setAutoRecalc(byKey['matching.auto_recalculate'] ?? 'false')
  }, [data])

  useEffect(() => () => clearTimeout(savedTimer.current), [])

  const total = CRITERIA.reduce((sum, c) => sum + (Number(weights[c.key]) || 0), 0)
  const bandsValid = Number(bands.High) > Number(bands.Medium) && Number(bands.Medium) > Number(bands.Low) && Number(bands.Low) > 0
  const valid = total === 100 && bandsValid

  const handleSave = async () => {
    if (!valid) return
    setSaving(true)
    setSaveErr('')
    try {
      await updateSettings({
        'matching.weights': Object.fromEntries(CRITERIA.map(c => [c.key, Number(weights[c.key]) || 0])),
        'matching.score_bands': Object.fromEntries(BANDS.map(b => [b, Number(bands[b]) || 0])),
        'matching.min_score': Number(minScore) || 0,
        'matching.auto_recalculate': autoRecalc,
      })
      await refetch()
      setSaved(true)
      savedTimer.current = setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setSaveErr(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRecalculate = async () => {
    if (!window.confirm('Re-score every open requirement against every available property now?')) return
    setRecalcBusy(true)
    setRecalcMsg('')
    setSaveErr('')
    try {
      const res = await recalculateMatches()
      setRecalcMsg(typeof res === 'string' ? res : 'Recalculation complete.')
    } catch (err) {
      setSaveErr(err.message)
    } finally {
      setRecalcBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Matching Configuration"
        subtitle="Scoring weights, score bands and automation for the matching engine"
        breadcrumb={['Settings', 'Matching']}
        actions={
          <div className="flex items-center gap-3">
            {saved && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check size={13} /> Saved</span>}
            <Button variant="secondary" onClick={handleRecalculate} loading={recalcBusy}>
              <RefreshCw size={13} /> Recalculate Now
            </Button>
            <Button onClick={handleSave} loading={saving} disabled={!valid}>Save Changes</Button>
          </div>
        }
      />

      <ErrorBanner message={error?.message || saveErr} />
      {recalcMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3">
          {recalcMsg}
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card>
            <CardHeader
              title={<span className="flex items-center gap-2"><SlidersHorizontal size={15} className="text-indigo-500" /> Scoring Weights</span>}
              subtitle="How much each criterion contributes to the match score"
              action={
                <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full',
                  total === 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600')}>
                  Total: {total} / 100
                </span>
              }
            />
            <div className="flex flex-col gap-4">
              {CRITERIA.map(c => (
                <div key={c.key} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">{c.label}</p>
                    <p className="text-xs text-slate-400 truncate">{c.hint}</p>
                  </div>
                  <input
                    type="range" min="0" max="50" value={Number(weights[c.key]) || 0}
                    onChange={e => { setWeights(w => ({ ...w, [c.key]: Number(e.target.value) })); setSaved(false) }}
                    className="w-32 sm:w-44 accent-indigo-600"
                  />
                  <FormInput
                    id={`w-${c.key}`} type="number" size="sm" wrapperClass="w-16 shrink-0"
                    inputMode="numeric" min="0" max="100"
                    value={weights[c.key] ?? 0}
                    onChange={e => { setWeights(w => ({ ...w, [c.key]: e.target.value })); setSaved(false) }}
                  />
                </div>
              ))}
              {total !== 100 && (
                <p className="text-xs text-rose-500">Weights must total exactly 100 before saving.</p>
              )}
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader
                title={<span className="flex items-center gap-2"><Gauge size={15} className="text-indigo-500" /> Score Bands</span>}
                subtitle="Minimum score for each band; anything below Low is Not Recommended"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {BANDS.map(b => (
                  <FormInput
                    key={b} label={`${b} ≥`} id={`band-${b}`} type="number" inputMode="numeric"
                    value={bands[b] ?? ''} min="1" max="100"
                    onChange={e => { setBands(v => ({ ...v, [b]: e.target.value })); setSaved(false) }}
                  />
                ))}
              </div>
              {!bandsValid && (
                <p className="text-xs text-rose-500 mt-3">Bands must descend: High &gt; Medium &gt; Low &gt; 0.</p>
              )}
            </Card>

            <Card>
              <CardHeader title="Automation" subtitle="How the engine behaves on data changes" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Minimum Score to Save a Match" id="min-score" type="number" inputMode="numeric"
                  value={minScore} min="0" max="100"
                  onChange={e => { setMinScore(e.target.value); setSaved(false) }}
                  hint="Pairs scoring below this are not stored."
                />
                <Select
                  label="Auto-recalculate" id="auto-recalc"
                  options={[{ value: 'false', label: 'Off — manual recalculation only' }, { value: 'true', label: 'On — rescore on property/requirement changes' }]}
                  value={autoRecalc}
                  onChange={e => { setAutoRecalc(e.target.value); setSaved(false) }}
                />
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
