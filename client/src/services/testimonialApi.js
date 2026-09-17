import { apiRequest } from './api';

export const testimonialApi = {
  list: (spaceId, params = {}) => apiRequest(`/spaces/${spaceId}/testimonials?${new URLSearchParams(params)}`),
  inbox: (params = {}) => apiRequest(`/testimonials/inbox?${new URLSearchParams(params)}`),
  submit: (spaceSlug, body) => apiRequest(`/public/spaces/${spaceSlug}/testimonials`, { method: 'POST', body }),
  updateStatus: (testimonialId, status) => apiRequest(`/testimonials/${testimonialId}/status`, { method: 'PATCH', body: { status } }),
  updateFeatured: (testimonialId, featured) => apiRequest(`/testimonials/${testimonialId}/featured`, { method: 'PATCH', body: { featured } }),
  updateLiked: (testimonialId, liked) => apiRequest(`/testimonials/${testimonialId}/liked`, { method: 'PATCH', body: { liked } }),
  remove: (testimonialId) => apiRequest(`/testimonials/${testimonialId}`, { method: 'DELETE' }),
};
