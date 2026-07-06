import { api } from './client'

export const listFollowUps   = (params)   => api.get('/follow-ups', params)
export const getFollowUp     = (id)       => api.get(`/follow-ups/${id}`).then(r => r.data)
export const createFollowUp  = (data)     => api.post('/follow-ups', data).then(r => r.data)
export const updateFollowUp  = (id, data) => api.put(`/follow-ups/${id}`, data).then(r => r.data)
export const deleteFollowUp  = (id)       => api.del(`/follow-ups/${id}`)
export const completeFollowUp = (id)      => api.put(`/follow-ups/${id}/complete`).then(r => r.data)
