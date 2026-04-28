<template>
  <!-- 统计卡片 -->
  <div class="stats-cards">
    <div class="stat-card">
      <div class="stat-label">总会员数</div>
      <div class="stat-value">{{ members.length }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">今日新增</div>
      <div class="stat-value">{{ todayNew }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">即将过期（7天内）</div>
      <div class="stat-value">{{ expiringSoon }}</div>
    </div>
  </div>

  <!-- 图表区域 -->
  <div class="charts-row">
    <MemberTypeChart :members="members" />
    <NewMembersChart :members="members" />
  </div>

  <!-- 添加按钮 -->
  <div class="action-bar">
    <button class="btn-add" @click="openModal">+ 添加新会员</button>
  </div>

  <!-- 会员表格 -->
  <div class="table-container">
    <h2 class="section-title">会员管理</h2>
    <div v-if="loading" class="loading">加载中...</div>
    <table v-else class="members-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>姓名</th>
          <th>手机号</th>
          <th>会员类型</th>
          <th>剩余天数</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(member, index) in members"
          :key="member.id"
          :class="['table-row', { 'row-even': index % 2 === 1 }]"
        >
          <td>{{ member.id }}</td>
          <td>{{ member.name }}</td>
          <td>{{ member.phone }}</td>
          <td>{{ member.type }}</td>
          <td>{{ member.days_left }}</td>
          <td>
            <span :class="['status-badge', member.status === '有效' ? 'status-active' : 'status-expired']">
              {{ member.status }}
            </span>
          </td>
          <td>
            <button class="btn-edit" @click="handleEdit(member)">编辑</button>
            <button class="btn-delete" @click="handleDelete(member.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 模态框 -->
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>添加新会员</h3>
        <button class="modal-close" @click="closeModal">&times;</button>
      </div>
      <form @submit.prevent="handleAddMember" class="modal-form">
        <div class="form-group">
          <label>姓名</label>
          <input v-model="formData.name" type="text" placeholder="请输入姓名" required />
        </div>
        <div class="form-group">
          <label>手机号</label>
          <input v-model="formData.phone" type="tel" placeholder="请输入手机号" required />
        </div>
        <div class="form-group">
          <label>会员类型</label>
          <select v-model="formData.type" required>
            <option value="" disabled>请选择</option>
            <option value="月卡">月卡</option>
            <option value="季卡">季卡</option>
            <option value="年卡">年卡</option>
          </select>
        </div>
        <div class="form-group">
          <label>剩余天数</label>
          <input v-model.number="formData.days_left" type="number" min="0" placeholder="请输入剩余天数" required />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="closeModal">取消</button>
          <button type="submit" class="btn-confirm" :disabled="submitting">
            {{ submitting ? '提交中...' : '确认添加' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getMembers, addMember, deleteMember } from '@/api/member';
import MemberTypeChart from '@/components/MemberTypeChart.vue';
import NewMembersChart from '@/components/NewMembersChart.vue';

const members = ref([]);
const loading = ref(false);
const showModal = ref(false);
const submitting = ref(false);

const formData = ref({
  name: '',
  phone: '',
  type: '',
  days_left: 0
});

// 统计数据
const todayNew = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return members.value.filter(m => m.created_at && m.created_at.startsWith(today)).length;
});

const expiringSoon = computed(() =>
  members.value.filter(m => m.days_left > 0 && m.days_left <= 7).length
);

// 获取会员列表
const fetchMembers = async () => {
  loading.value = true;
  try {
    const res = await getMembers();
    if (res.data.code === 200) {
      members.value = res.data.data;
    }
  } catch (error) {
    alert(error.response?.data?.message || '获取会员列表失败');
  } finally {
    loading.value = false;
  }
};

// 添加会员
const handleAddMember = async () => {
  submitting.value = true;
  try {
    const res = await addMember(formData.value);
    if (res.data.code === 200) {
      closeModal();
      fetchMembers();
    }
  } catch (error) {
    alert(error.response?.data?.message || '添加失败');
  } finally {
    submitting.value = false;
  }
};

// 删除会员
const handleDelete = async (id) => {
  const confirmed = window.confirm('确认要删除该会员吗？');
  if (confirmed) {
    try {
      await deleteMember(id);
      fetchMembers();
    } catch (error) {
      alert(error.response?.data?.message || '删除失败');
    }
  }
};

const handleEdit = (member) => {
  alert(`编辑会员: ${member.name}`);
};

const openModal = () => {
  formData.value = { name: '', phone: '', type: '', days_left: 0 };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

onMounted(() => {
  fetchMembers();
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

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.action-bar {
  margin-bottom: 20px;
}

.btn-add {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: #10b981;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #059669;
}

.table-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.section-title {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.members-table {
  width: 100%;
  border-collapse: collapse;
}

.members-table thead tr {
  background: #f3f4f6;
}

.members-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 700;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.members-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.table-row:hover {
  background: #eff6ff;
}

.row-even {
  background: #f9fafb;
}

.row-even:hover {
  background: #eff6ff;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-expired {
  background: #fee2e2;
  color: #991b1b;
}

.btn-edit {
  padding: 6px 12px;
  margin-right: 8px;
  font-size: 13px;
  color: #4f46e5;
  background: transparent;
  border: 1px solid #4f46e5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit:hover {
  background: #4f46e5;
  color: #fff;
}

.btn-delete {
  padding: 6px 12px;
  font-size: 13px;
  color: #ef4444;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-delete:hover {
  color: #dc2626;
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 480px;
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  padding: 10px 20px;
  font-size: 14px;
  color: #6b7280;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-confirm {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: #10b981;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  background: #059669;
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>