import axios from 'axios';

// Get base URL from environment or fallback
const getBaseUrl = () => {
  return localStorage.getItem('apiBaseUrl') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token if available
api.interceptors.request.use(
  (config) => {
    // Dynamic URL check in case settings changed base URL
    config.baseURL = getBaseUrl();
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Refresh Token Placeholder
const refreshTokenPlaceholder = async () => {
  console.log('Refresh token placeholder triggered (Simulated token swap)');
  // In a full production system, you would call:
  // const res = await axios.post(`${getBaseUrl()}/api/v1/auth/refresh`, { token: localStorage.getItem('refreshToken') });
  // localStorage.setItem('token', res.data.token);
  return null;
};

// Response Interceptor: Global 401 & 403 handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response) {
      const { status } = error.response;
      
      // 401 Unauthorized - Session Expired or Invalid Token
      const isAuthRequest = originalRequest.url && (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register'));
      if (status === 401 && !isAuthRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Attempt token refresh placeholder
          await refreshTokenPlaceholder();
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError);
        }
        
        // Log out user
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login page if window is defined
        if (typeof window !== 'undefined') {
          window.location.href = '/login?expired=true';
        }
      }
      
      // 403 Forbidden - Insufficient Permissions
      if (status === 403) {
        console.warn('403 Forbidden access attempted.');
        // Optionally redirect to unauthorized landing page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/unauthorized')) {
          window.location.href = '/unauthorized';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export { authService } from './authService';
export { shipmentService } from './shipmentService';
export { adminService } from './adminService';
export { agentService } from './agentService';
export { zoneService } from './zoneService';
export { rateCardService } from './rateCardService';
export { customerService } from './customerService';
export { trackingService } from './trackingService';
export { notificationService } from './notificationService';
