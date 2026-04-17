import api from './api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export function storeSession(payload) {
  if (payload?.token) {
    localStorage.setItem(TOKEN_KEY, payload.token);
  }

  if (payload?.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  }
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser || rawUser === 'undefined') {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    return null;
  }
}

export function normalizeError(error, fallbackMessage) {
  return error?.response?.data?.message || error?.message || fallbackMessage;
}

export const authApi = {
  login: async (payload) => {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },
  register: async (payload) => {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },
};

export const doctorsApi = {
  list: async () => {
    const response = await api.get('/doctors');
    return response.data;
  },
  create: async (payload) => {
    const response = await api.post('/doctors', payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await api.put(`/doctors/${id}`, payload);
    return response.data;
  },
};

export const appointmentsApi = {
  list: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },
  create: async (payload) => {
    const response = await api.post('/appointments', payload);
    return response.data;
  },
  cancel: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
};

export const reportsApi = {
  list: async (userId) => {
    const response = await api.get(`/users/${userId}/reports`);
    return response.data;
  },
  upload: async (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/users/${userId}/reports`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  downloadUrl: (reportId) => `http://localhost:8080/api/users/reports/${reportId}`,
  remove: async (reportId) => {
    const response = await api.delete(`/users/reports/${reportId}`);
    return response.data;
  },
};

export const prescriptionsApi = {
  listByPatient: async (patientId) => {
    const response = await api.get(`/prescriptions/patient/${patientId}`);
    return response.data;
  },
  listByDoctor: async (doctorId) => {
    const response = await api.get(`/prescriptions/doctor/${doctorId}`);
    return response.data;
  },
  create: async (doctorId, payload) => {
    const response = await api.post(`/prescriptions?doctorId=${doctorId}`, payload);
    return response.data;
  },
};

export const paymentsApi = {
  listByUser: async (userId) => {
    const response = await api.get(`/payments/user/${userId}`);
    return response.data;
  },
  listAll: async () => {
    const response = await api.get('/admin/payments');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/admin/payments/stats');
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/payments/${id}/status`, { status });
    return response.data;
  },
};

export const usersApi = {
  list: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
};

export const adminApi = {
  getUserStats: async () => {
    const response = await api.get('/admin/users/stats');
    return response.data;
  },
  getDoctorStats: async () => {
    const response = await api.get('/admin/doctors/stats');
    return response.data;
  },
  getAppointmentStats: async () => {
    const response = await api.get('/admin/appointments/stats');
    return response.data;
  },
  verifyDoctor: async (id) => {
    const response = await api.put(`/admin/doctors/${id}/verify`);
    return response.data;
  },
  rejectDoctor: async (id) => {
    const response = await api.put(`/admin/doctors/${id}/reject`);
    return response.data;
  },
};
