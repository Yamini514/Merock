'use client'

import { useState, useCallback } from 'react'
import Modal from '../../../../components/Modal'
import Select from '../../../../components/Select'
import FormInput from '../../../../components/FormInput'
import Button from '../../../../components/Button'
import ErrorBanner from '../../../../components/ErrorBanner'
import FilterPills from '../../../../components/FilterPills'
import { listCustomers, getCustomer, createRequirement } from '../../../../api/customers'
import { listProperties } from '../../../../api/properties'
import { createMatch } from '../../../../api/matches'
import { useApi } from '../../../../hooks/useApi'
import { COLUMNS } from './columns'

export default function LogEnquiryModal({ onClose, onCreated }) {
  const [customerId, setCustomerId] = useState('')
  const [propertyId, setPropertyId] = useState('')
  const [status, setStatus] = useState('New')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const customersFetcher = useCallback(() => listCustomers({ page_size: 300 }), [])
  const { data: customersData } = useApi(customersFetcher, [])
  const customers = customersData?.data ?? []

  const propertiesFetcher = useCallback(() => listProperties({ page_size: 300 }), [])
  const { data: propertiesData } = useApi(propertiesFetcher, [])
  const properties = propertiesData?.data ?? []

  async function handleSave() {
    if (!customerId || !propertyId) { setErr('Select a client and a property.'); return }
    setSaving(true)
    setErr('')
    try {
      const customer = await getCustomer(customerId)
      let requirementId = customer.primary_requirement?.id
      if (!requirementId) {
        const req = await createRequirement(customerId, { transaction_type: 'buy', status: 'open' })
        requirementId = req.id
      }
      await createMatch({ requirement_id: requirementId, property_id: propertyId, status, notes: notes || null })
      onCreated()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Log New Enquiry"
      subtitle="Manually record a client's interest in a property"
      size="md"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Enquiry'}</Button></>}
    >
      <div className="flex flex-col gap-3.5">
        <ErrorBanner message={err} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select label="Client" value={customerId} onChange={e => setCustomerId(e.target.value)}
            options={[{ value: '', label: 'Select client…' }, ...customers.map(c => ({ value: c.id, label: c.name }))]} />
          <Select label="Property" value={propertyId} onChange={e => setPropertyId(e.target.value)}
            options={[{ value: '', label: 'Select property…' }, ...properties.map(p => ({ value: p.id, label: p.title }))]} />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Status</label>
          <FilterPills
            options={COLUMNS.map(c => ({ value: c.id, label: c.label }))}
            value={status}
            onChange={setStatus}
          />
        </div>

        <FormInput label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add a note about this enquiry…" />
      </div>
    </Modal>
  )
}
