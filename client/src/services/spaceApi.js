import { apiRequest } from './api';

export const spaceApi = {
  list: () => apiRequest('/spaces'),
  get: (spaceId) => apiRequest(`/spaces/${spaceId}`),
  create: (body) => apiRequest('/spaces', { method: 'POST', body }),
  update: (spaceId, body) => apiRequest(`/spaces/${spaceId}`, { method: 'PATCH', body }),
  remove: (spaceId) => apiRequest(`/spaces/${spaceId}`, { method: 'DELETE' }),
  embed: (spaceId) => apiRequest(`/spaces/${spaceId}/embed`),
  updateEmbed: (spaceId, body) => apiRequest(`/spaces/${spaceId}/embed`, { method: 'PATCH', body }),
};
