<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="brand-area">
        <span class="brand-icon">🏋️</span>
        <h1 class="title">LyfGym 管理系统</h1>
        <p class="subtitle">健身房一体化运营管理平台</p>
      </div>

      <form @submit.prevent="handleLogin" class="form">
        <div class="form-group">
          <label>用户名</label>
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              autocomplete="username"
            />
          </div>
        </div>

        <div class="form-group">
          <label>密码</label>
          <div class="input-wrapper">
            <span class="input-icon">🔒</span>
            <input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              autocomplete="current-password"
            />
          </div>
        </div>

        <div v-if="errorMsg" class="error-msg">
          <span>⚠️</span> {{ errorMsg }}
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>登 录</span>
        </button>
      </form>

      <div class="register-link">
        还没有账号？
        <a href="#" @click.prevent="showRegisterModal = true">立即注册</a>
      </div>

      <div class="footer">
        © 2026 LyfGym. All rights reserved.
      </div>
    </div>

    <div v-if="showRegisterModal" class="modal-overlay" @click.self="closeRegisterModal">
      <div class="modal-content">
        <button class="modal-close" @click="closeRegisterModal">✕</button>
        <h2 class="modal-title">创建管理员账号</h2>
        <p class="modal-subtitle">注册后可使用新账号登录系统</p>

        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label>用户名 <span class="required">*</span></label>
            <input
              v-model="regForm.username"
              type="text"
              placeholder="3-20个字符，字母或数字"
              @input="regForm.usernameError = ''"
              @blur="validateUsername"
            />
            <div v-if="regForm.usernameError" class="field-error">{{ regForm.usernameError }}</div>
          </div>

          <div class="form-group">
            <label>密码 <span class="required">*</span></label>
            <input
              v-model="regForm.password"
              type="password"
              placeholder="至少6位，建议包含字母和数字"
              @input="onPasswordInput"
            />
            <div class="password-strength" v-if="regForm.password">
              <div class="strength-bar">
                <div
                  :class="['strength-fill', strengthClass]"
                  :style="{ width: strengthPercent + '%' }"
                ></div>
              </div>
              <span class="strength-label">{{ strengthLabel }}</span>
            </div>
            <div v-if="regForm.passwordError" class="field-error">{{ regForm.passwordError }}</div>
          </div>

          <div class="form-group">
            <label>确认密码 <span class="required">*</span></label>
            <input
              v-model="regForm.confirmPassword"
              type="password"
              placeholder="再次输入密码"
              @input="regForm.confirmError = ''"
              @blur="validateConfirmPassword"
            />
            <div v-if="regForm.confirmError" class="field-error">{{ regForm.confirmError }}</div>
          </div>

          <div class="form-group">
            <label>真实姓名（选填）</label>
            <input
              v-model="regForm.realName"
              type="text"
              placeholder="请输入真实姓名"
            />
          </div>

          <div v-if="regForm.generalError" class="error-msg">
            <span>⚠️</span> {{ regForm.generalError }}
          </div>

          <div v-if="regForm.successMsg" class="success-msg">
            <span>✅</span> {{ regForm.successMsg }}
          </div>

          <button type="submit" class="btn-login" :disabled="regForm.submitting">
            <span v-if="regForm.submitting" class="spinner"></span>
            <span v-else>注 册</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { register as registerApi } from '@/api/auth';

const router = useRouter();
const userStore = useUserStore();

const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');
const showRegisterModal = ref(false);

const regForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  usernameError: '',
  passwordError: '',
  confirmError: '',
  generalError: '',
  successMsg: '',
  submitting: false
});

const strengthLevel = computed(() => {
  const pwd = regForm.password;
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 6) score += 20;
  if (pwd.length >= 8) score += 15;
  if (pwd.length >= 12) score += 10;
  if (/[a-z]/.test(pwd)) score += 15;
  if (/[A-Z]/.test(pwd)) score += 15;
  if (/[0-9]/.test(pwd)) score += 15;
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 10;
  return Math.min(100, score);
});

const strengthPercent = computed(() => strengthLevel.value);

const strengthClass = computed(() => {
  const level = strengthLevel.value;
  if (level < 35) return 'weak';
  if (level < 65) return 'medium';
  return 'strong';
});

const strengthLabel = computed(() => {
  const level = strengthLevel.value;
  if (!regForm.password) return '';
  if (level < 35) return '弱';
  if (level < 65) return '中';
  return '强';
});

const validateUsername = () => {
  const val = regForm.username.trim();
  if (!val) {
    regForm.usernameError = '请输入用户名';
    return false;
  }
  if (val.length < 3 || val.length > 20) {
    regForm.usernameError = '用户名长度应为3-20个字符';
    return false;
  }
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(val)) {
    regForm.usernameError = '用户名只能包含字母、数字、下划线和中文';
    return false;
  }
  regForm.usernameError = '';
  return true;
};

const validateConfirmPassword = () => {
  if (regForm.password !== regForm.confirmPassword) {
    regForm.confirmError = '两次输入的密码不一致';
    return false;
  }
  regForm.confirmError = '';
  return true;
};

const onPasswordInput = () => {
  regForm.passwordError = '';
  if (regForm.confirmPassword) {
    validateConfirmPassword();
  }
};

const closeRegisterModal = () => {
  showRegisterModal.value = false;
  regForm.username = '';
  regForm.password = '';
  regForm.confirmPassword = '';
  regForm.realName = '';
  regForm.usernameError = '';
  regForm.passwordError = '';
  regForm.confirmError = '';
  regForm.generalError = '';
  regForm.successMsg = '';
};

const handleLogin = async () => {
  errorMsg.value = '';
  if (!username.value.trim() || !password.value.trim()) {
    errorMsg.value = '请输入用户名和密码';
    return;
  }

  loading.value = true;
  const result = await userStore.login({
    username: username.value.trim(),
    password: password.value
  });
  loading.value = false;

  if (result.success) {
    router.push('/dashboard');
  } else {
    errorMsg.value = result.message;
  }
};

const handleRegister = async () => {
  regForm.generalError = '';
  regForm.successMsg = '';

  const isUsernameValid = validateUsername();
  if (!regForm.password) {
    regForm.passwordError = '请输入密码';
  } else if (regForm.password.length < 6) {
    regForm.passwordError = '密码长度不能少于6位';
  }
  const isConfirmValid = validateConfirmPassword();

  if (!isUsernameValid || regForm.passwordError || !isConfirmValid) return;

  regForm.submitting = true;
  try {
    const res = await registerApi({
      username: regForm.username.trim(),
      password: regForm.password,
      realName: regForm.realName.trim() || undefined
    });

    if (res.data.code === 200) {
      regForm.successMsg = `注册成功！用户「${regForm.username.trim()}」已创建`;
      regForm.username = '';
      regForm.password = '';
      regForm.confirmPassword = '';
      regForm.realName = '';
      setTimeout(() => {
        closeRegisterModal();
      }, 2000);
    } else {
      regForm.generalError = res.data.message;
    }
  } catch (error) {
    regForm.generalError = error.response?.data?.message || '注册失败，请稍后重试';
  } finally {
    regForm.submitting = false;
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
  padding: 40px 36px 28px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  color: #fff;
  text-align: center;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.brand-area {
  margin-bottom: 32px;
}

.brand-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 8px;
}

.title {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #a5b4fc, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  text-align: left;
}

.form-group {
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.required {
  color: #f87171;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  z-index: 1;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 14px 12px 40px;
  font-size: 15px;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  outline: none;
  transition: all 0.25s ease;
  box-sizing: border-box;
  caret-color: #818cf8;
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  font-size: 15px;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  outline: none;
  transition: all 0.25s ease;
  box-sizing: border-box;
  caret-color: #818cf8;
}

.form-group input:focus {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(129, 140, 248, 0.5);
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.12);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.error-msg {
  font-size: 13px;
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
  padding: 10px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.field-error {
  font-size: 12px;
  color: #f87171;
  margin-top: 4px;
}

.success-msg {
  font-size: 13px;
  color: #34d399;
  background: rgba(52, 211, 153, 0.1);
  padding: 10px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-login {
  width: 100%;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 2px;
}

.btn-login:hover:not(:disabled) {
  background: linear-gradient(135deg, #4338ca, #4f46e5);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.register-link {
  margin-top: 20px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.register-link a {
  color: #818cf8;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

.footer {
  margin-top: 20px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease, background 0.3s ease;
}

.strength-fill.weak { background: #f87171; }
.strength-fill.medium { background: #fbbf24; }
.strength-fill.strong { background: #34d399; }

.strength-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  width: 20px;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: modalFadeIn 0.2s ease;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 36px 32px 28px;
  width: 90%;
  max-width: 440px;
  position: relative;
  color: #fff;
  animation: modalSlideIn 0.3s ease;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.modal-title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}

.modal-subtitle {
  margin: 0 0 24px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}
</style>
