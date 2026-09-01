import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiError(error, fallback = 'Terjadi kesalahan') {
  const data = error.response?.data;
  if (data?.details?.length) return data.details.map((d) => d.message).join(', ');
  return data?.error || error.message || fallback;
}

export default api;
