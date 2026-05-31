// Read-only Admin API client → talks to the live production API.
// Auth: HTTP Basic (same as the mobile app). Token kept in localStorage.
export const API_BASE = 'https://api.atobtransport.de';

const TOKEN_KEY = 'atob_admin_token';
const USER_KEY  = 'atob_admin_user';

function authHeaders() {
  const t = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  return t ? { Authorization: 'Basic ' + t } : {};
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

export function isAuthed() {
  return typeof window !== 'undefined' && !!localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function login(email, password) {
  const token = btoa(`${email}:${password}`);
  const res = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: 'Basic ' + token } });
  if (res.status === 401) throw new Error('Invalid email or password');
  if (!res.ok) throw new Error('Server error');
  const me = await res.json();
  if (me.role !== 'ADMIN') throw new Error('Admin access only — this account is a ' + me.role);
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(me));
  return me;
}

async function get(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeaders() } });
  if (res.status === 401 || res.status === 403) { logout(); throw new Error('Session expired'); }
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

async function patch(path) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'PATCH', headers: { ...authHeaders() } });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `Action failed (${res.status})`);
  }
  return res.json().catch(() => ({}));
}

export const getShippings = ()   => get('/api/shippings?size=100');
export const getShipping  = (id) => get(`/api/shippings/${id}`);
export const getCargo     = (id) => get(`/api/shippings/${id}/cargo`);
export const getProof     = (id) => get(`/api/shippings/${id}/proof`);
export const proofPhotoUrl = (id) => `${API_BASE}/api/shippings/${id}/proof/photo`;

// Admin lookups + actions (all backed by existing endpoints)
export const getDrivers   = ()   => get('/register/drivers');
export const getVehicles  = ()   => get('/api/vehicles');
export const assignDriver  = (id, driverId)  => patch(`/api/shippings/${id}/assign-driver/${driverId}`);
export const assignVehicle = (id, vehicleId) => patch(`/api/shippings/${id}/assign-vehicle/${vehicleId}`);
export const cancelShipment = (id) => patch(`/api/shippings/${id}/cancel`);
