<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h1 class="title">LyfGym 健身房管理系统</h1>

      <form @submit.prevent="handleLogin" class="form">
        <div class="form-group">
          <label>账号</label>
          <input
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="footer">
        © 2026 LyfGym. All rights reserved.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const userStore = useUserStore();

const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');

const handleLogin = async () => {
  errorMsg.value = '';
  if (!username.value.trim() || !password.value.trim()) {
    errorMsg.value = '请输入账号密码';
    return;
  }

  loading.value = true;
  const result = await userStore.login({
    username: username.value,
    password: password.value
  });

  loading.value = false;

  if (result.success) {
    router.push('/dashboard');
  } else {
    errorMsg.value = result.message;
  }
};
</script>

<style scoped>
.login-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%);
  padding: 20px;
  box-sizing: border-box;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 40px 32px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  color: #fff;
  text-align: center;
}

.title {
  margin: 0 0 28px;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.5px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  font-size: 15px;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid transparent;
  border-radius: 10px;
  outline: none;
  transition: all 0.25s ease;
  box-sizing: border-box;
  caret-color: #fff;
}

.form-group input:focus {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(79, 70, 229, 0.6);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
}

.error-msg {
  font-size: 13px;
  color: #f87171;
  text-align: left;
}

.btn-login {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #4f46e5, #6d5ce6);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.25s ease;
}

.btn-login:hover:not(:disabled) {
  background: linear-gradient(135deg, #4338ca, #5b4cf0);
  transform: translateY(-1px);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.footer {
  margin-top: 24px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}
</style>