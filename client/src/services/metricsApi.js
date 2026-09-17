import { apiRequest } from './api';

export const metricsApi = {
  getSpaceMetrics: (spaceId) => apiRequest(`/spaces/${spaceId}/metrics`),
};
