import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendVerifyEmail: (data) => api.post('/auth/resend-verify-email', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  searchJobs: (params) => api.get('/jobs', { params }),
  getMyJobs: () => api.get('/jobs/my-jobs'),
  getById: (id) => api.get(`/jobs/${id}`),
  incrementViews: (id) => api.get(`/jobs/${id}/view`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
};

export const applicationsAPI = {
  getAll: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  create: (formData) =>
    api.post('/applications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
};

export const interviewsAPI = {
  getAll: () => api.get('/interviews'),
  getById: (id) => api.get(`/interviews/${id}`),
  create: (data) => api.post('/interviews', data),
  update: (id, data) => api.put(`/interviews/${id}`, data),
};

export const reportsAPI = {
  getStats: () => api.get('/reports/stats'),
  getJobStats: (id) => api.get(`/reports/jobs/${id}`),
};

// Saved Jobs
export const savedJobsAPI = {
  getAll: () => api.get('/saved-jobs'),
  save: (jobId) => api.post(`/saved-jobs/${jobId}`),
  unsave: (jobId) => api.delete(`/saved-jobs/${jobId}`),
  isSaved: (jobId) => api.get(`/saved-jobs/${jobId}/is-saved`),
};

// Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  uploadAvatar: (formData) =>
    api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updatePassword: (currentPassword, newPassword) =>
    api.put('/profile/password', { currentPassword, newPassword }),
};

// Notifications
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getJobs: (params) => api.get('/admin/jobs', { params }),
  approveJob: (id) => api.put(`/admin/jobs/${id}/approve`),
  rejectJob: (id, reason) => api.put(`/admin/jobs/${id}/reject`, { reason }),
  getReports: () => api.get('/admin/reports'),
  getOTPs: (params) => api.get('/admin/otps', { params }),
};

export default api;
