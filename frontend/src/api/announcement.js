import request from '@/utils/request';

export const getAnnouncements = (params) => request.get('/announcements', { params });
export const getLatestAnnouncements = () => request.get('/announcements/latest');
export const getAnnouncementStats = () => request.get('/announcements/stats');
export const addAnnouncement = (data) => request.post('/announcements', data);
export const updateAnnouncement = (id, data) => request.put(`/announcements/${id}`, data);
export const deleteAnnouncement = (id) => request.delete(`/announcements/${id}`);
