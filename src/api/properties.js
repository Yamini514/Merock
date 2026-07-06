import { api } from './client'

// Admin / authenticated catalogue
export const listProperties   = (params)     => api.get('/properties', params)
export const getProperty      = (id)         => api.get(`/properties/${id}`).then(r => r.data)
export const createProperty   = (data)       => api.post('/properties', data).then(r => r.data)
export const updateProperty   = (id, data)   => api.put(`/properties/${id}`, data).then(r => r.data)
export const deleteProperty   = (id)         => api.del(`/properties/${id}`)

// Public catalogue (no auth) — only published/available listings
export const listPublicProperties = (params) => api.get('/public/properties', params)
export const getPublicProperty    = (id)     => api.get(`/public/properties/${id}`).then(r => r.data)
export const getSiteStats         = ()       => api.get('/public/stats').then(r => r.data)

// Website lead capture (no auth). Pass `ref` to attribute a referral member.
export const createPublicEnquiry  = (data)   => api.post('/public/enquiries', data).then(r => r.data)
