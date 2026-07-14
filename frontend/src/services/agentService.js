import api from './api';

export const agentService = {
  getProfile: async () => {
    return {
      vehicleNumber: 'DL-3C-XY-9999',
      licenseNumber: 'DL-1420180099999',
      availabilityStatus: 'AVAILABLE',
      rating: 4.8,
    };
  },
  updateAvailability: async (status) => {
    return { success: true, availabilityStatus: status };
  },
};
