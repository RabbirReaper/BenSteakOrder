<template>
  <div class="main-container">
    <div class="center-container">
      {{ orderItem }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios'


const route = useRoute();
const router = useRouter();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const orderId = route.params.orderId

const orderItem = ref(null)

const getOrder = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/order/${orderId}`)
    orderItem.value = response.data
  } catch (error) {
    console.error('Error fetching order:', error)
  }
}

onMounted(async () => {
  await getOrder();
})

</script>


<style lang="css">
.main-container {
  min-height: 100vh;
  background-color: #eaeae668;
}

.center-container {
  max-width: 768px;
  margin: 0 auto;
  position: relative;
  background-color: #ffffff;
  min-height: 100vh;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
</style>