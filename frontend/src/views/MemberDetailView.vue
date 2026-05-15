<template>
  <div v-if="loading" class="loading">加载中...</div>

  <template v-else-if="member">
    <div class="profile-section">
      <div class="profile-header">
        <div class="avatar">{{ initials }}</div>
        <div class="profile-info">
          <h2 class="profile-name">{{ member.name }}</h2>
          <p class="profile-phone">{{ member.phone }}</p>
          <div class="profile-tags">
            <span class="profile-tag">{{ member.type }}</span>
            <span :class="['status-tag', member.status === '有效' ? 'active' : member.status === '冻结' ? 'frozen' : 'expired']">
              {{ member.status }}
            </span>
          </div>
        </div>
      </div>
      <div class="profile-actions">
        <button class="btn-action-primary" @click="handleCheckin">签到</button>
        <button class="btn-action-primary btn-recharge" @click="openRecharge">充值</button>
        <button class="btn-action-secondary" @click="openEdit">编辑</button>
      </div>
    </div>

    <div class="info-cards">
      <div class="info-card">
        <div class="info-label">会员类型</div>
        <div class="info-value">{{ member.type }}</div>
      </div>
      <div class="info-card">
        <div class="info-label">剩余天数</div>
        <div class="info-value" :class="{ 'text-warning': member.days_left <= 7 && member.days_left > 0 }">
          {{ member.days_left }}天
        </div>
      </div>
      <div class="info-card">
        <div class="info-label">会员状态</div>
        <div class="info-value">
          <span :class="['status-tag', member.status === '有效' ? 'active' : member.status === '冻结' ? 'frozen' : 'expired']">
            {{ member.status }}
          </span>
        </div>
      </div>
      <div class="info-card">
        <div class="info-label">注册日期</div>
        <div class="info-value">{{ member.created_at || '未知' }}</div>
      </div>
    </div>

    <div class="tabs">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-item', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </div>
    </div>

    <div v-if="activeTab === 'body'" class="tab-content">
      <div class="tab-header-actions">
        <button class="btn-add" @click="showBodyModal = true">新增体测记录</button>
      </div>

      <div class="chart-container">
        <v-chart class="chart" :option="weightChartOption" autoresize />
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>体重</th>
              <th>体脂率</th>
              <th>肌肉量</th>
              <th>BMI</th>
              <th>腰围</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in bodyRecords" :key="record.id">
              <td>{{ record.record_date }}</td>
              <td>{{ record.weight }}</td>
              <td>{{ record.body_fat }}</td>
              <td>{{ record.muscle_mass }}</td>
              <td>{{ record.bmi }}</td>
              <td>{{ record.waistline }}</td>
              <td>{{ record.notes || '-' }}</td>
              <td>
                <button class="btn-delete-table" @click="handleDeleteBodyRecord(record.id)">删除</button>
              </td>
            </tr>
            <tr v-if="bodyRecords.length === 0">
              <td colspan="8" class="empty">暂无体测记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="activeTab === 'appointment'" class="tab-content">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>课程名称</th>
              <th>教练</th>
              <th>上课时间</th>
              <th>状态</th>
              <th>预约时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in appointments" :key="item.id">
              <td>{{ item.course_name }}</td>
              <td>{{ item.coach_name }}</td>
              <td>{{ item.schedule_time }}</td>
              <td>
                <span :class="['status-tag', appointmentStatusClass(item.status)]">
                  {{ item.status }}
                </span>
              </td>
              <td>{{ item.created_at }}</td>
            </tr>
            <tr v-if="appointments.length === 0">
              <td colspan="5" class="empty">暂无预约记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="activeTab === 'order'" class="tab-content">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>订单号</th>
              <th>类型</th>
              <th>商品名称</th>
              <th>金额</th>
              <th>支付方式</th>
              <th>状态</th>
              <th>下单时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in orders" :key="item.id">
              <td>{{ item.order_no }}</td>
              <td>{{ item.type }}</td>
              <td>{{ item.product_name }}</td>
              <td>{{ item.amount }}</td>
              <td>{{ item.payment_method }}</td>
              <td>
                <span :class="['status-tag', orderStatusClass(item.status)]">
                  {{ item.status }}
                </span>
              </td>
              <td>{{ item.created_at }}</td>
            </tr>
            <tr v-if="orders.length === 0">
              <td colspan="7" class="empty">暂无订单记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="activeTab === 'checkin'" class="tab-content">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>签到日期</th>
              <th>签到时间</th>
              <th>签到来源</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in checkins" :key="item.id">
              <td>{{ item.checkin_date }}</td>
              <td>{{ item.checkin_time }}</td>
              <td>{{ item.source }}</td>
            </tr>
            <tr v-if="checkins.length === 0">
              <td colspan="3" class="empty">暂无签到记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showBodyModal" class="modal-overlay" @click.self="showBodyModal = false">
      <div class="modal">
        <h3>新增体测记录</h3>
        <form @submit.prevent="submitBodyRecord">
          <div class="form-group">
            <label>体重 (kg)</label>
            <input v-model.number="bodyForm.weight" type="number" step="0.1" required />
          </div>
          <div class="form-group">
            <label>体脂率 (%)</label>
            <input v-model.number="bodyForm.body_fat" type="number" step="0.1" />
          </div>
          <div class="form-group">
            <label>肌肉量 (kg)</label>
            <input v-model.number="bodyForm.muscle_mass" type="number" step="0.1" />
          </div>
          <div class="form-group">
            <label>BMI</label>
            <input v-model.number="bodyForm.bmi" type="number" step="0.1" />
          </div>
          <div class="form-group">
            <label>腰围 (cm)</label>
            <input v-model.number="bodyForm.waistline" type="number" step="0.1" />
          </div>
          <div class="form-group">
            <label>记录日期</label>
            <input v-model="bodyForm.record_date" type="date" required />
          </div>
          <div class="form-group">
            <label>备注</label>
            <textarea v-model="bodyForm.notes" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="showBodyModal = false">取消</button>
            <button type="submit" class="btn-submit" :disabled="bodySubmitting">
              {{ bodySubmitting ? '提交中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showRechargeModal" class="modal-overlay" @click.self="showRechargeModal = false">
      <div class="modal">
        <h3>会员充值</h3>
        <p class="recharge-info">当前会员：{{ member.name }}，剩余天数：{{ member.days_left }}天</p>
        <form @submit.prevent="submitRecharge">
          <div class="form-group">
            <label>充值天数</label>
            <select v-model.number="rechargeDays" required>
              <option :value="30">30天</option>
              <option :value="60">60天</option>
              <option :value="90">90天（季卡）</option>
              <option :value="180">180天</option>
              <option :value="365">365天（年卡）</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="showRechargeModal = false">取消</button>
            <button type="submit" class="btn-submit">确认充值</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal">
        <h3>编辑会员</h3>
        <form @submit.prevent="submitEdit">
          <div class="form-group">
            <label>姓名</label>
            <input v-model="editForm.name" type="text" required />
          </div>
          <div class="form-group">
            <label>手机号</label>
            <input v-model="editForm.phone" type="tel" required />
          </div>
          <div class="form-group">
            <label>会员类型</label>
            <select v-model="editForm.type" required>
              <option value="月卡">月卡</option>
              <option value="季卡">季卡</option>
              <option value="年卡">年卡</option>
            </select>
          </div>
          <div class="form-group">
            <label>天数</label>
            <input v-model.number="editForm.days_left" type="number" min="0" required />
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="showEditModal = false">取消</button>
            <button type="submit" class="btn-submit">保存</button>
          </div>
        </form>
      </div>
    </div>
  </template>

  <div v-else class="loading">未找到会员信息</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';
import { getMemberProfile, getMemberBodyRecords, addMemberBodyRecord, getMemberBookings, getMemberOrders, getMemberCheckIns, memberCheckIn } from '@/api/member_detail';
import { updateMember, rechargeMember } from '@/api/member';

use([LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

const route = useRoute();
const memberId = computed(() => route.params.id);

const loading = ref(true);
const member = ref(null);

const tabs = [
  { key: 'body', label: '体测记录' },
  { key: 'appointment', label: '预约历史' },
  { key: 'order', label: '订单记录' },
  { key: 'checkin', label: '签到记录' },
];
const activeTab = ref('body');

const bodyRecords = ref([]);
const appointments = ref([]);
const orders = ref([]);
const checkins = ref([]);

const showBodyModal = ref(false);
const bodySubmitting = ref(false);
const bodyForm = ref({
  weight: null,
  body_fat: null,
  muscle_mass: null,
  bmi: null,
  waistline: null,
  record_date: new Date().toISOString().slice(0, 10),
  notes: ''
});

const showRechargeModal = ref(false);
const rechargeDays = ref(30);

const showEditModal = ref(false);
const editForm = ref({
  name: '',
  phone: '',
  type: '月卡',
  days_left: 30
});

const initials = computed(() => {
  const name = member.value?.name || '';
  if (name.length >= 2) {
    return name.slice(0, 2);
  }
  return name || '?';
});

const weightChartOption = computed(() => {
  const records = bodyRecords.value;
  if (!records || records.length === 0) {
    return {
      title: {
        text: '体重趋势',
        left: 'center',
        textStyle: { fontSize: 16 }
      },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value', name: '体重 (kg)' },
      series: [{ type: 'line', data: [] }],
      tooltip: { trigger: 'axis' },
      grid: { left: '10%', right: '10%', bottom: '15%' }
    };
  }

  const sorted = [...records].sort((a, b) => new Date(a.record_date) - new Date(b.record_date));
  const dates = sorted.map(r => r.record_date);
  const weights = sorted.map(r => r.weight);

  return {
    title: {
      text: '体重趋势',
      left: 'center',
      textStyle: { fontSize: 16 }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = params[0];
        const record = sorted[p.dataIndex];
        let html = `${p.axisValue}<br/>体重：${p.value} kg`;
        if (record.body_fat) html += `<br/>体脂率：${record.body_fat}%`;
        if (record.bmi) html += `<br/>BMI：${record.bmi}`;
        return html;
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { rotate: 30 }
    },
    yAxis: {
      type: 'value',
      name: '体重 (kg)'
    },
    series: [
      {
        type: 'line',
        data: weights,
        smooth: true,
        lineStyle: { width: 3, color: '#10b981' },
        itemStyle: { color: '#10b981' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.02)' }
            ]
          }
        },
        markLine: {
          data: [{ type: 'average', name: '平均值' }],
          lineStyle: { color: '#f59e0b', type: 'dashed' }
        }
      }
    ],
    grid: {
      left: '10%',
      right: '10%',
      bottom: '20%'
    }
  };
});

const appointmentStatusClass = (status) => {
  const map = {
    '已预约': 'active',
    '已完成': 'active',
    '已取消': 'expired',
    '已签到': 'active'
  };
  return map[status] || '';
};

const orderStatusClass = (status) => {
  const map = {
    '已支付': 'active',
    '已完成': 'active',
    '待支付': 'frozen',
    '已取消': 'expired',
    '已退款': 'expired'
  };
  return map[status] || '';
};

const fetchMemberDetail = async () => {
  try {
    const res = await getMemberDetail(memberId.value);
    if (res.data.code === 200) {
      member.value = res.data.data;
    }
  } catch (error) {
    alert(error.response?.data?.message || '获取会员信息失败');
  }
};

const fetchBodyRecords = async () => {
  try {
    const res = await getBodyRecords(memberId.value);
    if (res.data.code === 200) {
      bodyRecords.value = res.data.data;
    }
  } catch (error) {
    alert(error.response?.data?.message || '获取体测记录失败');
  }
};

const fetchAppointments = async () => {
  try {
    const res = await getAppointments(memberId.value);
    if (res.data.code === 200) {
      appointments.value = res.data.data;
    }
  } catch (error) {
    alert(error.response?.data?.message || '获取预约记录失败');
  }
};

const fetchOrders = async () => {
  try {
    const res = await getOrders(memberId.value);
    if (res.data.code === 200) {
      orders.value = res.data.data;
    }
  } catch (error) {
    alert(error.response?.data?.message || '获取订单记录失败');
  }
};

const fetchCheckins = async () => {
  try {
    const res = await getMemberCheckIns(memberId.value);
    if (res.data.code === 200) {
      checkins.value = res.data.data;
    }
  } catch (error) {
    alert(error.response?.data?.message || '获取签到记录失败');
  }
};

const submitBodyRecord = async () => {
  bodySubmitting.value = true;
  try {
    const res = await addMemberBodyRecord(memberId.value, bodyForm.value);
    if (res.data.code === 200) {
      showBodyModal.value = false;
      bodyForm.value = {
        weight: null,
        body_fat: null,
        muscle_mass: null,
        bmi: null,
        waistline: null,
        record_date: new Date().toISOString().slice(0, 10),
        notes: ''
      };
      fetchBodyRecords();
    }
  } catch (error) {
    alert(error.response?.data?.message || '添加体测记录失败');
  } finally {
    bodySubmitting.value = false;
  }
};

const handleDeleteBodyRecord = async (recordId) => {
  alert('删除功能暂未开放');
};

const handleCheckin = async () => {
  try {
    const res = await memberCheckIn(memberId.value);
    if (res.data.code === 200) {
      alert('签到成功');
      fetchCheckins();
    }
  } catch (error) {
    alert(error.response?.data?.message || '签到失败');
  }
};

const openRecharge = () => {
  rechargeDays.value = 30;
  showRechargeModal.value = true;
};

const submitRecharge = async () => {
  try {
    const res = await rechargeMember(memberId.value, { days: rechargeDays.value });
    if (res.data.code === 200) {
      showRechargeModal.value = false;
      alert('充值成功');
      fetchMemberDetail();
    }
  } catch (error) {
    alert(error.response?.data?.message || '充值失败');
  }
};

const openEdit = () => {
  editForm.value = {
    name: member.value.name,
    phone: member.value.phone,
    type: member.value.type,
    days_left: member.value.days_left
  };
  showEditModal.value = true;
};

const submitEdit = async () => {
  try {
    const res = await updateMember(memberId.value, editForm.value);
    if (res.data.code === 200) {
      showEditModal.value = false;
      alert('编辑成功');
      fetchMemberDetail();
    }
  } catch (error) {
    alert(error.response?.data?.message || '编辑失败');
  }
};

const initData = async () => {
  loading.value = true;
  await fetchMemberDetail();
  await Promise.all([
    fetchBodyRecords(),
    fetchAppointments(),
    fetchOrders(),
    fetchCheckins()
  ]);
  loading.value = false;
};

onMounted(() => {
  initData();
});
</script>

<style scoped>
.loading {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.profile-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #10b981);
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-info h2 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
}

.profile-phone {
  margin: 0 0 8px;
  font-size: 14px;
  color: #6b7280;
}

.profile-tags {
  display: flex;
  gap: 8px;
}

.profile-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: #eff6ff;
  color: #1d4ed8;
}

.profile-actions {
  display: flex;
  gap: 10px;
}

.btn-action-primary {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-action-primary:hover {
  background: #059669;
}

.btn-recharge {
  background: #4f46e5;
}

.btn-recharge:hover {
  background: #4338ca;
}

.btn-action-secondary {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action-secondary:hover {
  background: #f3f4f6;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.info-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.info-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.text-warning {
  color: #f59e0b;
}

.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tab-item {
  flex: 1;
  padding: 14px 20px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.tab-item:hover {
  color: #374151;
  background: #f9fafb;
}

.tab-item.active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
  background: #f5f3ff;
}

.tab-content {
  margin-bottom: 24px;
}

.tab-header-actions {
  margin-bottom: 16px;
}

.btn-add {
  padding: 8px 16px;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #059669;
}

.chart-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 24px;
}

.chart {
  width: 100%;
  height: 360px;
}

.table-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-container table {
  width: 100%;
  border-collapse: collapse;
}

.table-container th,
.table-container td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
}

.table-container th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.table-container td {
  color: #4b5563;
}

.table-container tbody tr:hover {
  background: #f9fafb;
}

.empty {
  text-align: center;
  color: #9ca3af;
  padding: 40px !important;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.status-tag.active {
  background: #d1fae5;
  color: #065f46;
}

.status-tag.expired {
  background: #f3f4f6;
  color: #6b7280;
}

.status-tag.frozen {
  background: #fef3c7;
  color: #92400e;
}

.btn-delete-table {
  padding: 4px 10px;
  font-size: 12px;
  background: #fef2f2;
  color: #dc2626;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-delete-table:hover {
  background: #fee2e2;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  width: 460px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal h3 {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.recharge-info {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.btn-cancel {
  padding: 8px 16px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  padding: 8px 16px;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #059669;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
