import request from '@/utils/request';

export const getOrders = (params) => request.get('/orders', { params });
export const getOrderStats = () => request.get('/orders/stats');
export const addOrder = (data) => request.post('/orders', data);
export const updateOrder = (id, data) => request.put(`/orders/${id}`, data);
export const deleteOrder = (id) => request.delete(`/orders/${id}`);
