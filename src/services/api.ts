import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL || 'https://chat.pupuia.com';

export const API_PUBLIC_BASE_URL = configuredApiUrl
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
export const API_BASE_URL = `${API_PUBLIC_BASE_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
