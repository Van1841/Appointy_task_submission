import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
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

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Upload API calls
export const uploadAPI = {
  create: (data) => api.post('/uploads', data),
  uploadFile: (formData) => api.post('/uploads/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (params) => api.get('/uploads', { params }),
  getOne: (id) => api.get(`/uploads/${id}`),
  update: (id, data) => api.put(`/uploads/${id}`, data),
  delete: (id) => api.delete(`/uploads/${id}`),
  getTimeline: (params) => api.get('/uploads/timeline', { params })
};

// Search API calls
export const searchAPI = {
  search: (params) => api.get('/search', { params }),
  getSuggestions: (params) => api.get('/search/suggestions', { params })
};

// Thread API calls
export const threadAPI = {
  getAll: () => api.get('/threads'),
  getOne: (id) => api.get(`/threads/${id}`),
  create: (data) => api.post('/threads', data),
  update: (id, data) => api.put(`/threads/${id}`, data),
  delete: (id) => api.delete(`/threads/${id}`),
  addUpload: (id, uploadId) => api.post(`/threads/${id}/add`, { uploadId }),
  generateThreads: () => api.post('/threads/generate')
};

// Reflection API calls
export const reflectionAPI = {
  getAll: () => api.get('/reflections'),
  getLatest: () => api.get('/reflections/latest'),
  generate: (data) => api.post('/reflections/generate', data)
};

// Reminder API calls
export const reminderAPI = {
  getAll: (params) => api.get('/reminders', { params }),
  getOne: (id) => api.get(`/reminders/${id}`),
  create: (data) => api.post('/reminders', data),
  update: (id, data) => api.put(`/reminders/${id}`, data),
  delete: (id) => api.delete(`/reminders/${id}`)
};

export default api;
