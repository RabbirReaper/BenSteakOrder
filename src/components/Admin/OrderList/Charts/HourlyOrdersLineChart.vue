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
  Filler
} from 'chart.js';

ChartJS.register(
  Title, 
  Tooltip, 
  Legend, 
  LineElement, 
  PointElement, 
  CategoryScale, 
  LinearScale,
  Filler
);

const props = defineProps({
  hourlyData: {
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

// 過濾掉零值的時間段以使圖表更有焦點
const filterDataForDisplay = computed(() => {
  if (!props.hourlyData || props.hourlyData.length === 0) {
    return [];
  }
  
  // 首先找出有數據的時間範圍
  const nonZeroItems = props.hourlyData.filter(item => item.count > 0);
  if (nonZeroItems.length === 0) {
    return props.hourlyData; // 如果全是零，顯示原始數據
  }
  
  // 找出開店和關店時間
  const timeValues = nonZeroItems.map(item => {
    const [hours, minutes] = item.time.split(':').map(Number);
    return hours * 60 + minutes; // 轉換為分鐘以便比較
  });
  
  const minTime = Math.max(0, Math.min(...timeValues) - 60); // 開店前一小時
  const maxTime = Math.min(24 * 60, Math.max(...timeValues) + 60); // 關店後一小時
  
  // 過濾原始數據以僅顯示有意義的時間段
  return props.hourlyData.filter(item => {
    const [hours, minutes] = item.time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes >= minTime && totalMinutes <= maxTime;
  }).sort((a, b) => {
    const [aHours, aMinutes] = a.time.split(':').map(Number);
    const [bHours, bMinutes] = b.time.split(':').map(Number);
    return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
  });
});

const chartData = computed(() => {
  const filteredData = filterDataForDisplay.value;
  
  if (filteredData.length === 0) {
    return {
      labels: ['無數據'],
      datasets: [{
        label: '銷售量',
        data: [0],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    };
  }

  return {
    labels: filteredData.map(item => item.time),
    datasets: [{
      label: '銷量',
      data: filteredData.map(item => item.count),
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      pointBackgroundColor: 'rgba(54, 162, 235, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 3,
      tension: 0.4,
      fill: true
    }]
  };
});

const chartOptions = computed(() => {
  const maxValue = props.hourlyData.length > 0 
    ? Math.max(...props.hourlyData.map(item => item.count)) 
    : 0;
  const suggestedMax = Math.ceil(maxValue * 1.2); // 增加20%空間
  
  // 找出高峰時段
  let peakTime = '';
  let peakValue = 0;
  if (props.hourlyData.length > 0) {
    const peak = props.hourlyData.reduce((max, item) => 
      item.count > max.count ? item : max, 
      { count: 0, time: '' }
    );
    
    if (peak.count > 0) {
      peakTime = peak.time;
      peakValue = peak.count;
    }
  }
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: peakTime ? [`營業繁忙時段分析`, `尖峰時段: ${peakTime} (${peakValue} 份)`] : '營業繁忙時段分析',
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
        usePointStyle: true,
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
          title: context => `時間: ${context[0].label}`,
          label: context => `銷量: ${context.raw} 份`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: suggestedMax,
        title: { 
          display: true, 
          text: '銷售量',
          font: {
            size: 14
          },
          padding: {
            bottom: 10
          }
        },
        ticks: {
          precision: 0,
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        title: { 
          display: true, 
          text: '時間',
          font: {
            size: 14
          },
          padding: {
            top: 10
          }
        },
        ticks: {
          font: {
            size: 12
          },
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    elements: {
      line: {
        cubicInterpolationMode: 'monotone'
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuad'
    }
  };
});
</script>