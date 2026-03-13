import axios from 'axios';

const api = axios.create({
  // 1. Tenta pegar a URL do .env (VITE_API_URL)
  // 2. Se não existir, usa a URL fixa do seu Backend no Render
  // 3. O .replace garante que não existam barras duplas (//) no caminho
  baseURL: (import.meta.env.VITE_API_URL || 'https://tdu-api.onrender.com').replace(/\/$/, ''),
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