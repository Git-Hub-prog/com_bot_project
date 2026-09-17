import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });
let refreshPromise = null;
let redirectingToLogin = false;

const redirectToLogin = () => {
  if (redirectingToLogin || window.location.pathname === '/login') return;
  redirectingToLogin = true;
  window.location.assign('/login');
};

api.interceptors.response.use((response) => response, async (error) => {
  const originalRequest = error.config;
  const isAuthRequest = originalRequest?.url?.match(/\/auth\/(login|signup|verify-email|forgot-password|reset-password)/);
  const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');
  if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthRequest || isRefreshRequest) {
    if (error.response?.status === 401 && !isAuthRequest && !isRefreshRequest) redirectToLogin();
    return Promise.reject(error);
  }

  originalRequest._retry = true;
  refreshPromise ||= api.post('/auth/refresh', null, { skipAuthRefresh: true })
    .then(() => undefined)
    .catch((refreshError) => { redirectToLogin(); throw refreshError; })
    .finally(() => { refreshPromise = null; });
  try {
    await refreshPromise;
    return api(originalRequest);
  } catch (refreshError) {
    return Promise.reject(refreshError);
  }
});

export const apiRequest = async (path, options = {}) => {
  const { method = 'GET', body, headers, ...config } = options;
  const response = await api.request({ url: path, method, data: body, headers, ...config });
  return response.data;
};

export { api };
