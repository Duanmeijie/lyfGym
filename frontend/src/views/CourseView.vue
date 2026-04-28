<template>
  <!-- 统计卡片 -->
  <div class="stats-cards">
    <div class="stat-card">
      <div class="stat-label">今日课程</div>
      <div class="stat-value">{{ todayCourses }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">活跃课程</div>
      <div class="stat-value">{{ activeCourses }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">总课时</div>
      <div class="stat-value">{{ totalHours }}</div>
    </div>
  </div>

  <!-- 课程管理内容 -->
  <div class="section-title">课程管理</div>
  <div class="course-placeholder">
    <p>课程管理功能正在开发中...</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 模拟课程数据
const courses = ref([
  { id: 1, name: '瑜伽基础班', coach: '王教练', time: '09:00-10:00', status: '进行中' },
  { id: 2, name: '力量训练', coach: '张教练', time: '10:30-11:30', status: '进行中' },
  { id: 3, name: '有氧操课', coach: '李教练', time: '14:00-15:00', status: '未开始' }
]);

// 统计数据
const todayCourses = computed(() => courses.value.length);
const activeCourses = computed(() => courses.value.filter(c => c.status === '进行中').length);
const totalHours = computed(() => courses.value.length * 1); // 假设每节课1小时
</script>

<style scoped>
/* 统计卡片 */
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

/* 标题 */
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

/* 占位内容 */
.course-placeholder {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 40px;
  text-align: center;
  color: #6b7280;
}
</style>