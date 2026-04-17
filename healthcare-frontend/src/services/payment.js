import api from './api';

export const createPayment = (appointmentId, userId, amount) =>
  api.post('/payments', { appointmentId, userId, amount, paymentMethod: 'CARD' });

export const getPaymentsByUser = (userId) =>
  api.get(`/payments/user/${userId}`);

export const getPaymentById = (id) =>
  api.get(`/payments/${id}`);
