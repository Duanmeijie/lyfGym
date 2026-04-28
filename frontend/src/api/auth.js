import request from '@/utils/request';

/**
 * 登录接口
 * @param {Object} data - { username, password }
 */
export const login = (data) => request.post('/api/auth/login', data);