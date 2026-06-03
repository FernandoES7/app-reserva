const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Error en la solicitud');
  return data;
}

export const authAPI = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password) => request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
};

export const roomsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v))).toString();
    return request(`/rooms${params ? '?' + params : ''}`);
  },
  getById: (id) => request(`/rooms/${id}`),
  create: (data) => request('/rooms', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/rooms/${id}`, { method: 'DELETE' }),
};

export const reservasAPI = {
  getAll: () => request('/reservations'),
  getMias: () => request('/reservations/mine'),
  getById: (id) => request(`/reservations/${id}`),
  create: (data) => request('/reservations', { method: 'POST', body: JSON.stringify(data) }),
  cancel: (id) => request(`/reservations/${id}/cancel`, { method: 'PUT' }),
  updateStatus: (id, status) => request(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

export const usersAPI = {
  getAll: () => request('/users'),
  update: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};

export const statsAPI = {
  getDashboard: () => request('/stats/dashboard'),
};
