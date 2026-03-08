import axios from 'axios';

// O Vite usa 'import.meta.env' para ler o .env
// Se não encontrar nada no .env, ele usa o localhost como reserva (fallback)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Interceptor para injetar o token de Diretor/Moderador
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@TDU:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;