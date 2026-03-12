import axios from 'axios';

const api = axios.create({
  // Use a URL do Render no .env ou o IP da sua rede local
  baseURL: import.meta.env.VITE_API_URL || 'http://192.168.1.9:3000',
  // REMOVIDO: 'Content-Type': 'application/json' 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@TDU:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`.trim();
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;