<template>
  <div>
    <Pie 
      :data="chartData" 
      :options="chartOptions" 
      :height="height"
      :width="width"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';
import { Pie } from 'vue-chartjs';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const props = defineProps({
  orderTypes: {
    type: Object,
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
  // 提取數據
  const labels = Object.keys(props.orderTypes || {});
  const data = Object.values(props.orderTypes || {});

  // 顏色映射
  const backgroundColors = {
    '內用': 'rgba(54, 162, 235, 0.7)',
    '自取': 'rgba(75, 192, 192, 0.7)',
    'FoodPanda': 'rgba(255, 99, 132, 0.7)',
    'UberEat': 'rgba(255, 206, 86, 0.7)'
  };

  const borderColors = {
    '內用': 'rgba(54, 162, 235, 1)',
    '自取': 'rgba(75, 192, 192, 1)',
    'FoodPanda': 'rgba(255, 99, 132, 1)',
    'UberEat': 'rgba(255, 206, 86, 1)'
  };

  // 如果沒有數據，顯示空狀態
  if (data.length === 0 || data.every(value => value === 0)) {
    return {
      labels: ['無數據'],
      datasets: [{
        data: [1],
        backgroundColor: ['rgba(200, 200, 200, 0.7)'],
        borderColor: ['rgba(200, 200, 200, 1)'],
        borderWidth: 1
      }]
    };
  }

  return {
    labels: labels,
    datasets: [{
      data: data,
      backgroundColor: labels.map(label => backgroundColors[label] || 'rgba(201, 203, 207, 0.7)'),
      borderColor: labels.map(label => borderColors[label] || 'rgba(201, 203, 207, 1)'),
      borderWidth: 1
    }]
  };
});

const chartOptions = computed(() => {
  const data = Object.values(props.orderTypes || {});
  const total = data.reduce((acc, curr) => acc + (curr || 0), 0);
  const safeTotal = total || 1; // 避免除以零

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = Math.round((value / safeTotal) * 100);
            return `${label}: ${value} 筆 (${percentage}%)`;
          }
        }
      },
      legend: {
        position: 'bottom'
      },
      title: {
        display: true,
        text: `總訂單數: ${total} 筆`
      }
    }
  };
});
</script>