import api from './api';

export const createSession = (appointmentId, doctorId, patientId) =>
  api.post('/v1/telemedicine/sessions', { appointmentId, doctorId, patientId });

export const getSessionByAppointment = (appointmentId) =>
  api.get(`/v1/telemedicine/sessions/appointment/${appointmentId}`);

export const startSession = (sessionId) =>
  api.put(`/v1/telemedicine/sessions/${sessionId}/start`);

export const endSession = (sessionId) =>
  api.put(`/v1/telemedicine/sessions/${sessionId}/end`);
