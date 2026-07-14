import api from './api';

export const customerService = {
  createArea: async (areaPayload, zoneId) => {
    const response = await api.post(`/api/v1/admin/areas?zoneId=${zoneId}`, areaPayload);
    return response.data;
  },
  updateArea: async (id, areaPayload, zoneId) => {
    const response = await api.put(`/api/v1/admin/areas/${id}?zoneId=${zoneId}`, areaPayload);
    return response.data;
  },
  deleteArea: async (id) => {
    const response = await api.delete(`/api/v1/admin/areas/${id}`);
    return response.data;
  },
};
