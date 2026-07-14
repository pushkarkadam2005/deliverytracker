import api from './api';

export const notificationService = {
  getMyNotifications: async (page = 0, size = 20) => {
    const response = await api.get(`/api/v1/notifications?page=${page}&size=${size}`);
    return response.data;
  },
  markRead: async (notificationId) => {
    const response = await api.patch(`/api/v1/notifications/${notificationId}/read`);
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get('/api/v1/notifications/unread-count');
    return response.data;
  },
};
