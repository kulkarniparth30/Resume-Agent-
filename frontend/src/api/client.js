import axios from 'axios';

// In production / Docker / Render, if VITE_API_URL is set, use it; otherwise fallback to local backend or relative /api
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 min for AI calls
});

// Request interceptor to attach auth token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or invalid, clear local auth credentials
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_user');
    }
    return Promise.reject(error);
  }
);

export default client;
