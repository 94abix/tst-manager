/**
 * Client HTTP Axios - Configuration API
 * Axios HTTP Client - API Configuration
 *
 * @module services/api
 * @author Renault Group - Service 00596
 */

import axios from 'axios';

// URL de base de l'API / API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Instance Axios configurée / Configured Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur de requête - Ajoute le token JWT
// Request interceptor - Add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tst_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Gère les erreurs globales
// Response interceptor - Handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expiré ou invalide / Expired or invalid token
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.error;

      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_INVALID') {
        localStorage.removeItem('tst_token');
        localStorage.removeItem('tst_user');
        window.location.href = '/login?expired=true';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ============================================
// SERVICES API SPÉCIFIQUES
// ============================================

/**
 * Service d'authentification
 * Authentication service
 */
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  refreshToken: () => api.post('/auth/refresh'),
  listUsers: () => api.get('/auth/users')
};

/**
 * Service des intervenants
 * Interveners service
 */
export const intervenersAPI = {
  getAll: (params) => api.get('/interveners', { params }),
  getById: (id) => api.get(`/interveners/${id}`),
  create: (data) => api.post('/interveners', data),
  update: (id, data) => api.put(`/interveners/${id}`, data),
  delete: (id) => api.delete(`/interveners/${id}`),
  getByHabilitation: (type) => api.get(`/interveners/habilitation/${type}`),
  getCompanies: () => api.get('/interveners/companies'),
  getHabilitationTypes: () => api.get('/interveners/habilitations')
};

/**
 * Service des fiches TST
 * TST forms service
 */
export const tstAPI = {
  getAll: (params) => api.get('/tst', { params }),
  getById: (id) => api.get(`/tst/${id}`),
  create: (data) => api.post('/tst', data),
  update: (id, data) => api.put(`/tst/${id}`, data),
  delete: (id) => api.delete(`/tst/${id}`),
  startWork: (id, data) => api.post(`/tst/${id}/start`, data),
  endWork: (id, data) => api.post(`/tst/${id}/end`, data),
  archive: (id) => api.post(`/tst/${id}/archive`),
  getAuditHistory: (id) => api.get(`/tst/${id}/audit`),
  getStatistics: () => api.get('/tst/stats'),
  downloadPDF: (id) => api.get(`/tst/${id}/pdf`, { responseType: 'blob' }),
  previewPDF: (id) => `${API_BASE_URL}/tst/${id}/pdf/preview`
};
