<template>
  <div class="stats-cards">
    <div class="stat-card">
      <div class="stat-label">会员总数</div>
      <div class="stat-value">{{ members.length }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">有效会员</div>
      <div class="stat-value">{{ activeMembers }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">即将过期</div>
      <div class="stat-value">{{ expiringSoon }}</div>
    </div>
  </div>

  <div class="section-header">
    <div class="section-title">会员管理</div>
    <div class="header-actions">
      <input v-model="searchKeyword" type="text" placeholder="搜索姓名/手机号" class="search-input" @input="handleSearch" />
      <label class="checkbox-label">
        <input type="checkbox" v-model="showExpiring" @change="fetchMembers" />
        即将过期(7天内)
      </label>
      <button class="btn-add" @click="openAddModal">新增会员</button>
    </div>
  </div>

  <div v-if="loading" class="loading">加载中...</div>

  <div v-else class="member-table">
    <table>
      <thead>
        <tr>
          <th>姓名</th>
          <th>手机号</th>
          <th>会员类型</th>
          <th>剩余天数</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="member in members" :key="member.id">
          <td>{{ member.name }}</td>
          <td>{{ member.phone }}</td>
          <td>{{ member.type }}</td>
          <td :class="{ 'text-warning': member.days_left <= 7 && member.days_left > 0 }">
            {{ member.days_left }}天
          </td>
          <td>
            <span :class="['status-tag', member.status === '有效' ? 'active' : member.status === '冻结' ? 'frozen' : 'expired']">
              {{ member.status }}
            </span>
          </td>
          <td>
            <button class="btn-action" @click="openEditModal(member)">编辑</button>
            <button class="btn-action" @click="openRechargeModal(member)">充值</button>
            <button class="btn-action" :class="{ 'btn-freeze': member.status === '有效' }" @click="toggleFreeze(member)">
              {{ member.status === '冻结' ? '解冻' : '冻结' }}
            </button>
            <button class="btn-delete" @click="handleDelete(member)">删除</button>
          </td>
        </tr>
        <tr v-if="members.length === 0">
          <td colspan="6" class="empty">暂无会员数据</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
    <div class="modal">
      <h3>{{ isEdit ? '编辑会员' : '新增会员' }}</h3>
      <form @submit.prevent="submitMember">
        <div class="form-group">
          <label>姓名</label>
          <input v-model="form.name" type="text" required />
        </div>
        <div class="form-group">
          <label>手机号</label>
          <input v-model="form.phone" type="tel" required />
        </div>
        <div class="form-group">
          <label>会员类型</label>
          <select v-model="form.type" required>
            <option value="月卡">月卡</option>
            <option value="季卡">季卡</option>
            <option value="年卡">年卡</option>
          </select>
        </div>
        <div class="form-group">
          <label>天数</label>
          <input v-model.number="form.days_left" type="number" min="0" required />
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="showModal = false">取消</button>
          <button type="submit" class="btn-submit">{{ isEdit ? '保存' : '添加' }}</button>
        </div>
      </form>
    </div>
  </div>

  <div v-if="showRecharge" class="modal-overlay" @click.self="showRecharge = false">
    <div class="modal">
      <h3>会员充值</h3>
      <p class="recharge-info">当前会员：{{ rechargeMemberData?.name }}，剩余天数：{{ rechargeMemberData?.days_left }}天</p>
      <form @submit.prevent="submitRecharge">
        <div class="form-group">
          <label>充值天数</label>
          <select v-model.number="rechargeDays" required>
            <option :value="30">30天</option>
            <option :value="90">90天(季卡)</option>
            <option :value="365">365天(年卡)</option>
            <option :value="60">60天</option>
            <option :value="180">180天</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="showRecharge = false">取消</button>
          <button type="submit" class="btn-submit">确认充值</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getMembers, addMember, updateMember, deleteMember, rechargeMember } from '@/api/member';

const members = ref([]);
const loading = ref(false);
const searchKeyword = ref('');
const showExpiring = ref(false);

const showModal = ref(false);
const isEdit = ref(false);
const form = ref({ name: '', phone: '', type: '月卡', days_left: 30 });

const showRecharge = ref(false);
const rechargeMemberData = ref(null);
const rechargeDays = ref(30);

const activeMembers = computed(() => members.value.filter(m => m.status === '有效').length);
const expiringSoon = computed(() => members.value.filter(m => m.days_left <= 7 && m.days_left > 0).length);

const fetchMembers = async () => {
  loading.value = true;
  try {
    const params = { search: searchKeyword.value, expiring_soon: showExpiring.value ? 'true' : '' };
    const res = await getMembers(params);
    if (res.data.code === 200) {
      members.value = res.data.data;
    }
  } catch (error) {
    alert(error.response?.data?.message || '获取会员列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  fetchMembers();
};

const openAddModal = () => {
  isEdit.value = false;
  form.value = { name: '', phone: '', type: '月卡', days_left: 30 };
  showModal.value = true;
};

const openEditModal = (member) => {
  isEdit.value = true;
  form.value = { ...member };
  showModal.value = true;
};

const submitMember = async () => {
  try {
    if (isEdit.value) {
      await updateMember(form.value.id, form.value);
    } else {
      await addMember(form.value);
    }
    showModal.value = false;
    fetchMembers();
  } catch (error) {
    alert(error.response?.data?.message || '操作失败');
  }
};

const openRechargeModal = (member) => {
  rechargeMemberData.value = member;
  rechargeDays.value = 30;
  showRecharge.value = true;
};

const submitRecharge = async () => {
  try {
    await rechargeMember(rechargeMemberData.value.id, { days: rechargeDays.value });
    showRecharge.value = false;
    alert('充值成功');
    fetchMembers();
  } catch (error) {
    alert(error.response?.data?.message || '充值失败');
  }
};

const toggleFreeze = async (member) => {
  const newStatus = member.status === '冻结' ? '有效' : '冻结';
  try {
    await updateMember(member.id, { ...member, status: newStatus });
    fetchMembers();
  } catch (error) {
    alert(error.response?.data?.message || '操作失败');
  }
};

const handleDelete = async (member) => {
  if (!confirm(`确定要删除会员 ${member.name} 吗？`)) return;
  try {
    const res = await deleteMember(member.id);
    if (res.data.code === 200) {
      alert('删除成功');
      fetchMembers();
    } else {
      alert(res.data.message);
    }
  } catch (error) {
    alert(error.response?.data?.message || '删除失败');
  }
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
.stat-label { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
.stat-value { font-size: 28px; font-weight: 700; color: #1f2937; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.section-title { font-size: 20px; font-weight: 600; color: #1f2937; }
.header-actions { display: flex; gap: 12px; align-items: center; }
.search-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  width: 200px;
}
.checkbox-label { font-size: 14px; color: #4b5563; display: flex; align-items: center; gap: 6px; }
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

.member-table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.member-table table { width: 100%; border-collapse: collapse; }
.member-table th, .member-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}
.member-table th { background: #f9fafb; font-weight: 600; color: #374151; }
.member-table td { color: #4b5563; }
.text-warning { color: #f59e0b; font-weight: 600; }

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.status-tag.active { background: #d1fae5; color: #065f46; }
.status-tag.expired { background: #f3f4f6; color: #6b7280; }
.status-tag.frozen { background: #fef3c7; color: #92400e; }

.btn-action {
  padding: 4px 10px;
  font-size: 12px;
  background: #eff6ff;
  color: #1d4ed8;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 6px;
}
.btn-freeze { background: #fef3c7; color: #92400e; }
.btn-delete {
  padding: 4px 10px;
  font-size: 12px;
  background: #fef2f2;
  color: #dc2626;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal { background: #fff; padding: 24px; border-radius: 12px; width: 420px; }
.modal h3 { margin: 0 0 20px; font-size: 18px; }
.recharge-info { font-size: 14px; color: #6b7280; margin-bottom: 16px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 14px; color: #374151; }
.form-group input, .form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
.btn-cancel { padding: 8px 16px; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer; }
.btn-submit { padding: 8px 16px; background: #10b981; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
</style>