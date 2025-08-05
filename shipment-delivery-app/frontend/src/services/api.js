import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred'
    
    // Don't show toast for certain routes or status codes
    const skipToast = error.config?.skipErrorToast || error.response?.status === 401
    
    if (!skipToast) {
      toast.error(message)
    }

    // If unauthorized, clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/updatedetails', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
  resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password }),
}

// Shipments API
export const shipmentsAPI = {
  getMyShipments: (params) => api.get('/shipments', { params }),
  getShipment: (id) => api.get(`/shipments/${id}`),
  createShipment: (data) => api.post('/shipments', data),
  trackShipment: (trackingNumber) => api.get(`/shipments/track/${trackingNumber}`),
  cancelShipment: (id) => api.put(`/shipments/${id}/cancel`),
  getAllShipments: (params) => api.get('/shipments/admin/all', { params }),
  updateShipmentStatus: (id, data) => api.put(`/shipments/${id}/status`, data),
}

// Countries API
export const countriesAPI = {
  getCountries: (params) => api.get('/countries', { params }),
  getCountry: (id) => api.get(`/countries/${id}`),
  createCountry: (data) => api.post('/countries', data),
  updateCountry: (id, data) => api.put(`/countries/${id}`, data),
  deleteCountry: (id) => api.delete(`/countries/${id}`),
  getCountriesByContinent: (continent) => api.get(`/countries/continent/${continent}`),
  getShippingMultiplier: (id) => api.get(`/countries/${id}/multiplier`),
}

// Boxes API
export const boxesAPI = {
  getBoxes: (params) => api.get('/boxes', { params }),
  getBox: (id) => api.get(`/boxes/${id}`),
  createBox: (data) => api.post('/boxes', data),
  updateBox: (id, data) => api.put(`/boxes/${id}`, data),
  deleteBox: (id) => api.delete(`/boxes/${id}`),
  calculateShippingCost: (data) => api.post('/boxes/calculate-cost', data),
}

// Users API
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  toggleUserStatus: (id) => api.patch(`/users/${id}/toggle-status`),
}

// Dashboard API
export const dashboardAPI = {
  getUserDashboard: () => api.get('/dashboard/user'),
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getAnalytics: (params) => api.get('/dashboard/analytics', { params }),
}

export default api
