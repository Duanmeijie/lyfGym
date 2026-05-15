<template>
  <div class="stats-cards">
    <div class="stat-card">
      <div class="stat-label">📅 今日预约</div>
      <div class="stat-value">{{ stats.todayCount }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">📊 本周预约</div>
      <div class="stat-value">{{ stats.weekCount }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">📉 取消率</div>
      <div class="stat-value">{{ stats.cancelRate }}%</div>
    </div>
  </div>

  <div class="section-header">
    <div class="section-title">预约管理</div>
    <button class="btn-add" @click="openAddModal">新增预约</button>
  </div>

  <div class="filters">
    <select v-model="filterMemberId" @change="fetchBookings">
      <option value="">全部会员</option>
      <option v-for="member in members" :key="member.id" :value="member.id">{{ member.name }}</option>
    </select>
    <select v-model="filterCourseId" @change="fetchBookings">
      <option value="">全部课程</option>
      <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.name }}</option>
    </select>
    <select v-model="filterStatus" @change="fetchBookings">
      <option value="">全部状态</option>
      <option value="booked">已预约</option>
      <option value="completed">已完成</option>
      <option value="cancelled">已取消</option>
    </select>
  </div>

  <div class="booking-table">
    <table>
      <thead>
        <tr>
          <th>会员姓名</th>
          <th>课程名称</th>
          <th>预约时间</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="booking in bookings" :key="booking.id">
          <td>{{ booking.member_name }}</td>
          <td>{{ booking.course_name }}</td>
          <td>{{ booking.booking_time }}</td>
          <td>
            <span :class="['status-tag', booking.status]">
              {{ statusMap[booking.status] }}
            </span>
          </td>
          <td>
            <button class="btn-edit" @click="openEditModal(booking)">编辑</button>
            <button class="btn-delete" @click="handleDelete(booking.id)">删除</button>
          </td>
        </tr>
        <tr v-if="bookings.length === 0">
          <td colspan="5" class="empty">暂无预约数据</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="pagination">
    <button :disabled="page <= 1" @click="page--; fetchBookings()">上一页</button>
    <span>{{ page }} / {{ totalPages }}</span>
    <button :disabled="page >= totalPages" @click="page++; fetchBookings()">下一页</button>
  </div>

  <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
    <div class="modal">
      <h3>{{ isEdit ? '编辑预约' : '新增预约' }}</h3>
      <form @submit.prevent="submitBooking">
        <div class="form-group">
          <label>会员</label>
          <select v-model="form.member_id" required>
            <option value="">选择会员</option>
            <option v-for="member in members" :key="member.id" :value="member.id">{{ member.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>课程</label>
          <select v-model="form.course_id" required>
            <option value="">选择课程</option>
            <option v-for="course in courses" :key="course.id" :value="course.id">
              {{ course.name }}（已约 {{ course.booked_count }}/{{ course.max_capacity }}）
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>状态</label>
          <select v-model="form.status">
            <option value="booked">已预约</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
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
import { ref, computed, onMounted } from 'vue';
import { getBookings, getBookingStats, addBooking, updateBooking, deleteBooking } from '@/api/booking';
import { getMembers } from '@/api/member';
import { getCourses } from '@/api/course';

const bookings = ref([]);
const members = ref([]);
const courses = ref([]);
const stats = ref({ todayCount: 0, weekCount: 0, cancelRate: 0 });
const loading = ref(false);
const page = ref(1);
const pageSize = 10;
const total = ref(0);
const filterMemberId = ref('');
const filterCourseId = ref('');
const filterStatus = ref('');

const showModal = ref(false);
const isEdit = ref(false);
const form = ref({
  id: null,
  member_id: '',
  course_id: '',
  status: 'booked'
});

const statusMap = {
  booked: '已预约',
  completed: '已完成',
  cancelled: '已取消'
};

const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1);

const fetchStats = async () => {
  try {
    const res = await getBookingStats();
    if (res.data.code === 200) {
      stats.value = res.data.data;
    }
  } catch (error) {
    console.error('获取统计失败', error);
  }
};

const fetchBookings = async () => {
  loading.value = true;
  try {
    const params = {
      page: page.value,
      pageSize,
      member_id: filterMemberId.value || undefined,
      course_id: filterCourseId.value || undefined,
      status: filterStatus.value || undefined
    };
    const res = await getBookings(params);
    if (res.data.code === 200) {
      bookings.value = res.data.data.list;
      total.value = res.data.data.total;
    }
  } catch (error) {
    console.error('获取预约失败', error);
  } finally {
    loading.value = false;
  }
};

const fetchMembers = async () => {
  try {
    const res = await getMembers();
    if (res.data.code === 200) {
      members.value = res.data.data;
    }
  } catch (error) {
    console.error('获取会员失败', error);
  }
};

const fetchCourses = async () => {
  try {
    const res = await getCourses({ pageSize: 999 });
    if (res.data.code === 200) {
      courses.value = res.data.data.list;
    }
  } catch (error) {
    console.error('获取课程失败', error);
  }
};

const openAddModal = () => {
  isEdit.value = false;
  form.value = { id: null, member_id: '', course_id: '', status: 'booked' };
  showModal.value = true;
};

const openEditModal = (booking) => {
  isEdit.value = true;
  form.value = {
    id: booking.id,
    member_id: booking.member_id,
    course_id: booking.course_id,
    status: booking.status
  };
  showModal.value = true;
};

const submitBooking = async () => {
  try {
    if (isEdit.value) {
      await updateBooking(form.value.id, form.value);
    } else {
      await addBooking(form.value);
    }
    showModal.value = false;
    fetchBookings();
    fetchStats();
  } catch (error) {
    alert(error.response?.data?.message || '操作失败');
  }
};

const handleDelete = async (id) => {
  if (!confirm('确定要删除这条预约记录吗？')) return;
  try {
    const res = await deleteBooking(id);
    if (res.data.code === 200) {
      alert('删除成功');
      fetchBookings();
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
  fetchBookings();
  fetchMembers();
  fetchCourses();
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

.booking-table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.booking-table table {
  width: 100%;
  border-collapse: collapse;
}
.booking-table th, .booking-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}
.booking-table th { background: #f9fafb; font-weight: 600; color: #374151; }
.booking-table td { color: #4b5563; }
.empty { text-align: center; color: #9ca3af; }

.status-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.status-tag.booked { background: #d1fae5; color: #065f46; }
.status-tag.completed { background: #f3f4f6; color: #6b7280; }
.status-tag.cancelled { background: #fee2e2; color: #dc2626; }

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
