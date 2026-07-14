import api from './api';

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/api/v1/admin/dashboard');
    return response.data;
  },
  getShipments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/api/v1/admin/shipments?${query}`);
    return response.data;
  },
  getAgents: async (page = 0, size = 20) => {
    const response = await api.get(`/api/v1/admin/agents?page=${page}&size=${size}`);
    return response.data;
  },
  getUsers: async (page = 0, size = 20) => {
    const response = await api.get(`/api/v1/admin/users?page=${page}&size=${size}`);
    return response.data;
  },
  activateUser: async (id) => {
    const response = await api.patch(`/api/v1/admin/users/${id}/activate`);
    return response.data;
  },
  deactivateUser: async (id) => {
    const response = await api.patch(`/api/v1/admin/users/${id}/deactivate`);
    return response.data;
  },
  manualAssignAgent: async (trackingNumber, agentId) => {
    const response = await api.post(`/api/v1/admin/shipments/${trackingNumber}/assign/${agentId}`);
    return response.data;
  },
  overrideStatus: async (trackingNumber, status) => {
    const response = await api.post(`/api/v1/admin/shipments/${trackingNumber}/override-status?status=${status}`);
    return response.data;
  },
  // Zone actions
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
  // Area actions
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
  // Rate Card actions
  getRateCards: async (page = 0, size = 20) => {
    const response = await api.get(`/api/v1/admin/rate-cards?page=${page}&size=${size}`);
    return response.data;
  },
  createRateCard: async (rateCardPayload, pickupZoneId, deliveryZoneId) => {
    const response = await api.post(
      `/api/v1/admin/rate-cards?pickupZoneId=${pickupZoneId}&deliveryZoneId=${deliveryZoneId}`,
      rateCardPayload
    );
    return response.data;
  },
  updateRateCard: async (id, rateCardPayload, pickupZoneId, deliveryZoneId) => {
    const response = await api.put(
      `/api/v1/admin/rate-cards/${id}?pickupZoneId=${pickupZoneId}&deliveryZoneId=${deliveryZoneId}`,
      rateCardPayload
    );
    return response.data;
  },
  deleteRateCard: async (id) => {
    const response = await api.delete(`/api/v1/admin/rate-cards/${id}`);
    return response.data;
  },
  createShipmentForCustomer: async (customerId, payload) => {
    const response = await api.post(`/api/v1/admin/shipments?customerId=${customerId}`, payload);
    return response.data;
  },
};
