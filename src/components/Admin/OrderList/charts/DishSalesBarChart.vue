<template>
  <div>
    <Bar :data="chartData" :options="chartOptions" :height="height" :width="width" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
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

// 創建漸變色的函數
const createGradient = (ctx, count) => {
  const colors = [];
  const baseColor = [75, 192, 192]; // rgb色彩
  
  for (let i = 0; i < count; i++) {
    // 色調略微變化以創建視覺差異
    const shade = Math.max(0, 1 - (i * 0.05));
    colors.push(`rgba(${baseColor[0]}, ${baseColor[1] * shade}, ${baseColor[2] * shade}, 0.7)`);
  }
  
  return colors;
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

  // 限制顯示前10個餐點
  const topDishes = props.dishSales.slice(0, 10);
  
  return {
    labels: topDishes.map(item => limitNameLength(item.name)),
    datasets: [{
      label: '銷量',
      data: topDishes.map(item => item.count),
      backgroundColor: createGradient(null, topDishes.length),
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      borderRadius: 4,
      barPercentage: 0.8,
      maxBarThickness: 30,
      minBarLength: 2
    }]
  };
});

const chartOptions = computed(() => {
  const originalNames = props.dishSales?.map(item => item.name) || [];
  // 找出最大值以便設置合適的最大刻度
  const maxValue = props.dishSales?.length > 0 
    ? Math.max(...props.dishSales.map(item => item.count))
    : 0;
  const suggestedMax = Math.ceil(maxValue * 1.10); // 增加10%空間

  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    layout: {
      padding: 10
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: '餐點銷量排行 TOP 10',
        padding: {
          top: 10,
          bottom: 20
        },
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        boxPadding: 6,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        cornerRadius: 6,
        callbacks: {
          title: function (context) {
            const index = context[0].dataIndex;
            return originalNames[index] || ''; // 顯示完整名稱
          },
          label: function(context) {
            return `銷量: ${context.raw} 份`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        suggestedMax: suggestedMax,
        title: {
          display: true,
          text: '銷售數量',
          font: {
            size: 14
          },
          padding: {
            top: 10
          }
        },
        ticks: {
          precision: 0,
          font: {
            size: 12
          }
        },
        grid: {
          display: true,
          drawBorder: true,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        ticks: {
          callback: function (value) {
            return limitNameLength(this.getLabelForValue(value));
          },
          font: {
            size: 12
          }
        },
        grid: {
          display: false
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };
});
</script>