<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-icon">🏋️</span>
        <span class="brand-text">LyfGym 管理系统</span>
      </div>
      
      <div class="sidebar-section">
        <div class="section-label">概览</div>
        <nav class="sidebar-nav">
          <router-link
            v-for="item in overviewItems"
            :key="item.key"
            :to="item.path"
            custom
            v-slot="{ navigate, isActive }">
            <a class="nav-link" :class="{ active: isActive }" @click="navigate">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          </router-link>
        </nav>
      </div>

      <div class="sidebar-section">
        <div class="section-label">运营管理</div>
        <nav class="sidebar-nav">
          <router-link
            v-for="item in operationItems"
            :key="item.key"
            :to="item.path"
            custom
            v-slot="{ navigate, isActive }">
            <a class="nav-link" :class="{ active: isActive }" @click="navigate">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          </router-link>
        </nav>
      </div>

      <div class="sidebar-section">
        <div class="section-label">商业</div>
        <nav class="sidebar-nav">
          <router-link
            v-for="item in businessItems"
            :key="item.key"
            :to="item.path"
            custom
            v-slot="{ navigate, isActive }">
            <a class="nav-link" :class="{ active: isActive }" @click="navigate">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          </router-link>
        </nav>
      </div>

      <div class="sidebar-section">
        <div class="section-label">系统</div>
        <nav class="sidebar-nav">
          <router-link
            v-for="item in systemItems"
            :key="item.key"
            :to="item.path"
            custom
            v-slot="{ navigate, isActive }">
            <a class="nav-link" :class="{ active: isActive }" @click="navigate">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          </router-link>
        </nav>
      </div>
    </aside>

    <div class="main-area">
      <header class="topbar">
        <div class="topbar-left">
          <span class="topbar-date">{{ currentDate }}</span>
        </div>
        <div class="topbar-right">
          <span class="user-badge">管理员</span>
          <span class="user-name">Admin</span>
          <button class="logout-btn" @click="handleLogout">退出登录</button>
        </div>
      </header>

      <main class="content">
        <router-view />
      </main>
      
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

const overviewItems = [
  { key: 'dashboard', path: '/dashboard', label: '数据看板', icon: '📊' },
  { key: 'revenue', path: '/revenue', label: '营收统计', icon: '💰' },
];

const operationItems = [
  { key: 'members', path: '/members', label: '会员管理', icon: '👥' },
  { key: 'coaches', path: '/coaches', label: '教练管理', icon: '💪' },
  { key: 'courses', path: '/courses', label: '课程管理', icon: '📅' },
  { key: 'bookings', path: '/bookings', label: '预约管理', icon: '📋' },
];

const businessItems = [
  { key: 'products', path: '/products', label: '商品管理', icon: '🏷️' },
  { key: 'orders', path: '/orders', label: '订单管理', icon: '🧾' },
];

const systemItems = [
  { key: 'announcements', path: '/announcements', label: '公告管理', icon: '📢' },
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
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
}

.sidebar-brand {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.brand-icon {
  font-size: 24px;
}

.brand-text {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #818cf8, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-section {
  padding: 12px 0 4px;
}

.section-label {
  padding: 8px 24px 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 1px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 24px;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  cursor: pointer;
  margin: 1px 8px;
  border-radius: 8px;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.nav-link.active {
  background: rgba(99, 102, 241, 0.15);
  color: #fff;
  border-left-color: #6366f1;
}

.nav-icon {
  font-size: 16px;
  width: 22px;
  text-align: center;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 28px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.topbar-date {
  font-size: 14px;
  color: #6b7280;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-badge {
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 20px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.logout-btn {
  padding: 6px 14px;
  font-size: 13px;
  color: #6366f1;
  background: transparent;
  border: 1px solid #6366f1;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #6366f1;
  color: #fff;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content {
  flex: 1;
  padding: 28px;
  overflow-y: auto;
  background: #f1f5f9;
}
</style>
