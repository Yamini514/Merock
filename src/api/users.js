import { api } from './client'

// Super Admin only — internal staff/user management.
export const listUsers      = (params)   => api.get('/users', params)
export const getUser        = (id)       => api.get(`/users/${id}`).then(r => r.data)
export const createUser     = (data)     => api.post('/users', data).then(r => r.data)
export const updateUser     = (id, data) => api.put(`/users/${id}`, data).then(r => r.data)
export const deactivateUser = (id)       => api.del(`/users/${id}`)

// Staff-wide: minimal active-staff roster for assignment dropdowns.
export const listAgents     = ()         => api.get('/agents').then(r => r.data)
