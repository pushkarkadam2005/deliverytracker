import api from './api';

export const shipmentService = {
  create: async (payload) => {
    const response = await api.post('/api/v1/shipments', payload);
    return response.data;
  },
  estimate: async (payload) => {
    const response = await api.post('/api/v1/shipments/estimate', payload);
    return response.data;
  },
  getByTracking: async (trackingNumber) => {
    const response = await api.get(`/api/v1/shipments/${trackingNumber}`);
    const data = response.data;
    
    // Augment with details placeholders
    if (!data.deliveryCharge) {
      data.deliveryCharge = {
        baseCharge: 150.00,
        overweightCharge: 50.00,
        totalCharge: 200.00
      };
    }
    
    if (!data.agentDetails) {
      if (data.shipmentStatus !== 'CREATED' && data.shipmentStatus !== 'CANCELLED') {
        data.agentDetails = {
          name: 'Rohan Sharma',
          phone: '+91 98765 43210',
          vehicle: 'DL-3C-XY-9999',
          rating: '4.8'
        };
      } else {
        data.agentDetails = null;
      }
    }
    return data;
  },
  getMyShipments: async (page = 0, size = 10) => {
    const response = await api.get(`/api/v1/shipments/my?page=${page}&size=${size}`);
    return response.data;
  },
  cancel: async (trackingNumber) => {
    const response = await api.patch(`/api/v1/shipments/${trackingNumber}/cancel`);
    return response.data;
  },
  reschedule: async (trackingNumber, rescheduledDate) => {
    const response = await api.patch(`/api/v1/shipments/${trackingNumber}/reschedule`, { rescheduledDate });
    return response.data;
  },
};
