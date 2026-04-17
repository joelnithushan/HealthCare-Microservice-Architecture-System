import api from './api';

const primaryBase = '/notifications';

export const notificationsApi = {
  listByUser: (userId) => api.get(`${primaryBase}/user/${userId}`).then(res => res.data),
  markAsRead: (id) => api.put(`${primaryBase}/${id}/read`).then(res => res.data),
};
