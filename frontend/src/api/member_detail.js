import request from '@/utils/request';

export const getMemberProfile = (id) => request.get(`/members/${id}/profile`);
export const getMemberBodyRecords = (id) => request.get(`/members/${id}/body-records`);
export const addMemberBodyRecord = (id, data) => request.post(`/members/${id}/body-records`, data);
export const getMemberBookings = (id) => request.get(`/members/${id}/bookings`);
export const getMemberOrders = (id) => request.get(`/members/${id}/orders`);
export const getMemberCheckIns = (id) => request.get(`/members/${id}/check-ins`);
export const memberCheckIn = (id) => request.post(`/members/${id}/check-in`);
