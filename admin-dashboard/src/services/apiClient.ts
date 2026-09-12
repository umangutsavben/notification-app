import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // TODO: Add auth token retrieval
    // const token = localStorage.getItem('admin_token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: Handle global errors (e.g., 401 Unauthorized redirect)
    return Promise.reject(error);
  }
);

export default apiClient;
