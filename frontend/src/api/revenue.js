import request from '@/utils/request';

export const getRevenueSummary = () => request.get('/revenue/summary');
export const getRevenueStats = (params) => request.get('/revenue/stats', { params });
export const getMonthlyRevenue = (params) => request.get('/revenue/monthly', { params });
export const getDailyRevenue = () => request.get('/revenue/daily');
export const getRevenueByType = (params) => request.get('/revenue/by-type', { params });
export const getTopProducts = (params) => request.get('/revenue/top-products', { params });
