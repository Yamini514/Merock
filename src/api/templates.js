import { api } from './client'

export const listTemplates   = (params)   => api.get('/notification-templates', params)
export const createTemplate  = (data)     => api.post('/notification-templates', data).then(r => r.data)
export const updateTemplate  = (id, data) => api.put(`/notification-templates/${id}`, data).then(r => r.data)
export const removeTemplate  = (id)       => api.del(`/notification-templates/${id}`)

// Notification Center (super admin): delivery monitor + retry.
export const listOutbox      = (params)   => api.get('/alerts/outbox', params)
export const retryDelivery   = (id)       => api.post(`/alerts/${id}/retry`).then(r => r.data)
