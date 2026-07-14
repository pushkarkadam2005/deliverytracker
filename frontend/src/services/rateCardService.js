import api from './api';

export const rateCardService = {
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
};
