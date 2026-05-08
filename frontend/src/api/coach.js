import request from '@/utils/request';

export const getCoaches = (params) => request.get('/coaches', { params });
export const getCoachDetail = (id) => request.get(`/coaches/${id}`);
export const addCoach = (data) => request.post('/coaches', data);
export const updateCoach = (id, data) => request.put(`/coaches/${id}`, data);
export const deleteCoach = (id) => request.delete(`/coaches/${id}`);