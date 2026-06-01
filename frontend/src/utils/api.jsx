import axios from 'axios';

// With Vite proxy, we can just use /api
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (credential) => api.post('/auth/google', { credential }),
  sendEmailOTP: (email) => api.post('/auth/send-email-otp', { email }),
  sendPhoneOTP: (phone) => api.post('/auth/send-phone-otp', { phone }),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  getCurrentUser: () => api.get('/auth/current-user'),
  getAllUsers: () => api.get('/auth/users'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  sendConnectionRequest: (userId) => api.post(`/auth/connect/${userId}`),
  acceptConnectionRequest: (userId) => api.post(`/auth/accept/${userId}`),
  rejectConnectionRequest: (userId) => api.post(`/auth/reject/${userId}`),
  markNotificationsRead: () => api.put('/auth/notifications/read'),
  getConnections: () => api.get('/auth/connections'),
  getUserById: (id) => api.get(`/auth/user/${id}`),
};

export const walletAPI = {
  getWalletInfo: () => api.get('/wallet/info'),
  createOrder: (amount) => api.post('/wallet/order', { amount }),
  verifyPayment: (data) => api.post('/wallet/verify', data),
  authorizeBank: (data) => api.post('/wallet/bank/authorize', data),
};

export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getChat: (userId) => api.get(`/messages/chat/${userId}`),
  sendMessage: (data) => api.post('/messages/send', data),
};

export const postAPI = {
  createPost: (data) => api.post('/posts', data),
  getPosts: () => api.get('/posts'),
  resolvePost: (id) => api.put(`/posts/${id}/resolve`),
  joinPost: (id) => api.put(`/posts/${id}/join`),
  leavePost: (id) => api.put(`/posts/${id}/leave`),
};

export const reviewAPI = {
  createReview: (data) => api.post('/reviews', data),
  getProviderReviews: (providerId) => api.get(`/reviews/${providerId}`)
};

export default api;
