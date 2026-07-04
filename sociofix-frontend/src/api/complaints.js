import api from './axios'

export const createComplaint = (formData) =>
  api.post('/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

// Admin/society-wide view with optional filters: status, priority, category, block, date, search
export const getAllComplaints = (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== 'all' && value != null)
  )
  return api.get('/complaints', { params: cleanParams })
}

export const getMyComplaints = () => api.get('/complaints/my')

export const getComplaintById = (complaintId) => api.get(`/complaints/${complaintId}`)

export const updateComplaint = (complaintId, payload) =>
  api.put(`/complaints/${complaintId}`, payload)

export const deleteComplaint = (complaintId) => api.delete(`/complaints/${complaintId}`)

export const updateComplaintStatus = (complaintId, status) =>
  api.patch(`/complaints/${complaintId}/status`, { status })

export const updateComplaintPriority = (complaintId, priority) =>
  api.patch(`/complaints/${complaintId}/priority`, { priority })
