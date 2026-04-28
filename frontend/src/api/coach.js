import request from '@/utils/request';

/**
 * 获取教练列表
 */
export const getCoaches = () => request.get('/api/coaches');

/**
 * 添加教练
 * @param {Object} data - { name, specialty, tags, experience, is_gold }
 */
export const addCoach = (data) => request.post('/api/coaches', data);