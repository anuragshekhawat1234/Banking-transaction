import axios from 'axios';

const API_KEY = 'my-secure-banking-api-key-2026';
const BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to inject API Key
api.interceptors.request.use(
  (config) => {
    config.headers['X-API-KEY'] = API_KEY;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
