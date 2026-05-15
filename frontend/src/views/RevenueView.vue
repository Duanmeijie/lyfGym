<template>
  <div>
    <div class="section-header">
      <div class="section-title">营收概览</div>
      <div class="header-actions">
        <div class="filter-buttons">
          <button
            v-for="opt in filterOptions"
            :key="opt.value"
            :class="['filter-btn', { active: activeFilter === opt.value }]"
            @click="switchFilter(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-label">总收入</div>
        <div class="stat-value">¥{{ formatNumber(totalRevenue) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-label">本月收入</div>
        <div class="stat-value">¥{{ formatNumber(monthRevenue) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-label">本周收入</div>
        <div class="stat-value">¥{{ formatNumber(weekRevenue) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-label">今日收入</div>
        <div class="stat-value">¥{{ formatNumber(todayRevenue) }}</div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-container chart-container--wide">
        <v-chart class="chart" :option="monthlyChartOption" autoresize />
      </div>
      <div class="chart-container chart-container--narrow">
        <v-chart class="chart" :option="typeChartOption" autoresize />
      </div>
    </div>

    <div class="chart-container chart-container--full">
      <v-chart class="chart" :option="topProductsChartOption" autoresize />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { use } from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';

import {
  getRevenueStats,
  getMonthlyRevenue,
  getRevenueByType,
  getTopProducts
} from '@/api/revenue';

use([BarChart, LineChart, PieChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

const filterOptions = [
  { value: '7d', label: '过去7天' },
  { value: '30d', label: '过去30天' },
  { value: '12m', label: '过去12个月' }
];

const activeFilter = ref('30d');
const loading = ref(false);

const totalRevenue = ref(0);
const monthRevenue = ref(0);
const weekRevenue = ref(0);
const todayRevenue = ref(0);

const monthlyLabels = ref([]);
const monthlyValues = ref([]);

const typeData = ref([]);

const topProductNames = ref([]);
const topProductValues = ref([]);

const formatNumber = (num) => {
  return (num || 0).toLocaleString('zh-CN');
};

const switchFilter = (value) => {
  activeFilter.value = value;
  fetchAll();
};

const fetchStats = async () => {
  try {
    const res = await getRevenueStats({ range: activeFilter.value });
    if (res.data.code === 200) {
      const stats = res.data.data;
      totalRevenue.value = stats.total_revenue;
      monthRevenue.value = stats.month_revenue;
      weekRevenue.value = stats.week_revenue;
      todayRevenue.value = stats.today_revenue;
    }
  } catch {
    totalRevenue.value = 0;
    monthRevenue.value = 0;
    weekRevenue.value = 0;
    todayRevenue.value = 0;
  }
};

const fetchMonthly = async () => {
  try {
    const res = await getMonthlyRevenue({ range: activeFilter.value });
    if (res.data.code === 200) {
      monthlyLabels.value = res.data.data.map(item => item.month);
      monthlyValues.value = res.data.data.map(item => item.revenue);
    }
  } catch {
    const now = new Date();
    const months = [];
    const values = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getMonth() + 1}月`);
      values.push(Math.floor(Math.random() * 50000) + 10000);
    }
    monthlyLabels.value = months;
    monthlyValues.value = values;
  }
};

const fetchByType = async () => {
  try {
    const res = await getRevenueByType({ range: activeFilter.value });
    if (res.data.code === 200) {
      typeData.value = res.data.data.map(item => ({
        name: item.name,
        value: item.revenue
      }));
    }
  } catch {
    typeData.value = [
      { name: '会员卡', value: 58000 },
      { name: '商品', value: 26000 },
      { name: '课程', value: 18000 }
    ];
  }
};

const fetchTopProducts = async () => {
  try {
    const res = await getTopProducts({ range: activeFilter.value });
    if (res.data.code === 200) {
      topProductNames.value = res.data.data.map(item => item.name);
      topProductValues.value = res.data.data.map(item => item.revenue);
    }
  } catch {
    topProductNames.value = ['私教课', '月卡', '年卡', '运动补剂', '瑜伽垫', '健身手套', '弹力带', '运动水壶'];
    topProductValues.value = [32000, 28000, 24000, 8600, 5200, 3800, 2900, 2100];
  }
};

const fetchAll = async () => {
  loading.value = true;
  await Promise.all([
    fetchStats(),
    fetchMonthly(),
    fetchByType(),
    fetchTopProducts()
  ]);
  loading.value = false;
};

const monthlyChartOption = computed(() => ({
  title: {
    text: '月度营收趋势',
    left: 'center',
    textStyle: { fontSize: 16, fontWeight: 600 }
  },
  tooltip: {
    trigger: 'axis',
    formatter: (params) => {
      const p = params[0];
      return `${p.axisValue}<br/>营收：¥${formatNumber(p.value)}`;
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: monthlyLabels.value,
    axisLabel: { color: '#6b7280' },
    axisLine: { lineStyle: { color: '#e5e7eb' } }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#6b7280',
      formatter: (val) => `¥${val / 1000}k`
    },
    splitLine: { lineStyle: { color: '#f3f4f6' } }
  },
  series: [
    {
      name: '营收',
      type: 'bar',
      data: monthlyValues.value,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#4f46e5' },
            { offset: 1, color: '#818cf8' }
          ]
        },
        borderRadius: [4, 4, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: '#4338ca'
        }
      }
    }
  ]
}));

const typeChartOption = computed(() => ({
  title: {
    text: '营收类型分布',
    left: 'center',
    textStyle: { fontSize: 16, fontWeight: 600 }
  },
  tooltip: {
    trigger: 'item',
    formatter: (params) => `${params.name}<br/>营收：¥${formatNumber(params.value)}（${params.percent}%）`
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    top: 'center',
    textStyle: { fontSize: 13, color: '#374151' }
  },
  series: [
    {
      name: '营收类型',
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['60%', '50%'],
      avoidLabelOverlap: true,
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      },
      data: typeData.value.map((item, index) => ({
        ...item,
        itemStyle: {
          color: ['#4f46e5', '#f59e0b', '#10b981'][index]
        }
      }))
    }
  ]
}));

const topProductsChartOption = computed(() => {
  const reversedNames = [...topProductNames.value].reverse();
  const reversedValues = [...topProductValues.value].reverse();

  return {
    title: {
      text: '产品营收排行',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const p = params[0];
        return `${p.name}<br/>营收：¥${formatNumber(p.value)}`;
      }
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#6b7280',
        formatter: (val) => `¥${val / 1000}k`
      },
      splitLine: { lineStyle: { color: '#f3f4f6' } }
    },
    yAxis: {
      type: 'category',
      data: reversedNames,
      axisLabel: { color: '#374151', fontSize: 13 },
      axisLine: { lineStyle: { color: '#e5e7eb' } }
    },
    series: [
      {
        name: '营收',
        type: 'bar',
        data: reversedValues.map((val, idx) => ({
          value: val,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: idx === reversedValues.length - 1 ? '#f59e0b' : '#10b981' },
                { offset: 1, color: idx === reversedValues.length - 1 ? '#fbbf24' : '#34d399' }
              ]
            },
            borderRadius: [0, 4, 4, 0]
          }
        })),
        barWidth: 28,
        label: {
          show: true,
          position: 'right',
          formatter: (params) => `¥${formatNumber(params.value)}`,
          color: '#374151',
          fontSize: 12
        }
      }
    ]
  };
});

onMounted(() => {
  fetchAll();
});
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-buttons {
  display: flex;
  gap: 4px;
  background: #f3f4f6;
  padding: 3px;
  border-radius: 8px;
}

.filter-btn {
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: #fff;
  color: #1f2937;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  padding: 22px 24px;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 28px;
  margin-bottom: 12px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
}

.charts-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-container {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 20px;
  transition: box-shadow 0.2s;
}

.chart-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chart-container--wide {
  flex: 6;
}

.chart-container--narrow {
  flex: 4;
}

.chart-container--full {
  width: 100%;
  margin-bottom: 0;
}

.chart {
  width: 100%;
  height: 350px;
}

@media (max-width: 900px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-row {
    flex-direction: column;
  }
}

@media (max-width: 600px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>
