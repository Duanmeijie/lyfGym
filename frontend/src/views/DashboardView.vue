<template>
  <div class="dashboard">
    <div class="stats-cards">
      <div class="stat-card stat-card-members">
        <div class="stat-icon">👥</div>
        <div class="stat-body">
          <div class="stat-label">总会员数</div>
          <div class="stat-value">{{ stats.totalMembers }}</div>
          <div class="stat-change" v-if="stats.newMembersToday > 0">今日 +{{ stats.newMembersToday }}</div>
        </div>
      </div>
      <div class="stat-card stat-card-active">
        <div class="stat-icon">✅</div>
        <div class="stat-body">
          <div class="stat-label">有效会员</div>
          <div class="stat-value">{{ stats.activeMembers }}</div>
        </div>
      </div>
      <div class="stat-card stat-card-warning">
        <div class="stat-icon">⚠️</div>
        <div class="stat-body">
          <div class="stat-label">即将过期 (7天)</div>
          <div class="stat-value">{{ stats.expiringSoon }}</div>
        </div>
      </div>
      <div class="stat-card stat-card-revenue">
        <div class="stat-icon">💰</div>
        <div class="stat-body">
          <div class="stat-label">本月收入</div>
          <div class="stat-value">¥{{ stats.monthlyRevenue }}</div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="dashboard-main">
        <div class="charts-row">
          <MemberTypeChart :members="members" />
          <NewMembersChart :members="members" />
        </div>

        <div class="section-card">
          <div class="card-header">
            <h3 class="card-title">📋 近期课程</h3>
            <router-link to="/courses" class="card-more">查看全部 →</router-link>
          </div>
          <table class="dashboard-table">
            <thead>
              <tr>
                <th>课程名称</th>
                <th>教练</th>
                <th>日期</th>
                <th>时间</th>
                <th>预约情况</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="course in recentCourses" :key="course.id">
                <td class="td-name">{{ course.name }}</td>
                <td>{{ course.coach_name }}</td>
                <td>{{ course.start_date }}</td>
                <td>{{ course.start_time?.slice(0, 5) }}</td>
                <td>
                  <span class="booking-progress">
                    <span class="progress-bar">
                      <span class="progress-fill" :style="{ width: (course.booked_count / course.max_capacity * 100) + '%' }"></span>
                    </span>
                    <span class="progress-text">{{ course.booked_count }}/{{ course.max_capacity }}</span>
                  </span>
                </td>
              </tr>
              <tr v-if="recentCourses.length === 0">
                <td colspan="5" class="empty-cell">暂无课程安排</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="dashboard-side">
        <div class="section-card">
          <div class="card-header">
            <h3 class="card-title">📢 最新公告</h3>
            <router-link to="/announcements" class="card-more">更多 →</router-link>
          </div>
          <div class="announcement-list">
            <div v-for="item in announcements" :key="item.id" class="announcement-item">
              <span :class="['ann-type-badge', 'type-' + item.type]">{{ item.type }}</span>
              <div class="ann-content">
                <div class="ann-title">{{ item.title }}</div>
                <div class="ann-date">{{ formatDate(item.created_at) }}</div>
              </div>
            </div>
            <div v-if="announcements.length === 0" class="empty-cell">暂无公告</div>
          </div>
        </div>

        <div class="section-card">
          <div class="card-header">
            <h3 class="card-title">⚡ 快捷操作</h3>
          </div>
          <div class="quick-actions">
            <router-link to="/members" class="quick-action-btn">
              <span class="qa-icon">👥</span>
              <span class="qa-label">会员管理</span>
            </router-link>
            <router-link to="/coaches" class="quick-action-btn">
              <span class="qa-icon">💪</span>
              <span class="qa-label">教练管理</span>
            </router-link>
            <router-link to="/courses" class="quick-action-btn">
              <span class="qa-icon">📅</span>
              <span class="qa-label">课程管理</span>
            </router-link>
            <router-link to="/revenue" class="quick-action-btn">
              <span class="qa-icon">💰</span>
              <span class="qa-label">营收统计</span>
            </router-link>
          </div>
        </div>

        <div class="section-card">
          <div class="card-header">
            <h3 class="card-title">📊 系统概况</h3>
          </div>
          <div class="system-stats">
            <div class="sys-stat">
              <span class="sys-label">教练总数</span>
              <span class="sys-value">{{ stats.coachCount }}</span>
            </div>
            <div class="sys-stat">
              <span class="sys-label">课程总数</span>
              <span class="sys-value">{{ stats.courseCount }}</span>
            </div>
            <div class="sys-stat">
              <span class="sys-label">商品总数</span>
              <span class="sys-value">{{ stats.productCount }}</span>
            </div>
            <div class="sys-stat">
              <span class="sys-label">今日签到</span>
              <span class="sys-value">{{ stats.todayCheckIns }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getMembers } from '@/api/member';
import { getCoaches } from '@/api/coach';
import { getCourses, getCourseStats } from '@/api/course';
import { getLatestAnnouncements } from '@/api/announcement';
import { getRevenueSummary } from '@/api/revenue';
import { getProducts } from '@/api/product';
import MemberTypeChart from '@/components/MemberTypeChart.vue';
import NewMembersChart from '@/components/NewMembersChart.vue';

const members = ref([]);
const recentCourses = ref([]);
const announcements = ref([]);
const stats = ref({
  totalMembers: 0,
  activeMembers: 0,
  expiringSoon: 0,
  newMembersToday: 0,
  monthlyRevenue: 0,
  coachCount: 0,
  courseCount: 0,
  productCount: 0,
  todayCheckIns: 0
});

const fetchDashboardData = async () => {
  try {
    const [membersRes, coachesRes, coursesRes, courseStatsRes, annRes, revenueRes, productsRes] = await Promise.allSettled([
      getMembers(),
      getCoaches(),
      getCourses({ page: 1, pageSize: 5 }),
      getCourseStats(),
      getLatestAnnouncements(),
      getRevenueSummary(),
      getProducts({ page: 1, pageSize: 1 })
    ]);

    if (membersRes.status === 'fulfilled' && membersRes.value.data.code === 200) {
      const data = membersRes.value.data.data;
      members.value = data;
      const today = new Date().toISOString().slice(0, 10);
      stats.value.totalMembers = data.length;
      stats.value.activeMembers = data.filter(m => m.status === '有效').length;
      stats.value.expiringSoon = data.filter(m => m.days_left > 0 && m.days_left <= 7).length;
      stats.value.newMembersToday = data.filter(m => m.created_at && m.created_at.startsWith(today)).length;
    }

    if (coachesRes.status === 'fulfilled' && coachesRes.value.data.code === 200) {
      stats.value.coachCount = coachesRes.value.data.data.length;
    }

    if (coursesRes.status === 'fulfilled' && coursesRes.value.data.code === 200) {
      recentCourses.value = coursesRes.value.data.data.list?.slice(0, 5) || [];
      stats.value.courseCount = coursesRes.value.data.data.total || 0;
    }

    if (revenueRes.status === 'fulfilled' && revenueRes.value.data.code === 200) {
      stats.value.monthlyRevenue = revenueRes.value.data.data.monthRevenue || 0;
      stats.value.todayCheckIns = revenueRes.value.data.data.todayCheckIns || 0;
    }

    if (annRes.status === 'fulfilled' && annRes.value.data.code === 200) {
      announcements.value = annRes.value.data.data?.slice(0, 5) || [];
    }

    if (productsRes.status === 'fulfilled' && productsRes.value.data.code === 200) {
      stats.value.productCount = productsRes.value.data.data.total || 0;
    }
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 22px 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-card-members .stat-icon { background: #eff6ff; }
.stat-card-active .stat-icon { background: #ecfdf5; }
.stat-card-warning .stat-icon { background: #fffbeb; }
.stat-card-revenue .stat-icon { background: #fef2f2; }

.stat-body { flex: 1; }
.stat-label { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
.stat-value { font-size: 26px; font-weight: 700; color: #1f2937; line-height: 1.2; }
.stat-change { font-size: 12px; color: #10b981; margin-top: 4px; font-weight: 500; }

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.section-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  padding: 20px;
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.card-more {
  font-size: 13px;
  color: #6366f1;
  text-decoration: none;
}

.dashboard-table {
  width: 100%;
  border-collapse: collapse;
}

.dashboard-table th {
  padding: 10px 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #f3f4f6;
}

.dashboard-table td {
  padding: 12px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #f9fafb;
}

.dashboard-table tr:last-child td {
  border-bottom: none;
}

.td-name {
  font-weight: 500;
  color: #1f2937;
}

.booking-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  width: 60px;
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #818cf8);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.empty-cell {
  text-align: center;
  color: #9ca3af;
  padding: 32px !important;
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.announcement-item {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 8px;
  transition: background 0.2s;
}

.announcement-item:hover {
  background: #f3f4f6;
}

.ann-type-badge {
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  flex-shrink: 0;
  height: fit-content;
}

.type-公告 { background: #eff6ff; color: #1d4ed8; }
.type-活动 { background: #ecfdf5; color: #065f46; }
.type-通知 { background: #fffbeb; color: #92400e; }

.ann-content { flex: 1; min-width: 0; }
.ann-title { font-size: 14px; font-weight: 500; color: #1f2937; margin-bottom: 2px; }
.ann-date { font-size: 12px; color: #9ca3af; }

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #f9fafb;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s;
}

.quick-action-btn:hover {
  background: #eff6ff;
  transform: translateY(-1px);
}

.qa-icon { font-size: 20px; }
.qa-label { font-size: 13px; font-weight: 500; color: #374151; }

.system-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.sys-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}

.sys-stat:last-child,
.sys-stat:nth-last-child(2) {
  border-bottom: none;
}

.sys-label {
  font-size: 13px;
  color: #6b7280;
}

.sys-value {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .charts-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>
