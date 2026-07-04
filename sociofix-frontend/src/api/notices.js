import api from './axios'

export const getNotices = () => api.get('/notices')

export const getPinnedNotices = () => api.get('/notices/pinned')

export const createNotice = (payload) => api.post('/notices', payload)

export const updateNotice = (noticeId, payload) => api.put(`/notices/${noticeId}`, payload)

export const deleteNotice = (noticeId) => api.delete(`/notices/${noticeId}`)
