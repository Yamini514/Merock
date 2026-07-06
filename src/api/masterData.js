import { api } from './client'

export const listMasterData    = (params)   => api.get('/master-data', params)
export const createMasterData  = (data)     => api.post('/master-data', data).then(r => r.data)
export const updateMasterData  = (id, data) => api.put(`/master-data/${id}`, data).then(r => r.data)
export const removeMasterData  = (id)       => api.del(`/master-data/${id}`)
export const restoreMasterData = (id)       => api.put(`/master-data/${id}/restore`).then(r => r.data)

// Convenience for forms: active values of one category as [{value,label}] options.
export const listOptions = (category) =>
  listMasterData({ category, page_size: 300 })
    .then(r => (r.data ?? []).map(i => ({ value: i.value, label: i.label })))
