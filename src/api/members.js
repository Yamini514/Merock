import { api } from './client'

export const listMembers  = (params)   => api.get('/members', params)
export const getMember    = (id)       => api.get(`/members/${id}`).then(r => r.data)
export const createMember = (data)     => api.post('/members', data).then(r => r.data)
export const updateMember = (id, data) => api.put(`/members/${id}`, data).then(r => r.data)
export const deleteMember = (id)       => api.del(`/members/${id}`)
export const recalculateTiers = ()     => api.post('/members/recalculate-tiers').then(r => r.data)
