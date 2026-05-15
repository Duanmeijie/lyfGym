<template>
  <div class="stats-cards">
    <div class="stat-card">
      <div class="stat-label">🏷️ 商品总数</div>
      <div class="stat-value">{{ stats.totalProducts }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">📦 库存总价值</div>
      <div class="stat-value">¥{{ formatPrice(stats.totalStockValue) }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">📊 分类数量</div>
      <div class="stat-value">{{ stats.categoriesCount }}</div>
    </div>
  </div>

  <div class="section-header">
    <div class="section-title">商品管理</div>
    <div class="header-actions">
      <input v-model="searchKeyword" type="text" placeholder="搜索商品名称" class="search-input" @input="handleSearch" />
      <select v-model="filterCategory" @change="fetchProducts" class="filter-select">
        <option value="">全部分类</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <button class="btn-add" @click="openAddModal">新增商品</button>
    </div>
  </div>

  <div v-if="loading" class="loading">加载中...</div>

  <div v-else class="product-table">
    <table>
      <thead>
        <tr>
          <th>商品名称</th>
          <th>分类</th>
          <th>价格</th>
          <th>库存</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.name }}</td>
          <td>{{ product.category }}</td>
          <td>¥{{ formatPrice(product.price) }}</td>
          <td :class="{ 'text-warning': product.stock <= 10 && product.stock > 0 }">
            {{ product.stock }}
          </td>
          <td>
            <span :class="['status-tag', product.is_active ? 'active' : 'disabled']">
              {{ product.is_active ? '上架' : '下架' }}
            </span>
          </td>
          <td>
            <button class="btn-edit" @click="toggleStatus(product)">
              {{ product.is_active ? '下架' : '上架' }}
            </button>
            <button class="btn-edit" @click="openEditModal(product)">编辑</button>
            <button class="btn-delete" @click="handleDelete(product)">删除</button>
          </td>
        </tr>
        <tr v-if="products.length === 0">
          <td colspan="6" class="empty">暂无商品数据</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
    <div class="modal">
      <h3>{{ isEdit ? '编辑商品' : '新增商品' }}</h3>
      <form @submit.prevent="submitProduct">
        <div class="form-group">
          <label>商品名称</label>
          <input v-model="form.name" type="text" required />
        </div>
        <div class="form-group">
          <label>分类</label>
          <select v-model="form.category" required>
            <option value="">选择分类</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>价格</label>
            <input v-model.number="form.price" type="number" min="0" step="0.01" required />
          </div>
          <div class="form-group">
            <label>成本</label>
            <input v-model.number="form.cost" type="number" min="0" step="0.01" required />
          </div>
        </div>
        <div class="form-group">
          <label>库存</label>
          <input v-model.number="form.stock" type="number" min="0" required />
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea v-model="form.description" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>状态</label>
          <select v-model="form.is_active">
            <option :value="true">上架</option>
            <option :value="false">下架</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="showModal = false">取消</button>
          <button type="submit" class="btn-submit">{{ isEdit ? '保存' : '添加' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getProducts, getProductStats, addProduct, updateProduct, deleteProduct } from '@/api/product';

const products = ref([]);
const loading = ref(false);
const searchKeyword = ref('');
const filterCategory = ref('');

const stats = ref({ totalProducts: 0, totalStockValue: 0, categoriesCount: 0 });

const showModal = ref(false);
const isEdit = ref(false);
const form = ref({
  id: null,
  name: '',
  category: '',
  price: 0,
  cost: 0,
  stock: 0,
  description: '',
  is_active: true
});

const categories = ['营养补剂', '运动装备', '健身服饰', '其他'];

const formatPrice = (value) => {
  return Number(value).toFixed(2);
};

const fetchStats = async () => {
  try {
    const res = await getProductStats();
    if (res.data.code === 200) {
      stats.value = res.data.data;
    }
  } catch (error) {
    console.error('获取统计失败', error);
  }
};

const fetchProducts = async () => {
  loading.value = true;
  try {
    const params = { search: searchKeyword.value, category: filterCategory.value };
    const res = await getProducts(params);
    if (res.data.code === 200) {
      products.value = res.data.data;
    }
  } catch (error) {
    alert(error.response?.data?.message || '获取商品列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  fetchProducts();
};

const openAddModal = () => {
  isEdit.value = false;
  form.value = { id: null, name: '', category: '', price: 0, cost: 0, stock: 0, description: '', is_active: true };
  showModal.value = true;
};

const openEditModal = (product) => {
  isEdit.value = true;
  form.value = { ...product };
  showModal.value = true;
};

const submitProduct = async () => {
  try {
    if (isEdit.value) {
      await updateProduct(form.value.id, form.value);
    } else {
      await addProduct(form.value);
    }
    showModal.value = false;
    fetchProducts();
    fetchStats();
  } catch (error) {
    alert(error.response?.data?.message || '操作失败');
  }
};

const toggleStatus = async (product) => {
  try {
    await updateProduct(product.id, { ...product, is_active: !product.is_active });
    fetchProducts();
  } catch (error) {
    alert(error.response?.data?.message || '操作失败');
  }
};

const handleDelete = async (product) => {
  if (!confirm(`确定要删除商品 ${product.name} 吗？`)) return;
  try {
    const res = await deleteProduct(product.id);
    if (res.data.code === 200) {
      alert('删除成功');
      fetchProducts();
      fetchStats();
    } else {
      alert(res.data.message);
    }
  } catch (error) {
    alert(error.response?.data?.message || '删除失败');
  }
};

onMounted(() => {
  fetchStats();
  fetchProducts();
});
</script>

<style scoped>
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
.stat-label { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
.stat-value { font-size: 28px; font-weight: 700; color: #1f2937; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.section-title { font-size: 20px; font-weight: 600; color: #1f2937; }
.header-actions { display: flex; gap: 12px; align-items: center; }
.search-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  width: 200px;
}
.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
.btn-add {
  padding: 8px 16px;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.product-table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.product-table table { width: 100%; border-collapse: collapse; }
.product-table th, .product-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}
.product-table th { background: #f9fafb; font-weight: 600; color: #374151; }
.product-table td { color: #4b5563; }
.text-warning { color: #f59e0b; font-weight: 600; }

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.status-tag.active { background: #d1fae5; color: #065f46; }
.status-tag.disabled { background: #f3f4f6; color: #6b7280; }

.btn-edit, .btn-delete {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
}
.btn-edit { background: #eff6ff; color: #1d4ed8; border: none; }
.btn-delete { background: #fef2f2; color: #dc2626; border: none; }

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  width: 480px;
}
.modal h3 { margin: 0 0 20px; font-size: 18px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 14px; color: #374151; }
.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
.form-row { display: flex; gap: 16px; }
.form-row .form-group { flex: 1; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
.btn-cancel { padding: 8px 16px; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer; }
.btn-submit { padding: 8px 16px; background: #10b981; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
</style>
