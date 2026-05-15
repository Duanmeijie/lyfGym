import request from '@/utils/request';

export const getBookings = (params) => request.get('/bookings', { params });
export const getBookingStats = () => request.get('/bookings/stats');
export const addBooking = (data) => request.post('/bookings', data);
export const updateBooking = (id, data) => request.put(`/bookings/${id}`, data);
export const deleteBooking = (id) => request.delete(`/bookings/${id}`);
