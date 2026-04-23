import axios from 'axios';

const API_URL = '/api';

// ─── Khởi tạo axios ─────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── State cho refresh token ─────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ─── Request interceptor: thêm token ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: xử lý lỗi 401 + auto-refresh ────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa thử refresh, và không phải request /refresh
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Đang trong quá trình refresh → queue request lại
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh thất bại → clear hết token + thông báo
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Gửi sự kiện để các component lắng nghe
        window.dispatchEvent(new CustomEvent('session-expired'));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Các lỗi 401 khác (NO_TOKEN, USER_NOT_FOUND, INVALID_TOKEN)
    if (error.response?.status === 401 && error.response?.data?.code !== 'TOKEN_EXPIRED') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('session-expired'));
    }

    return Promise.reject(error);
  }
);

// ─── API functions ────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendVerifyEmail: (data) => api.post('/auth/resend-verify-email', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  revokeAllTokens: () => api.post('/auth/revoke-all-tokens'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
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

export const savedJobsAPI = {
  getAll: () => api.get('/saved-jobs'),
  save: (jobId) => api.post(`/saved-jobs/${jobId}`),
  unsave: (jobId) => api.delete(`/saved-jobs/${jobId}`),
  isSaved: (jobId) => api.get(`/saved-jobs/${jobId}/is-saved`),
};

export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  uploadAvatar: (formData) =>
    api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadResume: (formData) =>
    api.post('/profile/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updatePassword: (currentPassword, newPassword) =>
    api.put('/profile/password', { currentPassword, newPassword }),
};

export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getJobs: (params) => api.get('/admin/jobs', { params }),
  approveJob: (id) => api.put(`/admin/jobs/${id}/approve`),
  rejectJob: (id, reason) => api.put(`/admin/jobs/${id}/reject`, { reason }),
  lockJob: (id, reason) => api.put(`/admin/jobs/${id}/lock`, { reason }),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
  getReports: () => api.get('/admin/reports'),
  getOTPs: (params) => api.get('/admin/otps', { params }),
};

export default api;