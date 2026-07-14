import api from './api';

export const authService = {
  login: async (payload) => {
    // payload: { username, password } (or email)
    const response = await api.post('/api/v1/auth/login', payload);
    return response.data;
  },
  register: async (payload) => {
    // payload: { fullName, email, password, role, phone, defaultAddress, vehicleNumber, licenseNumber }
    const response = await api.post('/api/v1/auth/register', payload);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
