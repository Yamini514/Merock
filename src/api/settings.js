import { api } from './client'

export const listSettings   = ()         => api.get('/settings')
export const updateSettings = (settings) => api.put('/settings', { settings })
export const getPublicSettings = ()      => api.get('/public/settings').then(r => r.data)
