import { api } from './client'

export const listAlerts     = (params) => api.get('/alerts', params).then(r => r.data)
export const getAlert       = (id)     => api.get(`/alerts/${id}`).then(r => r.data)
export const createAlert    = (data)   => api.post('/alerts', data).then(r => r.data)
export const markAlertRead  = (id)     => api.put(`/alerts/${id}`).then(r => r.data)
export const markAllAlertsRead = ()    => api.put('/alerts/mark-all-read')
export const dismissAlert   = (id)     => api.del(`/alerts/${id}`)
