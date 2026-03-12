import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@TDU:token');
  if (token) {
    // Garante que não haja espaços extras e que o header seja injetado corretamente
    config.headers.Authorization = `Bearer ${token}`.trim();
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;