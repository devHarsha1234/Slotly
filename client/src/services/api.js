import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for handling 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Format error message cleanly for the UI
    let errorMessage = 'An unexpected error occurred. Please try again.';
    if (error.response) {
      errorMessage = error.response.data?.message || `Server error (${error.response.status})`;
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
