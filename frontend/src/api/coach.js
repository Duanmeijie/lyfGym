import request from '@/utils/request';

export const getCoaches = () => request.get('/coaches');
export const addCoach = (data) => request.post('/coaches', data);