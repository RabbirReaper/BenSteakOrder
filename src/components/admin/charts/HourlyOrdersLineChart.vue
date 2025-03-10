<template>
  <div>
    <Line :data="chartData" :options="chartOptions" :width="width" :height="height" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler  // 添加 Filler 插件
} from 'chart.js';

ChartJS.register(
  Title, 
  Tooltip, 
  Legend, 
  LineElement, 
  PointElement, 
  CategoryScale, 
  LinearScale,
  Filler  // 註冊 Filler 插件
);

const props = defineProps({
  hourlyData: {  // 確保這裡使用 hourlyData 而非 dishSales
    type: Array,
    required: true
  },
  width: {
    type: Number,
    default: 400
  },
  height: {
    type: Number,
    default: 400
  }
});

const chartData = computed(() => {
  if (!props.hourlyData || props.hourlyData.length === 0) {
    return {
      labels: ['無數據'],
      datasets: [{
        label: '銷售量',
        data: [0],
        backgroundColor: 'rgba(200, 200, 200, 0.2)',
        borderColor: 'rgba(200, 200, 200, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    };
  }

  return {
    labels: props.hourlyData.map(item => item.time),
    datasets: [{
      label: '銷售量',
      data: props.hourlyData.map(item => item.count),
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true
    }]
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: '銷售數據分析'
    },
    tooltip: {
      callbacks: {
        label: context => `銷售量: ${context.raw}`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: { display: true, text: '銷售量' }
    },
    x: {
      title: { display: true, text: '時間' }
    }
  }
}));
</script>