import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/', 
  headers: {
    'Content-Type': 'application/json',
  },
});
// Automatically add Bearer token to every request
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized globally (auto logout + redirect)
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    if (error.response?.status === 401) {
     sessionStorage.removeItem('authToken');
     sessionStorage.removeItem('user');

      // Redirect to login page
      try {
        const router = (await import('@/router')).default;
        router.push('/login');
      } catch {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
export default api;