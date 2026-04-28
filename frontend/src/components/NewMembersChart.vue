<template>
  <div class="chart-container">
    <v-chart class="chart" :option="chartOption" autoresize />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';

// 注册必需的组件
use([LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

const props = defineProps({
  members: {
    type: Array,
    default: () => []
  }
});

const chartOption = computed(() => {
  // 获取最近7天的日期
  const dates = [];
  const counts = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    dates.push(dateStr.slice(5)); // 只显示 月-日
    
    // 统计当天新增会员数
    const count = props.members.filter(m => {
      if (!m.created_at) return false;
      return m.created_at.startsWith(dateStr);
    }).length;
    counts.push(count);
  }

  return {
    title: {
      text: '近七日新增会员',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        name: '新增会员',
        type: 'line',
        data: counts,
        smooth: true,
        itemStyle: {
          color: '#4f46e5'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(79, 70, 229, 0.3)' },
              { offset: 1, color: 'rgba(79, 70, 229, 0.05)' }
            ]
          }
        }
      }
    ]
  };
});
</script>

<style scoped>
.chart-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 24px;
}

.chart {
  width: 100%;
  height: 400px;
}
</style>