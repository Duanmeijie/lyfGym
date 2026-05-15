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
      { path: 'members', name: 'Members', component: () => import('../views/MemberView.vue') },
      { path: 'members/:id', name: 'MemberDetail', component: () => import('../views/MemberDetailView.vue') },
      { path: 'coaches', name: 'Coaches', component: () => import('../views/CoachView.vue') },
      { path: 'courses', name: 'Courses', component: () => import('../views/CourseView.vue') },
      { path: 'bookings', name: 'Bookings', component: () => import('../views/BookingsView.vue') },
      { path: 'products', name: 'Products', component: () => import('../views/ProductsView.vue') },
      { path: 'orders', name: 'Orders', component: () => import('../views/OrdersView.vue') },
      { path: 'revenue', name: 'Revenue', component: () => import('../views/RevenueView.vue') },
      { path: 'announcements', name: 'Announcements', component: () => import('../views/AnnouncementsView.vue') },
      { path: '', redirect: '/dashboard' }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, from) => {
  const token = localStorage.getItem('token');
  const requiresAuth = to.meta.requiresAuth !== false;
  
  if (requiresAuth && !token) {
    return '/login';
  } else if (to.path === '/login' && token) {
    return '/dashboard';
  }
});

export default router;
