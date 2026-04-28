import request from '@/utils/request';

/**
 * 获取会员列表
 */
export const getMembers = () => request.get('/api/members');

/**
 * 添加会员
 * @param {Object} data - { name, phone, type, days_left }
 */
export const addMember = (data) => request.post('/api/members', data);

/**
 * 删除会员
 * @param {number} id - 会员ID
 */
export const deleteMember = (id) => request.delete(`/api/members/${id}`);