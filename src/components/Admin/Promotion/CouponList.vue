<template>
  <div>
    <!-- 標題和添加按鈕 -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>優惠券管理</h2>
      <button class="btn btn-primary" @click="openAddModal">
        <i class="bi bi-plus-circle me-2"></i>新增優惠券
      </button>
    </div>

    <!-- 加載提示 -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="mt-2">正在加載優惠券資料...</p>
    </div>

    <!-- 錯誤提示 -->
    <div v-else-if="error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ error }}
    </div>

    <!-- 無數據提示 -->
    <div v-else-if="coupons.length === 0" class="text-center my-5">
      <i class="bi bi-file-earmark-x fs-1 text-muted"></i>
      <p class="mt-2 text-muted">尚未設定任何優惠券</p>
    </div>

    <!-- 優惠券列表 -->
    <div v-else class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>名稱</th>
                <th>類型</th>
                <th>優惠內容</th>
                <th>有效期間</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="coupon in coupons" :key="coupon._id">
                <td>{{ coupon.name }}</td>
                <td>
                  <span :class="[
                    'badge',
                    coupon.type === 'discount' ? 'bg-info' : 'bg-warning',
                  ]">
                    {{ coupon.type === 'discount' ? '折扣金額' : '商品兌換' }}
                  </span>
                </td>
                <td>
                  <div v-if="coupon.type === 'discount'">
                    折抵 ${{ coupon.discount }}
                  </div>
                  <div v-else-if="coupon.items && coupon.items.length > 0">
                    兌換商品: {{ formatExchangeItems(coupon.items) }}
                  </div>
                </td>
                <td>
                  <div v-if="coupon.startAt || coupon.expireAt">
                    {{ formatDateRange(coupon.startAt, coupon.expireAt) }}
                  </div>
                  <div v-else>無限期</div>
                </td>
                <td>
                  <span :class="[
                    'badge',
                    isActive(coupon) ? 'bg-success' : 'bg-secondary'
                  ]">
                    {{ isActive(coupon) ? '啟用中' : '未啟用' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button
                      v-if="!isActive(coupon)"
                      class="btn btn-sm btn-success"
                      @click="toggleCouponStatus(coupon._id, true)"
                      :disabled="isUpdating"
                    >
                      <i class="bi bi-check-circle"></i> 啟用
                    </button>
                    <button
                      v-else
                      class="btn btn-sm btn-secondary"
                      @click="toggleCouponStatus(coupon._id, false)"
                      :disabled="isUpdating"
                    >
                      <i class="bi bi-pause-circle"></i> 停用
                    </button>
                    <button
                      class="btn btn-sm btn-primary"
                      @click="editCoupon(coupon)"
                    >
                      <i class="bi bi-pencil"></i> 編輯
                    </button>
                    <button
                      class="btn btn-sm btn-danger"
                      @click="confirmDelete(coupon)"
                    >
                      <i class="bi bi-trash"></i> 刪除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 添加/編輯優惠券模態框 -->
    <CouponForm
      v-if="showModal"
      :editing-coupon="editingCoupon"
      @close="closeModal"
      @save="refreshData"
    />

    <!-- 確認刪除模態框 -->
    <div class="modal fade" id="confirmDeleteModal" tabindex="-1" ref="confirmDeleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">確認刪除</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>確定要刪除優惠券 "{{ selectedCoupon?.name }}" 嗎？</p>
            <p class="text-danger">此操作無法復原。</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button
              type="button"
              class="btn btn-danger"
              @click="deleteCoupon"
              :disabled="isDeleting"
            >
              <span
                v-if="isDeleting"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              確認刪除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import api from '@/api';
import CouponForm from './CouponForm.vue';

// 狀態
const coupons = ref([]);
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);
const editingCoupon = ref(null);
const selectedCoupon = ref(null);
const isUpdating = ref(false);
const isDeleting = ref(false);

// DOM 引用
const confirmDeleteModal = ref(null);

// 獲取優惠券列表
const fetchCoupons = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await api.coupon.getAll();
    coupons.value = response.data;
  } catch (err) {
    console.error('獲取優惠券失敗:', err);
    error.value = '獲取優惠券資料失敗，請稍後再試';
  } finally {
    loading.value = false;
  }
};

// 格式化兌換商品
const formatExchangeItems = (items) => {
  if (!items || items.length === 0) return '無';
  
  return items.map(item => {
    const amount = item.amount || 1;
    return `${item.name || '未知商品'} x ${amount}`;
  }).join(', ');
};

// 格式化日期範圍
const formatDateRange = (startAt, expireAt) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  if (startAt && expireAt) {
    return `${formatDate(startAt)} ~ ${formatDate(expireAt)}`;
  } else if (startAt) {
    return `${formatDate(startAt)} 起`;
  } else if (expireAt) {
    return `至 ${formatDate(expireAt)}`;
  }
  
  return '無限期';
};

// 檢查優惠券是否啟用
const isActive = (coupon) => {
  if (!coupon.active) return false;
  
  const now = new Date();
  
  if (coupon.startAt && new Date(coupon.startAt) > now) return false;
  if (coupon.expireAt && new Date(coupon.expireAt) < now) return false;
  
  return true;
};

// 切換優惠券狀態
const toggleCouponStatus = async (id, status) => {
  try {
    isUpdating.value = true;
    await api.coupon.update(id, { active: status });
    await fetchCoupons();
  } catch (err) {
    console.error(`${status ? '啟用' : '停用'}優惠券失敗:`, err);
    alert(`${status ? '啟用' : '停用'}優惠券失敗，請稍後再試`);
  } finally {
    isUpdating.value = false;
  }
};

// 打開添加模態框
const openAddModal = () => {
  editingCoupon.value = null;
  showModal.value = true;
};

// 編輯優惠券
const editCoupon = (coupon) => {
  editingCoupon.value = { ...coupon };
  showModal.value = true;
};

// 關閉模態框
const closeModal = () => {
  showModal.value = false;
  editingCoupon.value = null;
};

// 確認刪除
const confirmDelete = (coupon) => {
  selectedCoupon.value = coupon;
  new Modal(confirmDeleteModal.value).show();
};

// 刪除優惠券
const deleteCoupon = async () => {
  if (!selectedCoupon.value) return;

  try {
    isDeleting.value = true;
    await api.coupon.delete(selectedCoupon.value._id);
    Modal.getInstance(confirmDeleteModal.value).hide();
    await fetchCoupons();
  } catch (err) {
    console.error('刪除優惠券失敗:', err);
    alert('刪除優惠券失敗，請稍後再試');
  } finally {
    isDeleting.value = false;
  }
};

// 重新獲取數據
const refreshData = () => {
  fetchCoupons();
};

// 組件掛載時獲取數據
onMounted(() => {
  fetchCoupons();
  confirmDeleteModal.value = document.getElementById('confirmDeleteModal');
});
</script>

<style scoped>
.table th:last-child,
.table td:last-child {
  width: 200px;
}
</style>