import axios from './axios';

// AUTH
export const register = (data) => axios.post('/auth/register', data).then(res => res.data);
export const login = (data) => axios.post('/auth/login', data).then(res => res.data);
export const sendOTP = (data) => axios.post('/auth/send-otp', data).then(res => res.data);
export const verifyOTP = (data) => axios.post('/auth/verify-otp', data).then(res => res.data);
export const forgotPassword = (data) => axios.post('/auth/forgot-password', data).then(res => res.data);
export const resetPassword = (data) => axios.post('/auth/reset-password', data).then(res => res.data);

// USERS
export const getMe = () => axios.get('/users/me').then(res => res.data);
export const updateMe = (data) => axios.put('/users/me', data).then(res => res.data);
export const uploadProfilePhoto = (formData) => axios.post('/users/me/upload-photo', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);
export const getUserById = (id) => axios.get(`/users/${id}`).then(res => res.data);

// RIDES
export const createRide = (data) => axios.post('/rides', data).then(res => res.data);
export const updateRide = (id, data) => axios.put(`/rides/${id}`, data).then(res => res.data);
export const getRides = (params) => axios.get('/rides', { params }).then(res => res.data);
export const getRideById = (id) => axios.get(`/rides/${id}`).then(res => res.data);
export const getMyPostedRides = () => axios.get('/rides/my-rides').then(res => res.data);
export const getDriverStats = () => axios.get('/rides/driver-stats').then(res => res.data);
export const cancelRide = (id) => axios.patch(`/rides/${id}/cancel`).then(res => res.data);
export const startRide = (id) => axios.patch(`/rides/${id}/start`).then(res => res.data);
export const completeRide = (id) => axios.patch(`/rides/${id}/complete`).then(res => res.data);

// BOOKINGS
export const createBooking = (data) => axios.post('/bookings', data).then(res => res.data);
export const getMyBookings = () => axios.get('/bookings/my').then(res => res.data);
export const getBookingById = (id) => axios.get(`/bookings/${id}`).then(res => res.data);
export const acceptBooking = (id) => axios.patch(`/bookings/${id}/accept`).then(res => res.data);
export const rejectBooking = (id) => axios.patch(`/bookings/${id}/reject`).then(res => res.data);
export const cancelBooking = (id) => axios.patch(`/bookings/${id}/cancel`).then(res => res.data);

// MESSAGES
export const getConversations = () => axios.get('/messages/conversations').then(res => res.data);
export const getMessagesByBooking = (bookingId) => axios.get(`/messages/booking/${bookingId}`).then(res => res.data);
export const sendMessage = (bookingId, content) => axios.post('/messages', { bookingId, content }).then(res => res.data);
export const markMessagesRead = (bookingId) => axios.put(`/messages/booking/${bookingId}/read`).then(res => res.data);

// RATINGS
export const submitRating = (data) => axios.post('/ratings', data).then(res => res.data);
export const getUserRatings = (userId) => axios.get(`/ratings/user/${userId}`).then(res => res.data);

// NOTIFICATIONS
export const getNotifications = () => axios.get('/users/me/notifications').then(res => res.data);
export const markNotificationRead = (id) => axios.patch(`/users/me/notifications/${id}/read`).then(res => res.data);
export const markAllNotificationsRead = () => axios.patch('/users/me/notifications/read-all').then(res => res.data);
