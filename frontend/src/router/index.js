import { createRouter, createWebHistory } from 'vue-router';
import DashboardLayout from '../layouts/DashboardLayout.vue';

const routes = [
  { 
    path: '/login', 
    name: 'Login', 
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: DashboardLayout,
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/DashboardView.vue') },
      { path: 'coaches', name: 'Coaches', component: () => import('../views/CoachView.vue') },
      { path: 'courses', name: 'Courses', component: () => import('../views/CourseView.vue') },
      { path: 'members', name: 'Members', component: () => import('../views/MemberView.vue') },
      { path: '', redirect: '/dashboard' }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// 全局前置守卫
router.beforeEach((to, from) => {
  const token = localStorage.getItem('token');
  const requiresAuth = to.meta.requiresAuth !== false;
  
  // 需要认证的页面且没有token，跳转登录页
  if (requiresAuth && !token) {
    return '/login';
  } else if (to.path === '/login' && token) {
    // 已登录访问登录页，跳转首页
    return '/dashboard';
  }
});

export default router;