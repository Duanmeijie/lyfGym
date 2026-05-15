<template>
  <div class="stats-cards">
    <div class="stat-card">
      <div class="stat-label">💰 总收入</div>
      <div class="stat-value">¥{{ stats.monthRevenue }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">📋 总订单数</div>
      <div class="stat-value">{{ stats.totalOrders }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">📊 今日订单</div>
      <div class="stat-value">{{ todayCount }}</div>
    </div>
  </div>

  <div class="section-header">
    <div class="section-title">订单管理</div>
    <button class="btn-add" @click="openAddModal">新增订单</button>
  </div>

  <div class="filters">
    <input v-model="filterSearch" class="search-input" placeholder="搜索订单号" @input="onFilterChange" />
    <select v-model="filterType" @change="onFilterChange">
      <option value="">全部类型</option>
      <option value="membership">会员卡</option>
      <option value="product">商品</option>
      <option value="course">课程</option>
    </select>
    <select v-model="filterStatus" @change="onFilterChange">
      <option value="">全部状态</option>
      <option value="paid">已支付</option>
      <option value="refunded">已退款</option>
    </select>
    <input v-model="filterStartDate" type="date" placeholder="开始日期" @change="onFilterChange" />
    <input v-model="filterEndDate" type="date" placeholder="结束日期" @change="onFilterChange" />
  </div>

  <div class="order-table">
    <table>
      <thead>
        <tr>
          <th>订单号</th>
          <th>会员姓名</th>
          <th>类型</th>
          <th>商品名称</th>
          <th>金额</th>
          <th>支付方式</th>
          <th>状态</th>
          <th>创建时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td>{{ order.order_no }}</td>
          <td>{{ order.member_name || '-' }}</td>
          <td>{{ typeLabel(order.type) }}</td>
          <td>{{ order.product_name }}</td>
          <td>¥{{ order.amount }}</td>
          <td>{{ order.payment_method }}</td>
          <td>
            <span :class="['status-tag', order.status === 'paid' ? 'paid' : 'refunded']">
              {{ order.status === 'paid' ? '已支付' : '已退款' }}
            </span>
          </td>
          <td>{{ order.created_at }}</td>
          <td>
            <button class="btn-edit" @click="openEditModal(order)">编辑</button>
            <button class="btn-delete" @click="handleDelete(order.id)">删除</button>
          </td>
        </tr>
        <tr v-if="orders.length === 0">
          <td colspan="9" class="empty">暂无订单数据</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="pagination">
    <button :disabled="page <= 1" @click="page--; fetchOrders()">上一页</button>
    <span>{{ page }} / {{ totalPages }}</span>
    <button :disabled="page >= totalPages" @click="page++; fetchOrders()">下一页</button>
  </div>

  <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
    <div class="modal">
      <h3>{{ isEdit ? '编辑订单' : '新增订单' }}</h3>
      <form @submit.prevent="submitOrder">
        <div class="form-group">
          <label>会员</label>
          <select v-model="form.member_id">
            <option value="">选择会员（可选）</option>
            <option v-for="member in members" :key="member.id" :value="member.id">{{ member.name }} ({{ member.phone }})</option>
          </select>
        </div>
        <div class="form-group">
          <label>类型</label>
          <select v-model="form.type" required>
            <option value="membership">会员卡</option>
            <option value="product">商品</option>
            <option value="course">课程</option>
          </select>
        </div>
        <div class="form-group">
          <label>商品名称</label>
          <input v-model="form.product_name" type="text" required />
        </div>
        <div class="form-group">
          <label>金额</label>
          <input v-model.number="form.amount" type="number" min="0" step="0.01" required />
        </div>
        <div class="form-group">
          <label>支付方式</label>
          <select v-model="form.payment_method" required>
            <option value="现金">现金</option>
            <option value="微信">微信</option>
            <option value="支付宝">支付宝</option>
            <option value="银行卡">银行卡</option>
          </select>
        </div>
        <div class="form-group">
          <label>状态</label>
          <select v-model="form.status" required>
            <option value="paid">已支付</option>
            <option value="refunded">已退款</option>
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
import { getOrders, getOrderStats, addOrder, updateOrder, deleteOrder } from '@/api/order';
import { getMembers } from '@/api/member';

const orders = ref([]);
const members = ref([]);
const stats = ref({ monthRevenue: 0, totalOrders: 0 });
const todayCount = ref(0);
const loading = ref(false);
const page = ref(1);
const pageSize = 10;
const total = ref(0);

const filterSearch = ref('');
const filterType = ref('');
const filterStatus = ref('');
const filterStartDate = ref('');
const filterEndDate = ref('');

const showModal = ref(false);
const isEdit = ref(false);
const form = ref({
  id: null,
  member_id: '',
  type: 'membership',
  product_name: '',
  amount: '',
  payment_method: '现金',
  status: 'paid'
});

let filterTimer = null;

const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1);

const typeLabel = (type) => {
  const map = { membership: '会员卡', product: '商品', course: '课程' };
  return map[type] || type;
};

const getTodayDate = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const buildParams = () => {
  return {
    page: page.value,
    pageSize,
    search: filterSearch.value || undefined,
    type: filterType.value || undefined,
    status: filterStatus.value || undefined,
    start_date: filterStartDate.value || undefined,
    end_date: filterEndDate.value || undefined
  };
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    const res = await getOrders(buildParams());
    if (res.data.code === 200) {
      orders.value = res.data.data.list;
      total.value = res.data.data.total;
    }
  } catch (error) {
    console.error('获取订单失败', error);
  } finally {
    loading.value = false;
  }
};

const fetchStats = async () => {
  try {
    const res = await getOrderStats();
    if (res.data.code === 200) {
      stats.value = res.data.data;
    }
  } catch (error) {
    console.error('获取统计失败', error);
  }
};

const fetchTodayCount = async () => {
  try {
    const today = getTodayDate();
    const res = await getOrders({ start_date: today, end_date: today, pageSize: 1 });
    if (res.data.code === 200) {
      todayCount.value = res.data.data.total;
    }
  } catch (error) {
    console.error('获取今日订单数失败', error);
  }
};

const fetchMembers = async () => {
  try {
    const res = await getMembers();
    if (res.data.code === 200) {
      members.value = res.data.data;
    }
  } catch (error) {
    console.error('获取会员列表失败', error);
  }
};

const onFilterChange = () => {
  page.value = 1;
  clearTimeout(filterTimer);
  filterTimer = setTimeout(() => {
    fetchOrders();
  }, 300);
};

const openAddModal = () => {
  isEdit.value = false;
  form.value = { id: null, member_id: '', type: 'membership', product_name: '', amount: '', payment_method: '现金', status: 'paid' };
  showModal.value = true;
};

const openEditModal = (order) => {
  isEdit.value = true;
  form.value = { ...order, member_id: order.member_id || '' };
  showModal.value = true;
};

const submitOrder = async () => {
  try {
    const payload = { ...form.value };
    if (!payload.member_id) {
      delete payload.member_id;
    }

    if (isEdit.value) {
      await updateOrder(form.value.id, payload);
    } else {
      await addOrder(payload);
    }
    showModal.value = false;
    fetchOrders();
    fetchStats();
    fetchTodayCount();
  } catch (error) {
    alert(error.response?.data?.message || '操作失败');
  }
};

const handleDelete = async (id) => {
  if (!confirm('确定要删除该订单吗？')) return;
  try {
    const res = await deleteOrder(id);
    if (res.data.code === 200) {
      alert('删除成功');
      fetchOrders();
      fetchStats();
      fetchTodayCount();
    } else {
      alert(res.data.message);
    }
  } catch (error) {
    alert(error.response?.data?.message || '删除失败');
  }
};

onMounted(() => {
  fetchStats();
  fetchOrders();
  fetchTodayCount();
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
  flex-wrap: wrap;
}
.filters select,
.search-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
.search-input {
  width: 200px;
}
.filters input[type="date"] {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.order-table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.order-table table {
  width: 100%;
  border-collapse: collapse;
}
.order-table th, .order-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}
.order-table th { background: #f9fafb; font-weight: 600; color: #374151; }
.order-table td { color: #4b5563; }
.empty { text-align: center; color: #9ca3af; }

.status-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.status-tag.paid { background: #d1fae5; color: #065f46; }
.status-tag.refunded { background: #fef2f2; color: #dc2626; }

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
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
.btn-cancel { padding: 8px 16px; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer; }
.btn-submit { padding: 8px 16px; background: #10b981; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
</style>
