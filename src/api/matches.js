import { api } from './client'

export const listMatches      = (params)   => api.get('/matches', params)
export const getMatch         = (id)       => api.get(`/matches/${id}`).then(r => r.data)
export const createMatch      = (data)     => api.post('/matches', data).then(r => r.data)
export const updateMatch      = (id, data) => api.put(`/matches/${id}`, data).then(r => r.data)
export const deleteMatch      = (id)       => api.del(`/matches/${id}`)
export const recalculateMatches = ()       => api.post('/matches/recalculate').then(r => r.data)
export const bulkUpdateMatches  = (data)   => api.put('/matches/bulk', data).then(r => r.data)
