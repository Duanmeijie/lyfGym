import request from '@/utils/request';

export const getMembers = (params) => request.get('/members', { params });
export const addMember = (data) => request.post('/members', data);
export const updateMember = (id, data) => request.put(`/members/${id}`, data);
export const deleteMember = (id) => request.delete(`/members/${id}`);
export const rechargeMember = (id, data) => request.post(`/members/${id}/recharge`, data);