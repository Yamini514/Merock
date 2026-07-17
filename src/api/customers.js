import { api } from './client'

export const listCustomers  = (params)   => api.get('/customers', params)
export const getCustomer    = (id)       => api.get(`/customers/${id}`).then(r => r.data)
export const createCustomer = (data)     => api.post('/customers', data).then(r => r.data)
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data).then(r => r.data)
export const deleteCustomer = (id)       => api.del(`/customers/${id}`)

// Portal user's shortlist (stored on their linked Customer profile)
export const getMySaved  = ()   => api.get('/me/saved').then(r => r.data)
export const toggleSaved = (id) => api.put(`/me/saved/${id}`).then(r => r.data)

// Portal user's own enquiry/requirement history
export const getMyEnquiries = () => api.get('/me/enquiries').then(r => r.data)

// Requirements (nested under a customer)
export const listRequirements  = (customerId)       => api.get(`/customers/${customerId}/requirements`).then(r => r.data)
export const createRequirement = (customerId, data) => api.post(`/customers/${customerId}/requirements`, data).then(r => r.data)
export const updateRequirement = (id, data)         => api.put(`/requirements/${id}`, data).then(r => r.data)
export const deleteRequirement = (id)               => api.del(`/requirements/${id}`)
