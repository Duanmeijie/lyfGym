<script setup>
import { ref } from 'vue';
import { testApi } from '@/utils/request';

const data = ref('');
const loading = ref(false);
const error = ref('');

const handleClick = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await testApi();
    data.value = JSON.stringify(res, null, 2);
  } catch (err) {
    error.value = err.message || '请求失败';
    data.value = '';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container">
    <button @click="handleClick" :disabled="loading">
      {{ loading ? '请求中...' : '测试连接后端' }}
    </button>
    <div v-if="error" class="error">{{ error }}</div>
    <pre v-if="data" class="result">{{ data }}</pre>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
  margin: 60px auto;
  padding: 20px;
  text-align: center;
}

button {
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-top: 16px;
}

.result {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  margin-top: 16px;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>