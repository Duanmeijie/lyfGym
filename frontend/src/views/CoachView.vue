<template>
  <!-- 统计卡片 -->
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

  <!-- 加载状态 -->
  <div v-if="loading" class="loading">加载中...</div>

  <!-- 教练卡片网格 -->
  <div v-else>
    <div class="section-title">教练管理</div>
    <div class="coaches-grid">
      <div v-for="coach in coaches" :key="coach.id" class="coach-card">
        <div class="coach-header">
          <img 
            :src="coach.avatar_url || 'https://i.pravatar.cc/150?img=' + coach.id" 
            :alt="coach.name" 
            class="coach-avatar" 
          />
          <div class="coach-info">
            <h3 class="coach-name">{{ coach.name }}</h3>
            <p class="coach-specialty">{{ coach.specialty }}</p>
          </div>
        </div>
        <div class="coach-tags">
          <span v-if="coach.is_gold" class="tag">金牌</span>
          <span class="tag">{{ coach.experience }}年经验</span>
        </div>
        <div class="coach-footer">
          <button class="btn-detail" @click="viewDetail(coach)">查看详情</button>
          <button class="btn-book" @click="bookCourse(coach)">预约课程</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getCoaches } from '@/api/coach';

const coaches = ref([]);
const loading = ref(false);

// 统计数据
const goldCoaches = computed(() => coaches.value.filter(c => c.is_gold).length);
const averageExperience = computed(() => {
  if (coaches.value.length === 0) return 0;
  const total = coaches.value.reduce((sum, c) => sum + (c.experience || 0), 0);
  return (total / coaches.value.length).toFixed(1);
});

// 获取教练列表
const fetchCoaches = async () => {
  loading.value = true;
  try {
    const res = await getCoaches();
    if (res.data.code === 200) {
      coaches.value = res.data.data;
    }
  } catch (error) {
    alert(error.response?.data?.message || '获取教练列表失败');
  } finally {
    loading.value = false;
  }
};

const viewDetail = (coach) => {
  alert(`查看教练详情:${coach.name}`);
};

const bookCourse = (coach) => {
  alert(`预约${coach.name}的课程`);
};

onMounted(() => {
  fetchCoaches();
});
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

/* 加载状态 */
.loading {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 标题 */
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

/* 教练卡片网格 */
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
  transition: transform 0.2s, box-shadow 0.2s;
}

.coach-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.coach-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.coach-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.coach-info {
  flex: 1;
}

.coach-name {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.coach-specialty {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.coach-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tag {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  background: #eff6ff;
  color: #1d4ed8;
}

.tag:first-child {
  background: #fef3c7;
  color: #92400e;
}

.coach-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.btn-detail {
  padding: 6px 14px;
  font-size: 13px;
  color: #4f46e5;
  background: transparent;
  border: 1px solid #4f46e5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-detail:hover {
  background: #4f46e5;
  color: #fff;
}

.btn-book {
  padding: 6px 14px;
  font-size: 13px;
  color: #fff;
  background: #10b981;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-book:hover {
  background: #059669;
}
</style>