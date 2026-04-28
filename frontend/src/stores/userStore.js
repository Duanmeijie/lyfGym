import { defineStore } from 'pinia';
import { login as loginApi } from '@/api/auth';
import { useRouter } from 'vue-router';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null
  }),
  actions: {
    async login(credentials) {
      try {
        const res = await loginApi(credentials);
        if (res.data.code === 200) {
          const { token, userInfo } = res.data.data;
          this.token = token;
          this.userInfo = userInfo;
          // 持久化到 localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          return { success: true };
        }
        return { success: false, message: res.data.message };
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || '登录失败，请稍后重试' 
        };
      }
    },
    logout() {
      this.token = null;
      this.userInfo = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    }
  }
});