import api from './api';

export const zoneService = {
  createZone: async (zonePayload) => {
    const response = await api.post('/api/v1/admin/zones', zonePayload);
    return response.data;
  },
  updateZone: async (id, zonePayload) => {
    const response = await api.put(`/api/v1/admin/zones/${id}`, zonePayload);
    return response.data;
  },
  deleteZone: async (id) => {
    const response = await api.delete(`/api/v1/admin/zones/${id}`);
    return response.data;
  },
};
