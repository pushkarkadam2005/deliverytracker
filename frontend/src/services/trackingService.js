import api from './api';

export const trackingService = {
  getTimeline: async (trackingNumber) => {
    const response = await api.get(`/api/v1/tracking/${trackingNumber}`);
    return response.data;
  },
  getLatestStatus: async (trackingNumber) => {
    const response = await api.get(`/api/v1/tracking/${trackingNumber}/latest`);
    return response.data;
  },
  updateStatus: async (trackingNumber, payload) => {
    // payload: { shipmentStatus, location, remarks }
    const response = await api.post(`/api/v1/tracking/${trackingNumber}`, payload);
    return response.data;
  },
};
