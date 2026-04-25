import axios from 'axios';

const api = axios.create({
  // Se houver VITE_API_URL no .env, usa ela. 
  // Caso contrário: se for DEV usa localhost:3000, se for PROD usa o subcaminho do VPS.
  baseURL: (import.meta.env.VITE_API_URL || 
           (import.meta.env.DEV ? 'http://localhost:3000' : '/7caveiras/api')).replace(/\/$/, ''),
});

// Interceptor para injetar o token automaticamente em todas as requisições
api.interceptors.request.use(async config => {
  const token = localStorage.getItem('@TDU:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;