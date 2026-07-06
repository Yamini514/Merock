'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Check, RefreshCw, Crown, Trophy, Award, Star } from 'lucide-react'
import PageHeader from '../../../../components/PageHeader'
import Card, { CardHeader } from '../../../../components/Card'
import FormInput, { Textarea } from '../../../../components/FormInput'
import Button from '../../../../components/Button'
import Spinner from '../../../../components/Spinner'
import ErrorBanner from '../../../../components/ErrorBanner'
import { listSettings, updateSettings } from '../../../../api/settings'
import { recalculateTiers } from '../../../../api/members'
import { useApi } from '../../../../hooks/useApi'
import { formatCurrency } from '../../../../utils/formatters'

const TIER_META = {
  Elite:  { icon: Crown,  color: 'text-violet-600' },
  Gold:   { icon: Trophy, color: 'text-yellow-600' },
  Silver: { icon: Award,  color: 'text-slate-500' },
}

const DEFAULT_RULES = [
  { tier: 'Elite',  min_count: 16, min_value: 500000 },
  { tier: 'Gold',   min_count: 8,  min_value: 200000 },
  { tier: 'Silver', min_count: 3,  min_value: 50000 },
]

const parseJson = (str, fallback) => { try { return JSON.parse(str) ?? fallback } catch { return fallback } }

export default function EliteTiersPage() {
  const fetcher = useCallback(() => listSettings(), [])
  const { data, loading, error, refetch } = useApi(fetcher, [])

  const [rules, setRules] = useState(DEFAULT_RULES)
  const [points, setPoints] = useState(10)
  const [rewardNotes, setRewardNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState('')
  const [saved, setSaved] = useState(false)
  const savedTimer = useRef(null)
  const [recalcBusy, setRecalcBusy] = useState(false)
  const [recalcMsg, setRecalcMsg] = useState('')

  // Live preview inputs
  const [previewCount, setPreviewCount] = useState(5)
  const [previewValue, setPreviewValue] = useState(100000)

  useEffect(() => {
    if (!data?.data) return
    const byKey = Object.fromEntries(data.data.map(s => [s.setting_key, s.value]))
    const parsed = parseJson(byKey['elite_tiers.rules'], null)
    // Hydrating a form from a completed fetch — same deliberate pattern as
    // AuthContext (set-state-in-effect is the intended behavior here).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRules(Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_RULES)
    setPoints(Number(byKey['elite_tiers.points_per_referral'] ?? 10))
    setRewardNotes(byKey['elite_tiers.reward_notes'] ?? '')
  }, [data])

  useEffect(() => () => clearTimeout(savedTimer.current), [])

  const setRule = (idx, field, value) => {
    setRules(rs => rs.map((r, i) => (i === idx ? { ...r, [field]: value } : r)))
    setSaved(false)
  }

  // Ordering rule: counts and values must both descend from Elite → Silver.
  const ordered = rules.every((r, i) =>
    i === 0 || (Number(rules[i - 1].min_count) > Number(r.min_count) && Number(rules[i - 1].min_value) > Number(r.min_value))
  )

  const previewTier = rules.find(r =>
    Number(previewCount) >= Number(r.min_count) || Number(previewValue) >= Number(r.min_value)
  )?.tier || 'Standard'

  const handleSave = async () => {
    if (!ordered) return
    setSaving(true)
    setSaveErr('')
    try {
      await updateSettings({
        'elite_tiers.rules': rules.map(r => ({
          tier: r.tier, min_count: Number(r.min_count) || 0, min_value: Number(r.min_value) || 0,
        })),
        'elite_tiers.points_per_referral': Number(points) || 0,
        'elite_tiers.reward_notes': rewardNotes,
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

  const handleRecalc = async () => {
    if (!window.confirm('Re-derive every active member’s tier from the current rules?')) return
    setRecalcBusy(true)
    setRecalcMsg('')
    setSaveErr('')
    try {
      const res = await recalculateTiers()
      setRecalcMsg(typeof res === 'string' ? res : 'Tiers recalculated.')
    } catch (err) {
      setSaveErr(err.message)
    } finally {
      setRecalcBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Elite Tier Configuration"
        subtitle="Thresholds and reward rules for referral membership tiers"
        breadcrumb={['Settings', 'Elite Tiers']}
        actions={
          <div className="flex items-center gap-3">
            {saved && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check size={13} /> Saved</span>}
            <Button variant="secondary" onClick={handleRecalc} loading={recalcBusy}>
              <RefreshCw size={13} /> Recalculate Tiers
            </Button>
            <Button onClick={handleSave} loading={saving} disabled={!ordered}>Save Changes</Button>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Tier Thresholds"
              subtitle="A member qualifies by referral count OR converted value — checked highest tier first"
            />
            <div className="flex flex-col gap-4">
              {rules.map((rule, idx) => {
                const meta = TIER_META[rule.tier] || { icon: Star, color: 'text-sky-600' }
                const Icon = meta.icon
                return (
                  <div key={rule.tier} className="grid grid-cols-1 sm:grid-cols-[9rem_1fr_1fr] items-end gap-4 pb-4 border-b border-slate-100 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2 pb-2.5">
                      <Icon size={16} className={meta.color} />
                      <span className="text-sm font-semibold text-slate-800">{rule.tier}</span>
                    </div>
                    <FormInput
                      label="Min. Referrals" id={`count-${rule.tier}`} type="number" inputMode="numeric" min="0"
                      value={rule.min_count}
                      onChange={e => setRule(idx, 'min_count', e.target.value)}
                    />
                    <FormInput
                      label="Min. Converted Value" id={`value-${rule.tier}`} type="number" inputMode="numeric" min="0" prefix="₹"
                      value={rule.min_value}
                      onChange={e => setRule(idx, 'min_value', e.target.value)}
                    />
                  </div>
                )
              })}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Star size={13} className="text-sky-500" />
                Members below the Silver thresholds are <span className="font-semibold text-slate-500">Standard</span>.
              </div>
              {!ordered && (
                <p className="text-xs text-rose-500">Thresholds must descend from Elite to Silver (both count and value).</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-100">
              <FormInput
                label="Points per Converted Referral" id="points" type="number" inputMode="numeric" min="0"
                value={points}
                onChange={e => { setPoints(e.target.value); setSaved(false) }}
                hint="Display-level reward points; no payment logic."
              />
              <Textarea
                label="Reward Rules / Notes" id="reward-notes" rows={2}
                value={rewardNotes}
                onChange={e => { setRewardNotes(e.target.value); setSaved(false) }}
                placeholder="e.g. Gold members get priority previews of new listings…"
              />
            </div>
          </Card>

          {/* Live preview — same dark side-panel pattern as the user form */}
          <Card className="bg-slate-900 border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-1">Tier Preview</h3>
            <p className="text-xs text-slate-400 mb-5">Where would a member land with these rules?</p>
            <div className="flex flex-col gap-4">
              <FormInput
                label={<span className="text-slate-300">Converted referrals</span>} id="preview-count"
                type="number" inputMode="numeric" min="0"
                value={previewCount} onChange={e => setPreviewCount(e.target.value)}
              />
              <FormInput
                label={<span className="text-slate-300">Total converted value</span>} id="preview-value"
                type="number" inputMode="numeric" min="0" prefix="₹"
                value={previewValue} onChange={e => setPreviewValue(e.target.value)}
              />
              <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">Resulting tier</p>
                <p className="text-lg font-bold text-white">{previewTier}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {Number(previewCount) || 0} referral(s) · {formatCurrency(Number(previewValue) || 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
