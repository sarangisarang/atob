import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export const BASE_URL = API_BASE_URL;

axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

const client = axios.create({ baseURL: BASE_URL, timeout: 10000 });

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Basic ${token}`;
  config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.multiRemove(['authToken', 'userRole', 'carrierId', 'customerId', 'firstName', 'lastName']);
    }
    return Promise.reject(err);
  },
);

// Safe base64 for all RN environments
const encodeBase64 = (str) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let result = '';
  const bytes = Array.from(str).map((c) => c.charCodeAt(0));
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i], b1 = bytes[i + 1] || 0, b2 = bytes[i + 2] || 0;
    result += chars[b0 >> 2];
    result += chars[((b0 & 3) << 4) | (b1 >> 4)];
    result += i + 1 < bytes.length ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    result += i + 2 < bytes.length ? chars[b2 & 63] : '=';
  }
  return result;
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export const login = async (username, password) => {
  const token = encodeBase64(`${username}:${password}`);
  await AsyncStorage.setItem('authToken', token);
  const response = await axios.get(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Basic ${token}` },
    timeout: 10000,
  });
  return response;
};

export const getMe = () => client.get('/auth/me');

export const logout = async () => {
  await AsyncStorage.multiRemove(['authToken', 'userRole', 'carrierId', 'customerId', 'firstName', 'lastName']);
};

// ─── Orders (admin legacy) ────────────────────────────────────────────────────

export const getOrders    = (status) => client.get('/show/orders', { params: status ? { status } : {} });
export const getMyOrders  = ()       => client.get('/show/orders/my');
export const getOrder     = (id)     => client.get(`/show/order/${id}`);
export const createOrder  = (customerId, order) => client.post(`/show/order/${customerId}`, order);
// Customer-initiated order (customer resolved from token) → creates Order+Shipping(CREATED)+Cargo
export const createCustomerOrder = (data) => client.post('/api/orders', data);
export const updateOrder  = (id, data) => client.put(`/show/order/${id}`, data);
export const getStats     = ()       => client.get('/show/stats');
export const searchOrders = (q)      => client.get('/show/orders/search', { params: { q } });

export const updateOrderStatus = (id, action) => client.put(`/show/order/${id}/${action}`);
export const cancelOrder       = (id)          => client.put(`/show/order/${id}/cancel`);

// ─── Shippings (/api/shippings) ───────────────────────────────────────────────

export const getAllShippings     = ()                      => client.get('/api/shippings');
// Marketplace: unclaimed orders a driver can take, and the claim action
export const getAvailableShippings = ()                    => client.get('/api/shippings/available');
export const acceptShipping        = (id)                  => client.patch(`/api/shippings/${id}/accept`);
export const getShipping         = (id)                   => client.get(`/api/shippings/${id}`);
export const createShipping      = (data)                 => client.post('/api/shippings', data);

export const assignDriver        = (id, driverId)         => client.patch(`/api/shippings/${id}/assign-driver/${driverId}`);
export const assignVehicle       = (id, vehicleId)        => client.patch(`/api/shippings/${id}/assign-vehicle/${vehicleId}`);

export const startPickup         = (id)                   => client.patch(`/api/shippings/${id}/start-pickup`);
export const pickedUp            = (id)                   => client.patch(`/api/shippings/${id}/picked-up`);
export const inTransit           = (id)                   => client.patch(`/api/shippings/${id}/in-transit`);
export const deliverShipping     = (id)                   => client.patch(`/api/shippings/${id}/deliver`);
export const cancelShipping      = (id)                   => client.patch(`/api/shippings/${id}/cancel`);

export const updateCoordinates   = (id, lat, lon)         =>
  client.post(`/api/shippings/${id}/tracking`, { latitude: lat, longitude: lon });

export const getTrackingHistory  = (id)                   => client.get(`/api/shippings/${id}/tracking`);

// Cargo
export const getShippingCargo    = (id)                   => client.get(`/api/shippings/${id}/cargo`);
export const addCargo            = (id, data)             => client.post(`/api/shippings/${id}/cargo`, data);
export const removeCargo         = (cargoId)              => client.delete(`/api/shippings/cargo/${cargoId}`);

// Proof of Delivery
export const getDeliveryProof    = (id)                   => client.get(`/api/shippings/${id}/proof`);
export const proofPhotoUrl       = (id)                   => `${BASE_URL}/api/shippings/${id}/proof/photo`;

// Legacy aliases (screens use these names — map to new routes)
export const getShippingByOrder  = (orderId)               => client.get(`/api/shippings/by-order/${orderId}`);
export const assignCarrier       = (shippingId, carrierId) => client.patch(`/api/shippings/${shippingId}/assign-driver/${carrierId}`);
export const pickUpShipping      = (id)                    => client.patch(`/api/shippings/${id}/picked-up`);

// ─── Products ────────────────────────────────────────────────────────────────

export const getProducts   = ()           => client.get('/products');
export const getProduct    = (id)         => client.get(`/products/${id}`);
export const createProduct = (data)       => client.post('/products', data);
export const updateProduct = (id, data)   => client.put(`/products/${id}`, data);
export const deleteProduct = (id)         => client.delete(`/products/${id}`);

export const uploadProductImage = async (productId, imageUri) => {
  const token = await AsyncStorage.getItem('authToken');
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'product.jpg',
  });
  return client.post(`/products/${productId}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Basic ${token}`,
    },
    timeout: 30000,
  });
};

// ─── Locations ───────────────────────────────────────────────────────────────

export const getLocations   = ()         => client.get('/locations');
export const createLocation = (data)     => client.post('/locations', data);
export const updateLocation = (id, data) => client.put(`/locations/${id}`, data);

// ─── Customers & Drivers ─────────────────────────────────────────────────────

export const getCustomers = () => client.get('/register/customers');
export const getDrivers   = () => client.get('/register/drivers');

// ─── Registration (public — raw axios, no auth header) ───────────────────────

export const registerCustomer = (data) =>
  axios.post(`${BASE_URL}/register/signUpCustomer`, data, { timeout: 10000 });

export const registerDriver = (data) =>
  axios.post(`${BASE_URL}/register/signUpDriver`, data, { timeout: 10000 });

// ─── Chat ────────────────────────────────────────────────────────────────────

export const getChatConversations   = ()                         => client.get('/chat/conversations');
export const getChatContacts        = ()                         => client.get('/chat/conversations');
export const getChatMessages        = (conversationId)           => client.get(`/chat/conversations/${conversationId}/messages`);
export const sendChatMessage        = (conversationId, content)  => client.post(`/chat/conversations/${conversationId}/messages`, { content });
export const markConversationAsRead = (conversationId)           => client.patch(`/chat/conversations/${conversationId}/read`);

export default client;
