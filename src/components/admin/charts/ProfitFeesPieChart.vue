<template>
  <div>
    <Pie :data="chartData" :options="chartOptions" :height="height" :width="width" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Pie } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const props = defineProps({
  profits: {
    type: Number,
    required: true
  },
  fees: {
    type: Number,
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

// 計算圖表資料
const chartData = computed(() => {
  return {
    labels: ['利潤', '手續費'],
    datasets: [
      {
        data: [props.profits, props.fees],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
});

// 計算圖表選項
const chartOptions = computed(() => {
  const total = props.profits + props.fees;
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
            return `${label}: $${value} (${percentage}%)`;
          }
        },

      },
      legend: {
        position: 'bottom'
      },
      title: {
        display: true,
        text: `總金額: ${total.toLocaleString('en-US')}`,
        font: {
          size: 20,
          weight: 'bold'
        }
      }
    }
  };
});
</script>