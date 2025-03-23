<template>
  <div class="account-edit-container p-3">
    <!-- 頂部導航 -->
    <div class="top-nav d-flex align-items-center py-3">
      <button class="btn btn-link text-dark p-0" @click="goBack">
        <i class="bi bi-arrow-left fs-4"></i>
      </button>
      <h5 class="mb-0 mx-auto">編輯個人資料</h5>
    </div>

    <form @submit.prevent="saveProfile" class="mt-4">
      <!-- 姓名 -->
      <div class="mb-3">
        <label for="name" class="form-label">姓名</label>
        <input
          type="text"
          class="form-control"
          id="name"
          v-model="profileForm.name"
          required
        >
      </div>

      <!-- 手機號碼 (僅顯示，不可編輯) -->
      <div class="mb-3">
        <label for="phoneNumber" class="form-label">手機號碼</label>
        <input
          type="text"
          class="form-control"
          id="phoneNumber"
          v-model="formattedPhone"
          disabled
        >
        <div class="form-text text-muted">手機號碼無法變更</div>
      </div>

      <!-- 生日 -->
      <div class="mb-3">
        <label for="birthday" class="form-label">生日 (可選)</label>
        <input
          type="date"
          class="form-control"
          id="birthday"
          v-model="profileForm.birthday"
        >
      </div>

      <!-- 性別 -->
      <div class="mb-3">
        <label class="form-label">性別 (可選)</label>
        <div class="d-flex">
          <div class="form-check me-4">
            <input
              class="form-check-input"
              type="radio"
              id="male"
              value="male"
              v-model="profileForm.gender"
            >
            <label class="form-check-label" for="male">男性</label>
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              id="female"
              value="female"
              v-model="profileForm.gender"
            >
            <label class="form-check-label" for="female">女性</label>
          </div>
        </div>
      </div>

      <!-- 地址 -->
      <div class="mb-4">
        <label for="address" class="form-label">地址 (可選)</label>
        <input
          type="text"
          class="form-control"
          id="address"
          v-model="profileForm.address"
          placeholder="填寫您的詳細地址"
        >
      </div>

      <!-- 保存按鈕 -->
      <div class="d-grid mb-4">
        <button
          type="submit"
          class="btn btn-primary btn-lg"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
          儲存變更
        </button>
      </div>
    </form>
  </div>

  <!-- 保存成功的 Modal -->
  <div class="modal fade" id="saveSuccessModal" tabindex="-1" ref="saveSuccessModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">資料已更新</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>您的個人資料已成功更新。</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">確定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
import { Modal } from 'bootstrap';

const router = useRouter();
const isSubmitting = ref(false);
const saveSuccessModal = ref(null);

// 個人資料表單
const profileForm = ref({
  name: '',
  phoneNumber: '',
  birthday: '',
  gender: '',
  address: ''
});

// 格式化電話號碼
const formattedPhone = computed(() => {
  const countryCode = localStorage.getItem('countryCode') || '+886';
  const phone = profileForm.value.phoneNumber;
  
  if (!phone) return '';
  
  if (countryCode === '+886' && phone.startsWith('09')) {
    return `(${countryCode}) ${phone}`;
  }
  
  return `${countryCode} ${phone}`;
});

// 返回上一頁
const goBack = () => {
  router.push('/customer/my-account');
};

// 保存個人資料
const saveProfile = async () => {
  try {
    isSubmitting.value = true;
    
    const response = await api.customer.updateProfile({
      name: profileForm.value.name,
      birthday: profileForm.value.birthday || null,
      gender: profileForm.value.gender || null,
      address: profileForm.value.address || null
    });
    
    if (response.data) {
      // 保存成功，顯示成功提示
      showSaveSuccessModal();
      
      // 更新本地存儲的用戶名
      localStorage.setItem('customerName', profileForm.value.name);
    }
  } catch (error) {
    console.error('保存個人資料失敗:', error);
    alert('保存失敗，請稍後再試。');
  } finally {
    isSubmitting.value = false;
  }
};

// 顯示保存成功的 Modal
const showSaveSuccessModal = () => {
  if (saveSuccessModal.value) {
    const modal = new Modal(saveSuccessModal.value);
    modal.show();
  }
};

// 獲取會員資料
const fetchCustomerData = async () => {
  try {
    // 嘗試使用 API 獲取會員資料
    try {
      const response = await api.customer.getProfile();
      // 如果成功獲取到資料，使用 API 返回的資料
      if (response.data) {
        profileForm.value = {
          name: response.data.name,
          phoneNumber: response.data.phoneNumber,
          birthday: response.data.birthday ? new Date(response.data.birthday).toISOString().split('T')[0] : '',
          gender: response.data.gender || '',
          address: response.data.address || ''
        };
      }
    } catch (apiError) {
      console.warn('API 獲取會員資料失敗，使用本地資料:', apiError);
      // 如果 API 請求失敗，回退使用本地存儲的資料
      profileForm.value = {
        name: localStorage.getItem('customerName'),
        phoneNumber: localStorage.getItem('phoneNumber'),
        birthday: '',
        gender: '',
        address: ''
      };
    }
  } catch (error) {
    console.error('獲取會員資料失敗:', error);
    alert('獲取會員資料失敗，請稍後再試。');
  }
};

onMounted(() => {
  fetchCustomerData();
  saveSuccessModal.value = document.getElementById('saveSuccessModal');
});
</script>

<style scoped>
.account-edit-container {
  padding-bottom: 2rem;
}

.top-nav {
  position: relative;
}
</style>