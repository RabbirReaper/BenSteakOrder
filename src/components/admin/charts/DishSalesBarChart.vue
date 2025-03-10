<template>
  <div>
    <Bar :data="chartData" :options="chartOptions" :height="height" :width="width" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  dishSales: {
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

// 限制名稱長度的輔助函數
const limitNameLength = (name, maxLength = 15) => {
  if (!name) return '';
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
};

const chartData = computed(() => {
  // 如果沒有數據，顯示空狀態
  if (!props.dishSales || props.dishSales.length === 0) {
    return {
      labels: ['無數據'],
      datasets: [{
        label: '銷量',
        data: [0],
        backgroundColor: 'rgba(200, 200, 200, 0.7)',
        borderColor: 'rgba(200, 200, 200, 1)',
        borderWidth: 1
      }]
    };
  }
  return {
    labels: props.dishSales.map(item => limitNameLength(item.name)),
    datasets: [{
      label: '銷量',
      data: props.dishSales.map(item => item.count),
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };
});

const chartOptions = computed(() => {
  const originalNames = props.dishSales?.map(item => item.name) || [];

  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: '餐點銷量排行'
      },
      tooltip: {
        callbacks: {
          title: function (context) {
            const index = context[0].dataIndex;
            return originalNames[index] || ''; // 顯示完整名稱
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: '銷售數量'
        },
        ticks: {
          precision: 0
        }
      },
      y: {
        ticks: {
          callback: function (value) {
            return limitNameLength(this.getLabelForValue(value));
          }
        }
      }
    }
  };
});

onMounted(() => {
})
</script>