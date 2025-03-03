<template>
  <div class="container-fluid">
    <div class="row">
      <!-- 左側邊欄（縮小） -->
      <div class="col-md-1 bg-light sidebar py-3">
        <h5 class="text-center">訂單</h5>
        <button class="btn btn-primary w-100">更新</button>
      </div>
      
      <!-- 主內容區域（縮小以容納右側欄） -->
      <div class="col-md-8">
        <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5>訂單管理</h5>
          <span>星期五 02/28 8:21 PM</span>
        </div>
        
        <!-- 訂單表格 -->
        <table class="table table-striped">
          <thead>
            <tr>
              <th>時間</th>
              <th>訂單</th>
              <th>取餐</th>
              <th>金額</th>
              <th>狀態</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>{{ order.time }}</td>
              <td>{{ order.number }}</td>
              <td>{{ order.pickup }}</td>
              <td>{{ order.amount }}</td>
              <td>
                <span v-if="order.status === '已取消'" class="text-danger">{{ order.status }}</span>
                <span v-else class="text-success">{{ order.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 右側欄（新增） -->
      <div class="col-md-3 bg-light sidebar py-3">
        <h5 class="text-center">餐點細節</h5>
        <ul class="list-group">
          <li v-for="item in orderDetails" :key="item.id" class="list-group-item">
            {{ item.name }} - ${{ item.price }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const orders = ref([
  { id: 1, time: '8:13 PM', number: '#45', pickup: '內用', amount: 480, status: '未接單' },
  { id: 2, time: '8:11 PM', number: '#44', pickup: '內用', amount: 450, status: '已取消' },
  { id: 3, time: '8:09 PM', number: '#43', pickup: '內用', amount: 160, status: '完成取餐' },
]);

const orderDetails = ref([
  { id: 1, name: '雞腿飯', price: 120 },
  { id: 2, name: '牛肉麵', price: 150 },
  { id: 3, name: '滷肉飯', price: 80 }
]);
</script>

<style>
.sidebar {
  height: 100vh;
}
</style>
