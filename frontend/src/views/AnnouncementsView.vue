<template>
  <div class="stats-cards">
    <div class="stat-card">
      <div class="stat-label">📢 公告总数</div>
      <div class="stat-value">{{ stats.total }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">✅ 已发布</div>
      <div class="stat-value">{{ stats.published }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">📝 草稿</div>
      <div class="stat-value">{{ stats.draft }}</div>
    </div>
  </div>

  <div class="section-header">
    <div class="section-title">公告管理</div>
    <button class="btn-add" @click="openAddModal">新增公告</button>
  </div>

  <div class="filters">
    <select v-model="filterType" @change="fetchAnnouncements">
      <option value="">全部</option>
      <option value="公告">公告</option>
      <option value="活动">活动</option>
      <option value="通知">通知</option>
    </select>
    <select v-model="filterPriority" @change="fetchAnnouncements">
      <option value="">全部</option>
      <option value="普通">普通</option>
      <option value="重要">重要</option>
      <option value="紧急">紧急</option>
    </select>
    <select v-model="filterStatus" @change="fetchAnnouncements">
      <option value="">全部</option>
      <option value="已发布">已发布</option>
      <option value="草稿">草稿</option>
      <option value="已下线">已下线</option>
    </select>
  </div>

  <div v-if="loading" class="loading">加载中...</div>

  <div v-else class="announcements-list">
    <div v-for="announcement in announcements" :key="announcement.id" class="announcement-card">
      <div class="card-header">
        <div class="card-tags">
          <span :class="['badge-type', getTypeClass(announcement.type)]">{{ announcement.type }}</span>
          <span :class="['badge-priority', getPriorityClass(announcement.priority)]">{{ announcement.priority }}</span>
        </div>
        <span :class="['status-tag', getStatusClass(announcement.status)]">{{ announcement.status }}</span>
      </div>
      <h3 class="card-title">{{ announcement.title }}</h3>
      <p class="card-excerpt">{{ announcement.content }}</p>
      <div class="card-footer">
        <span class="card-date">{{ announcement.created_at }}</span>
        <div class="card-actions">
          <button class="btn-edit" @click="openEditModal(announcement)">编辑</button>
          <button class="btn-delete" @click="handleDelete(announcement)">删除</button>
        </div>
      </div>
    </div>
    <div v-if="announcements.length === 0" class="empty">暂无公告数据</div>
  </div>

  <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
    <div class="modal">
      <h3>{{ isEdit ? '编辑公告' : '新增公告' }}</h3>
      <form @submit.prevent="submitAnnouncement">
        <div class="form-group">
          <label>标题</label>
          <input v-model="form.title" type="text" required />
        </div>
        <div class="form-group">
          <label>内容</label>
          <textarea v-model="form.content" rows="4" required></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>类型</label>
            <select v-model="form.type" required>
              <option value="公告">公告</option>
              <option value="活动">活动</option>
              <option value="通知">通知</option>
            </select>
          </div>
          <div class="form-group">
            <label>优先级</label>
            <select v-model="form.priority" required>
              <option value="普通">普通</option>
              <option value="重要">重要</option>
              <option value="紧急">紧急</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>状态</label>
          <select v-model="form.status" required>
            <option value="草稿">草稿</option>
            <option value="已发布">已发布</option>
            <option value="已下线">已下线</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="showModal = false">取消</button>
          <button type="submit" class="btn-submit">{{ isEdit ? '保存' : '添加' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getAnnouncements, getAnnouncementStats, addAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/api/announcement';

const announcements = ref([]);
const loading = ref(false);
const filterType = ref('');
const filterPriority = ref('');
const filterStatus = ref('');

const stats = reactive({ total: 0, published: 0, draft: 0 });

const showModal = ref(false);
const isEdit = ref(false);
const form = ref({
  id: null,
  title: '',
  content: '',
  type: '公告',
  priority: '普通',
  status: '草稿'
});

const fetchStats = async () => {
  try {
    const res = await getAnnouncementStats();
    if (res.data.code === 200) {
      stats.total = res.data.data.total;
      stats.published = res.data.data.published;
      stats.draft = res.data.data.draft;
    }
  } catch (error) {
    console.error('获取统计失败', error);
  }
};

const fetchAnnouncements = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filterType.value) params.type = filterType.value;
    if (filterPriority.value) params.priority = filterPriority.value;
    if (filterStatus.value) params.status = filterStatus.value;
    const res = await getAnnouncements(params);
    if (res.data.code === 200) {
      announcements.value = res.data.data;
    }
  } catch (error) {
    console.error('获取公告列表失败', error);
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  isEdit.value = false;
  form.value = { id: null, title: '', content: '', type: '公告', priority: '普通', status: '草稿' };
  showModal.value = true;
};

const openEditModal = (announcement) => {
  isEdit.value = true;
  form.value = { ...announcement };
  showModal.value = true;
};

const submitAnnouncement = async () => {
  try {
    if (isEdit.value) {
      await updateAnnouncement(form.value.id, form.value);
    } else {
      await addAnnouncement(form.value);
    }
    showModal.value = false;
    fetchAnnouncements();
    fetchStats();
  } catch (error) {
    alert(error.response?.data?.message || '操作失败');
  }
};

const handleDelete = (announcement) => {
  if (!confirm(`确定要删除公告「${announcement.title}」吗？`)) return;
  (async () => {
    try {
      const res = await deleteAnnouncement(announcement.id);
      if (res.data.code === 200) {
        alert('删除成功');
        fetchAnnouncements();
        fetchStats();
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      alert(error.response?.data?.message || '删除失败');
    }
  })();
};

const getTypeClass = (type) => {
  const map = { '公告': 'badge-announcement', '活动': 'badge-activity', '通知': 'badge-notice' };
  return map[type] || '';
};

const getPriorityClass = (priority) => {
  const map = { '普通': 'priority-normal', '重要': 'priority-important', '紧急': 'priority-urgent' };
  return map[priority] || '';
};

const getStatusClass = (status) => {
  const map = { '已发布': 'published', '草稿': 'draft', '已下线': 'offline' };
  return map[status] || '';
};

onMounted(() => {
  fetchStats();
  fetchAnnouncements();
});
</script>

<style scoped>
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}
.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.stat-label { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
.stat-value { font-size: 28px; font-weight: 700; color: #1f2937; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.section-title { font-size: 20px; font-weight: 600; color: #1f2937; }
.btn-add {
  padding: 8px 16px;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-add:hover { background: #059669; }

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.filters select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.announcement-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.card-tags { display: flex; gap: 8px; }

.badge-type, .badge-priority {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
}
.badge-announcement { background: #eff6ff; color: #1d4ed8; }
.badge-activity { background: #d1fae5; color: #065f46; }
.badge-notice { background: #fef3c7; color: #92400e; }

.priority-normal { background: #f3f4f6; color: #6b7280; }
.priority-important { background: #ffedd5; color: #c2410c; }
.priority-urgent { background: #fef2f2; color: #dc2626; }

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.status-tag.published { background: #d1fae5; color: #065f46; }
.status-tag.draft { background: #f3f4f6; color: #6b7280; }
.status-tag.offline { background: #fef3c7; color: #92400e; }

.card-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.card-excerpt {
  margin: 0 0 12px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}
.card-date { font-size: 13px; color: #9ca3af; }
.card-actions { display: flex; gap: 8px; }

.btn-edit, .btn-delete {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-edit { background: #eff6ff; color: #1d4ed8; border: none; }
.btn-delete { background: #fef2f2; color: #dc2626; border: none; }

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  width: 480px;
}
.modal h3 { margin: 0 0 20px; font-size: 18px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 14px; color: #374151; }
.form-group input, .form-group textarea, .form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-sizing: border-box;
}
.form-row { display: flex; gap: 16px; }
.form-row .form-group { flex: 1; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
.btn-cancel { padding: 8px 16px; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer; }
.btn-submit { padding: 8px 16px; background: #10b981; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
</style>
