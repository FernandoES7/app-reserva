const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error en el servidor');
  return data;
};

// Habitaciones disponibles para un rango de fechas
export const getHabitacionesDisponibles = async (checkin, checkout) => {
  const params = new URLSearchParams({ checkin, checkout });
  const res = await fetch(`${BASE_URL}/habitaciones/disponibles?${params}`);
  return handleResponse(res);
};

// Todos los tipos de habitación
export const getTiposHabitacion = async () => {
  const res = await fetch(`${BASE_URL}/habitaciones/tipos`);
  return handleResponse(res);
};

// Crear reserva
export const crearReserva = async (payload) => {
  const res = await fetch(`${BASE_URL}/reservas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

// Obtener reserva por código
export const getReservaByCodigo = async (codigo) => {
  const res = await fetch(`${BASE_URL}/reservas/${codigo}`);
  return handleResponse(res);
};

// Agrega estas funciones a tu services/api.js existente

/* const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error en el servidor');
  return data;
}; */

export const loginUsuario = async ({ email, password }) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

export const registrarUsuario = async ({ nombre, apellido, email, password }) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, apellido, email, password }),
  });
  return handleResponse(res);
};

export const solicitarRecuperacion = async (email) => {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
};
