import axios from 'axios';

// 创建 axios 实例
const instance = axios.create({
  baseURL: '/api',
  timeout: 5000
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 从 localStorage 读取 token 并添加到 Header
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 开启 loading 标记（可以在全局状态管理中控制）
    console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    console.log(`[Response] ${response.config.url} - Success`);
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // 401 未授权:清除 token 并跳转登录页
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
        return Promise.reject(new Error('登录已过期，请重新登录'));
      }
      
      // 其他错误:显示后端返回的错误信息
      const message = data?.message || `请求失败 (${status})`;
      alert(message);
    } else {
      alert('网络错误，请检查网络连接');
    }
    
    return Promise.reject(error);
  }
);

export default instance;