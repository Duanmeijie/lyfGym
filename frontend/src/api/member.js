import request from '@/utils/request';

/**
 * 获取会员列表
 */
export const getMembers = () => request.get('/members');
export const addMember = (data) => request.post('/members', data);
export const deleteMember = (id) => request.delete(`/members/${id}`);