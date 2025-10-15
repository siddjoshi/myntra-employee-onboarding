import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (userData: any) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.patch('/auth/profile', data),
};

// Tasks API
export const tasksAPI = {
  getTasks: (params?: any) => api.get('/tasks', { params }),
  getTask: (id: string) => api.get(`/tasks/${id}`),
  createTask: (data: any) => api.post('/tasks', data),
  updateTaskStatus: (id: string, data: any) => api.patch(`/tasks/${id}/status`, data),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  getUserTasks: (userId: string) => api.get(`/tasks/user/${userId}`),
};

// Documents API
export const documentsAPI = {
  uploadDocument: (formData: FormData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getDocuments: () => api.get('/documents'),
  getUserDocuments: (userId: string) => api.get(`/documents/user/${userId}`),
  verifyDocument: (id: string, data: any) => api.patch(`/documents/${id}/verify`, data),
  deleteDocument: (id: string) => api.delete(`/documents/${id}`),
};

// Training API
export const trainingAPI = {
  getModules: () => api.get('/training'),
  getModule: (id: string) => api.get(`/training/${id}`),
  createModule: (data: any) => api.post('/training', data),
  updateProgress: (id: string, data: any) => api.post(`/training/${id}/progress`, data),
  getUserProgress: (userId: string) => api.get(`/training/user/${userId}/progress`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getNewHires: () => api.get('/dashboard/new-hires'),
  getHRStats: () => api.get('/dashboard/hr-stats'),
  assignManagerBuddy: (userId: string, data: any) => api.patch(`/dashboard/assign/${userId}`, data),
};

export default api;
