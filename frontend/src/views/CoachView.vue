<template>
  <div class="stats-cards">
    <div class="stat-card">
      <div class="stat-label">在职教练</div>
      <div class="stat-value">{{ coaches.length }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">金牌教练</div>
      <div class="stat-value">{{ goldCoaches }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">平均教龄</div>
      <div class="stat-value">{{ averageExperience }}年</div>
    </div>
  </div>

  <div class="section-header">
    <div class="section-title">教练管理</div>
    <div class="header-actions">
      <input v-model="searchKeyword" type="text" placeholder="搜索教练姓名/擅长领域" class="search-input" @input="handleSearch" />
      <button class="btn-add" @click="openAddModal">新增教练</button>
    </div>
  </div>

  <div v-if="loading" class="loading">加载中...</div>

  <div v-else>
    <div class="coaches-grid">
      <div v-for="coach in coaches" :key="coach.id" class="coach-card">
        <div class="coach-header">
          <img :src="coach.avatar_url || 'https://i.pravatar.cc/150?img=' + coach.id" :alt="coach.name" class="coach-avatar" />
          <div class="coach-info">
            <h3 class="coach-name">{{ coach.name }}</h3>
            <p class="coach-specialty">{{ coach.specialty }}</p>
          </div>
        </div>
        <div class="coach-tags">
          <span v-if="coach.is_gold || coach.experience > 5" class="tag gold">金牌</span>
          <span class="tag">{{ coach.experience }}年经验</span>
        </div>
        <p class="coach-bio">{{ coach.bio || '暂无简介' }}</p>
        <div class="coach-footer">
          <button class="btn-detail" @click="viewDetail(coach)">查看详情</button>
          <button class="btn-edit-small" @click="openEditModal(coach)">编辑</button>
          <button class="btn-book" @click="bookCourse(coach)">预约课程</button>
        </div>
        <div class="coach-actions">
          <button class="btn-delete-small" @click="handleDelete(coach)">删除</button>
        </div>
      </div>
    </div>
    <div v-if="coaches.length === 0" class="empty">暂无教练数据</div>
  </div>

  <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
    <div class="modal">
      <h3>{{ isEdit ? '编辑教练' : '新增教练' }}</h3>
      <form @submit.prevent="submitCoach">
        <div class="form-group">
          <label>姓名</label>
          <input v-model="form.name" type="text" required />
        </div>
        <div class="form-group">
          <label>擅长领域</label>
          <input v-model="form.specialty" type="text" placeholder="如：减脂、瑜伽、力量训练" required />
        </div>
        <div class="form-group">
          <label>简介</label>
          <textarea v-model="form.bio" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>头像URL</label>
          <input v-model="form.avatar_url" type="text" placeholder="https://..." />
        </div>
        <div class="form-group">
          <label>经验年限</label>
          <input v-model.number="form.experience" type="number" min="0" required />
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="showModal = false">取消</button>
          <button type="submit" class="btn-submit">{{ isEdit ? '保存' : '添加' }}</button>
        </div>
      </form>
    </div>
  </div>

  <div v-if="showDetail" class="modal-overlay" @click.self="showDetail = false">
    <div class="modal detail-modal">
      <h3>教练详情</h3>
      <div class="detail-content">
        <img :src="detailCoach.avatar_url || 'https://i.pravatar.cc/150?img=' + detailCoach.id" class="detail-avatar" />
        <div class="detail-info">
          <h4>{{ detailCoach.name }}</h4>
          <p><strong>擅长领域：</strong>{{ detailCoach.specialty }}</p>
          <p><strong>经验：</strong>{{ detailCoach.experience }}年</p>
          <p><strong>金牌标签：</strong>{{ detailCoach.is_gold ? '是' : '否' }}</p>
          <p><strong>简介：</strong>{{ detailCoach.bio || '暂无' }}</p>
        </div>
      </div>
      <div v-if="detailCoach.courses && detailCoach.courses.length > 0" class="detail-courses">
        <h5>排课记录</h5>
        <ul>
          <li v-for="course in detailCoach.courses" :key="course.id">
            {{ course.name }} - {{ course.start_date }} {{ course.start_time }}
          </li>
        </ul>
      </div>
      <button class="btn-close" @click="showDetail = false">关闭</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getCoaches, addCoach, updateCoach, deleteCoach, getCoachDetail } from '@/api/coach';

const router = useRouter();
const coaches = ref([]);
const loading = ref(false);
const searchKeyword = ref('');

const showModal = ref(false);
const isEdit = ref(false);
const form = ref({ name: '', specialty: '', bio: '', avatar_url: '', experience: 0 });

const showDetail = ref(false);
const detailCoach = ref({});

const goldCoaches = computed(() => coaches.value.filter(c => c.experience > 5).length);
const averageExperience = computed(() => {
  if (coaches.value.length === 0) return 0;
  const total = coaches.value.reduce((sum, c) => sum + (c.experience || 0), 0);
  return (total / coaches.value.length).toFixed(1);
});

const fetchCoaches = async (params) => {
  loading.value = true;
  try {
    const res = await getCoaches(params);
    if (res.data.code === 200) {
      coaches.value = res.data.data;
    }
  } catch (error) {
    alert(error.response?.data?.message || '获取教练列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  fetchCoaches({ search: searchKeyword.value });
};

const openAddModal = () => {
  isEdit.value = false;
  form.value = { name: '', specialty: '', bio: '', avatar_url: '', experience: 0 };
  showModal.value = true;
};

const openEditModal = (coach) => {
  isEdit.value = true;
  form.value = { ...coach };
  showModal.value = true;
};

const submitCoach = async () => {
  try {
    if (isEdit.value) {
      await updateCoach(form.value.id, form.value);
    } else {
      await addCoach(form.value);
    }
    showModal.value = false;
    fetchCoaches();
  } catch (error) {
    alert(error.response?.data?.message || '操作失败');
  }
};

const handleDelete = async (coach) => {
  if (!confirm(`确定要删除教练 ${coach.name} 吗？`)) return;
  try {
    const res = await deleteCoach(coach.id);
    if (res.data.code === 200) {
      alert('删除成功');
      fetchCoaches();
    } else {
      alert(res.data.message);
    }
  } catch (error) {
    alert(error.response?.data?.message || '删除失败');
  }
};

const viewDetail = async (coach) => {
  try {
    const res = await getCoachDetail(coach.id);
    if (res.data.code === 200) {
      detailCoach.value = res.data.data;
      showDetail.value = true;
    }
  } catch (error) {
    alert('获取详情失败');
  }
};

const bookCourse = (coach) => {
  router.push({ path: '/courses', query: { coach_id: coach.id } });
};

onMounted(() => {
  fetchCoaches();
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
.header-actions { display: flex; gap: 12px; }
.search-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  width: 240px;
}
.btn-add {
  padding: 8px 16px;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.coaches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.coach-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
}
.coach-header { display: flex; gap: 16px; margin-bottom: 12px; }
.coach-avatar { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb; }
.coach-info { flex: 1; }
.coach-name { margin: 0 0 4px; font-size: 18px; font-weight: 600; color: #1f2937; }
.coach-specialty { margin: 0; font-size: 14px; color: #6b7280; }
.coach-tags { display: flex; gap: 8px; margin-bottom: 12px; }
.tag { padding: 4px 10px; font-size: 12px; font-weight: 600; border-radius: 12px; background: #eff6ff; color: #1d4ed8; }
.tag.gold { background: #fef3c7; color: #92400e; }
.coach-bio { font-size: 14px; color: #6b7280; margin-bottom: 12px; line-height: 1.4; }
.coach-footer { display: flex; gap: 8px; padding-top: 12px; border-top: 1px solid #f3f4f6; }
.coach-actions { margin-top: 8px; text-align: right; }

.btn-detail, .btn-book, .btn-edit-small {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-detail { color: #4f46e5; background: transparent; border: 1px solid #4f46e5; }
.btn-edit-small { color: #6b7280; background: #f3f4f6; border: none; }
.btn-book { color: #fff; background: #10b981; border: none; }
.btn-delete-small { padding: 4px 10px; font-size: 12px; color: #dc2626; background: #fef2f2; border: none; border-radius: 4px; cursor: pointer; }

.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal { background: #fff; padding: 24px; border-radius: 12px; width: 480px; }
.modal h3 { margin: 0 0 20px; font-size: 18px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 14px; color: #374151; }
.form-group input, .form-group textarea, .form-group select {
  width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;
}
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
.btn-cancel { padding: 8px 16px; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer; }
.btn-submit { padding: 8px 16px; background: #10b981; color: #fff; border: none; border-radius: 6px; cursor: pointer; }

.detail-modal { width: 560px; }
.detail-content { display: flex; gap: 20px; margin-bottom: 20px; }
.detail-avatar { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; }
.detail-info { flex: 1; }
.detail-info h4 { margin: 0 0 12px; font-size: 20px; }
.detail-info p { margin: 6px 0; font-size: 14px; color: #4b5563; }
.detail-courses { background: #f9fafb; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
.detail-courses h5 { margin: 0 0 8px; font-size: 14px; }
.detail-courses ul { margin: 0; padding-left: 20px; font-size: 13px; color: #6b7280; }
.btn-close { width: 100%; padding: 10px; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer; }
</style>