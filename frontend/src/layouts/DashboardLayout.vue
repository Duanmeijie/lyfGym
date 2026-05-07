<template>
  <div class="dashboard-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-brand">LyfGym 后台</div>
      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.key"
          :to="item.path"
          custom
          v-slot="{ navigate, isActive }">
          <a
            class="nav-link"
            :class="{ active: isActive }"
            @click="navigate"
          >
            <span class="icon">{{ item.icon }}</span>
            <span class="label">{{ item.label }}</span>
          </a>
        </router-link>
      </nav>
    </aside>

    <!-- 右侧布局 -->
    <div class="main-area">
      <!-- 顶部导航 -->
      <header class="topbar">
        <div class="date">{{ currentDate }}</div>
        <div class="user-info">
          管理员:Admin
          <button class="logout-btn" @click="handleLogout">退出登录</button>
        </div>
      </header>

      <!-- 主内容区 - 子路由渲染位置 -->
      <main class="content">
        <router-view />
      </main>
      
      <!-- AI 助手 -->
      <AiAssistant />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import AiAssistant from '@/components/AiAssistant.vue';

const router = useRouter();
const currentDate = ref('');
let timer = null;

const menuItems = [
  { key: 'members', path: '/dashboard', label: '会员管理', icon: '👥' },
  { key: 'coaches', path: '/coaches', label: '教练管理', icon: '💪' },
  { key: 'courses', path: '/courses', label: '课程管理', icon: '📅' },
  { key: 'settings', path: '/settings', label: '系统设置', icon: '⚙️' }
];

const handleLogout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};

const updateDate = () => {
  const now = new Date();
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

onMounted(() => {
  updateDate();
  timer = setInterval(updateDate, 60000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
/* 整体布局 */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

/* 侧边栏 */
.sidebar {
  width: 250px;
  background: #1f2937;
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-brand {
  padding: 20px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  cursor: pointer;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.nav-link.active {
  background: rgba(79, 70, 229, 0.15);
  color: #fff;
  border-left-color: #4f46e5;
}

.icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

/* 顶部导航 */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.date {
  font-size: 14px;
  color: #6b7280;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #374151;
}

.logout-btn {
  margin-left: 12px;
  padding: 6px 14px;
  font-size: 13px;
  color: #4f46e5;
  background: transparent;
  border: 1px solid #4f46e5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #4f46e5;
  color: #fff;
}

/* 主内容区 */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f9fafb;
}
</style>