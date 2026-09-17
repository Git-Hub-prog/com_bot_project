import { apiRequest } from './api';

export const authApi = {
  signup: (payload) => apiRequest('/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload }),
  verifyEmail: (payload) => apiRequest('/auth/verify-email', { method: 'POST', body: payload }),
  forgotPassword: (payload) => apiRequest('/auth/forgot-password', { method: 'POST', body: payload }),
  resetPassword: (payload) => apiRequest('/auth/reset-password', { method: 'POST', body: payload }),
  me: () => apiRequest('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
};
