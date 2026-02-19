// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kpark_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kpark_token');
      localStorage.removeItem('kpark_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.patch('/auth/update-password', data),
};

// ── Slots
export const slotAPI = {
  getAll: (params) => api.get('/slots', { params }),
  getOne: (id) => api.get(`/slots/${id}`),
  create: (data) => api.post('/slots', data),
  update: (id, data) => api.patch(`/slots/${id}`, data),
  delete: (id) => api.delete(`/slots/${id}`),
};

// ── Bookings
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMy: (params) => api.get('/bookings/my', { params }),
  getAll: (params) => api.get('/bookings/all', { params }),
  getOne: (id) => api.get(`/bookings/${id}`),
  markArrival: (id) => api.patch(`/bookings/${id}/mark-arrival`),
  extend: (id, data) => api.patch(`/bookings/${id}/extend`, data),
  cancel: (id, data) => api.patch(`/bookings/${id}/cancel`, data),
};

// ── Waitlist
export const waitlistAPI = {
  join: (data) => api.post('/waitlist', data),
  getMy: () => api.get('/waitlist/my'),
  getAll: (params) => api.get('/waitlist/all', { params }),
  leave: (id) => api.delete(`/waitlist/${id}`),
  confirm: (id) => api.post(`/waitlist/${id}/confirm`),
};

// ── Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  overrideBooking: (id, data) => api.patch(`/admin/bookings/${id}/override`, data),
  getOccupancy: (params) => api.get('/admin/analytics/occupancy', { params }),
};

export default api;
