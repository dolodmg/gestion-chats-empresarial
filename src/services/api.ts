import axios from 'axios';

export const API_BASE_URL = 'https://chat.pupuia.com/api';
export const API_PUBLIC_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
const BROWSER_TOKEN_STORAGE_KEY = 'browser_token';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function refreshBrowserToken(): Promise<string> {
  const authToken = localStorage.getItem('auth_token');

  if (!authToken) {
    throw new Error('Missing auth token');
  }

  const response = await axios.get(`${API_BASE_URL}/auth/browser-token`, {
    headers: {
      'x-auth-token': authToken
    }
  });

  const browserToken = response.data?.browserToken;
  if (!browserToken) {
    throw new Error('Missing browser token in response');
  }

  localStorage.setItem(BROWSER_TOKEN_STORAGE_KEY, browserToken);
  return browserToken;
}

export function getStoredBrowserToken(): string | null {
  return localStorage.getItem(BROWSER_TOKEN_STORAGE_KEY);
}

export function clearStoredBrowserToken() {
  localStorage.removeItem(BROWSER_TOKEN_STORAGE_KEY);
}

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
      clearStoredBrowserToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
