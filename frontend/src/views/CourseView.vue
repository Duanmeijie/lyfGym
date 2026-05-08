<template>
  <div class="stats-cards">
    <div class="stat-card">
      <div class="stat-label">今日课程</div>
      <div class="stat-value">{{ stats.todayCount }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">活跃课程</div>
      <div class="stat-value">{{ stats.activeCount }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">总课时</div>
      <div class="stat-value">{{ stats.totalHours }}</div>
    </div>
  </div>

  <div class="section-header">
    <div class="section-title">课程管理</div>
    <button class="btn-add" @click="openAddModal">新增课程</button>
  </div>

  <div class="filters">
    <select v-model="filterCoach" @change="fetchCourses">
      <option value="">全部教练</option>
      <option v-for="coach in coaches" :key="coach.id" :value="coach.id">{{ coach.name }}</option>
    </select>
    <select v-model="filterStatus" @change="fetchCourses">
      <option value="">全部状态</option>
      <option value="active">进行中</option>
      <option value="ended">已结束</option>
    </select>
  </div>

  <div class="course-table">
    <table>
      <thead>
        <tr>
          <th>课程名称</th>
          <th>教练</th>
          <th>日期</th>
          <th>时间</th>
          <th>容量</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="course in courses" :key="course.id">
          <td>{{ course.name }}</td>
          <td>{{ course.coach_name }}</td>
          <td>{{ course.start_date }}</td>
          <td>{{ course.start_time }} - {{ course.end_time }}</td>
          <td>{{ course.booked_count }}/{{ course.max_capacity }}</td>
          <td>
            <span :class="['status-tag', course.is_active ? 'active' : 'ended']">
              {{ course.is_active ? '进行中' : '已结束' }}
            </span>
          </td>
          <td>
            <button class="btn-edit" @click="openEditModal(course)">编辑</button>
            <button class="btn-delete" @click="handleDelete(course.id)">删除</button>
          </td>
        </tr>
        <tr v-if="courses.length === 0">
          <td colspan="7" class="empty">暂无课程数据</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="pagination">
    <button :disabled="page <= 1" @click="page--; fetchCourses()">上一页</button>
    <span>{{ page }} / {{ totalPages }}</span>
    <button :disabled="page >= totalPages" @click="page++; fetchCourses()">下一页</button>
  </div>

  <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
    <div class="modal">
      <h3>{{ isEdit ? '编辑课程' : '新增课程' }}</h3>
      <form @submit.prevent="submitCourse">
        <div class="form-group">
          <label>课程名称</label>
          <input v-model="form.name" type="text" required />
        </div>
        <div class="form-group">
          <label>教练</label>
          <select v-model="form.coach_id" required>
            <option value="">选择教练</option>
            <option v-for="coach in coaches" :key="coach.id" :value="coach.id">{{ coach.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>课程日期</label>
          <input v-model="form.start_date" type="date" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>开始时间</label>
            <input v-model="form.start_time" type="time" required />
          </div>
          <div class="form-group">
            <label>结束时间</label>
            <input v-model="form.end_time" type="time" required />
          </div>
        </div>
        <div class="form-group">
          <label>最大人数</label>
          <input v-model.number="form.max_capacity" type="number" min="1" required />
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
import { ref, computed, onMounted } from 'vue';
import { getCourses, getCourseStats, addCourse, updateCourse, deleteCourse } from '@/api/course';
import { getCoaches } from '@/api/coach';

const courses = ref([]);
const coaches = ref([]);
const stats = ref({ todayCount: 0, activeCount: 0, totalHours: 0 });
const loading = ref(false);
const page = ref(1);
const pageSize = 10;
const total = ref(0);
const filterCoach = ref('');
const filterStatus = ref('');

const showModal = ref(false);
const isEdit = ref(false);
const form = ref({
  id: null,
  name: '',
  coach_id: '',
  start_date: '',
  start_time: '',
  end_time: '',
  max_capacity: 20
});

const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1);

const fetchStats = async () => {
  try {
    const res = await getCourseStats();
    if (res.data.code === 200) {
      stats.value = res.data.data;
    }
  } catch (error) {
    console.error('获取统计失败', error);
  }
};

const fetchCourses = async () => {
  loading.value = true;
  try {
    const params = { page: page.value, pageSize, coach_id: filterCoach.value, status: filterStatus.value };
    const res = await getCourses(params);
    if (res.data.code === 200) {
      courses.value = res.data.data.list;
      total.value = res.data.data.total;
    }
  } catch (error) {
    console.error('获取课程失败', error);
  } finally {
    loading.value = false;
  }
};

const fetchCoaches = async () => {
  try {
    const res = await getCoaches();
    if (res.data.code === 200) {
      coaches.value = res.data.data;
    }
  } catch (error) {
    console.error('获取教练失败', error);
  }
};

const openAddModal = () => {
  isEdit.value = false;
  form.value = { id: null, name: '', coach_id: '', start_date: '', start_time: '', end_time: '', max_capacity: 20 };
  showModal.value = true;
};

const openEditModal = (course) => {
  isEdit.value = true;
  form.value = { ...course };
  showModal.value = true;
};

const submitCourse = async () => {
  try {
    const startTime = form.value.start_time;
    const endTime = form.value.end_time;
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const durationHours = (end - start) / (1000 * 60 * 60);
    form.value.duration_hours = durationHours;

    if (isEdit.value) {
      await updateCourse(form.value.id, form.value);
    } else {
      await addCourse(form.value);
    }
    showModal.value = false;
    fetchCourses();
    fetchStats();
  } catch (error) {
    alert(error.response?.data?.message || '操作失败');
  }
};

const handleDelete = async (id) => {
  if (!confirm('确定要删除这门课程吗？')) return;
  try {
    const res = await deleteCourse(id);
    if (res.data.code === 200) {
      alert('删除成功');
      fetchCourses();
      fetchStats();
    } else {
      alert(res.data.message);
    }
  } catch (error) {
    alert(error.response?.data?.message || '删除失败');
  }
};

onMounted(() => {
  fetchStats();
  fetchCourses();
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

.course-table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.course-table table {
  width: 100%;
  border-collapse: collapse;
}
.course-table th, .course-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}
.course-table th { background: #f9fafb; font-weight: 600; color: #374151; }
.course-table td { color: #4b5563; }
.empty { text-align: center; color: #9ca3af; }

.status-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.status-tag.active { background: #d1fae5; color: #065f46; }
.status-tag.ended { background: #f3f4f6; color: #6b7280; }

.btn-edit, .btn-delete {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
}
.btn-edit { background: #eff6ff; color: #1d4ed8; border: none; }
.btn-delete { background: #fef2f2; color: #dc2626; border: none; }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}
.pagination button {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }

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
.form-group input, .form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
.form-row { display: flex; gap: 16px; }
.form-row .form-group { flex: 1; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
.btn-cancel { padding: 8px 16px; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer; }
.btn-submit { padding: 8px 16px; background: #10b981; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
</style>