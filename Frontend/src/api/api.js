import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // VITE_ is nessasary for env variables in vite
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
