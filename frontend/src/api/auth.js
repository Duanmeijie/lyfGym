import request from '@/utils/request';

/**
 * 登录接口
 * @param {Object} data - { username, password }
 */
export const login = (data) => request.post('/auth/login', data);

/**
 * 注册接口
 * @param {Object} data - { username, password, realName }
 */
export const register = (data) => request.post('/auth/register', data);