<template>
  <div class="password-edit-container p-3">
    <!-- 頂部導航 -->
    <div class="top-nav d-flex align-items-center py-3">
      <button class="btn btn-link text-dark p-0" @click="goBack">
        <i class="bi bi-arrow-left fs-4"></i>
      </button>
      <h5 class="mb-0 mx-auto">修改密碼</h5>
    </div>

    <form @submit.prevent="updatePassword" class="mt-4">
      <!-- 目前密碼 -->
      <div class="mb-3">
        <label for="currentPassword" class="form-label">目前密碼</label>
        <div class="input-group">
          <input 
            :type="showCurrentPassword ? 'text' : 'password'" 
            class="form-control"
            id="currentPassword"
            v-model="passwordForm.currentPassword"
            placeholder="請輸入目前的密碼"
            required
          >
          <button 
            class="btn btn-outline-secondary" 
            type="button"
            @click="showCurrentPassword = !showCurrentPassword"
          >
            <i :class="showCurrentPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
      </div>

      <!-- 新密碼 -->
      <div class="mb-3">
        <label for="newPassword" class="form-label">新密碼</label>
        <div class="input-group">
          <input 
            :type="showNewPassword ? 'text' : 'password'" 
            class="form-control"
            id="newPassword"
            v-model="passwordForm.newPassword"
            placeholder="請設定新密碼"
            required
          >
          <button 
            class="btn btn-outline-secondary" 
            type="button"
            @click="showNewPassword = !showNewPassword"
          >
            <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
        <div class="form-text" :class="{'text-danger': !isPasswordValid}">
          請設定 8-32 個字元的密碼
        </div>
      </div>

      <!-- 確認新密碼 -->
      <div class="mb-4">
        <label for="confirmNewPassword" class="form-label">確認新密碼</label>
        <div class="input-group">
          <input 
            :type="showNewPassword ? 'text' : 'password'" 
            class="form-control"
            id="confirmNewPassword"
            v-model="passwordForm.confirmNewPassword"
            placeholder="請再次輸入新密碼"
            required
          >
          <button 
            class="btn btn-outline-secondary" 
            type="button"
            @click="showNewPassword = !showNewPassword"
          >
            <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
        <div v-if="passwordMismatch" class="text-danger mt-1">
          兩次輸入的密碼不一致
        </div>
      </div>

      <!-- 修改按鈕 -->
      <div class="d-grid mb-4">
        <button 
          type="submit" 
          class="btn btn-primary btn-lg"
          :disabled="isSubmitting || passwordMismatch || !isFormValid"
        >
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
          修改密碼
        </button>
      </div>
    </form>
  </div>

  <!-- 修改成功的 Modal -->
  <div class="modal fade" id="updateSuccessModal" tabindex="-1" ref="updateSuccessModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">密碼已修改</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>您的密碼已成功修改。</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">確定</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 修改失敗的 Modal -->
  <div class="modal fade" id="updateFailModal" tabindex="-1" ref="updateFailModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">密碼修改失敗</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>{{ errorMessage || '目前密碼不正確，請重新輸入。' }}</p>
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
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const updateSuccessModal = ref(null);
const updateFailModal = ref(null);
const errorMessage = ref('');

// 密碼表單
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
});

// 檢查密碼是否有效
const isPasswordValid = computed(() => {
  if (!passwordForm.value.newPassword) return true; // 未輸入時不顯示錯誤
  return passwordForm.value.newPassword.length >= 8 && passwordForm.value.newPassword.length <= 32;
});

// 檢查密碼是否一致
const passwordMismatch = computed(() => {
  if (!passwordForm.value.newPassword || !passwordForm.value.confirmNewPassword) {
    return false;
  }
  return passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword;
});

// 檢查表單是否有效
const isFormValid = computed(() => {
  return (
    passwordForm.value.currentPassword &&
    isPasswordValid.value &&
    passwordForm.value.newPassword === passwordForm.value.confirmNewPassword
  );
});

// 返回上一頁
const goBack = () => {
  router.push('/customer/my-account');
};

// 更新密碼
const updatePassword = async () => {
  if (!isFormValid.value) return;
  
  try {
    isSubmitting.value = true;
    errorMessage.value = '';
    
    try {
      // 呼叫 API 更新密碼
      const response = await api.customer.changePassword(
        passwordForm.value.currentPassword,
        passwordForm.value.newPassword
      );
      
      if (response.data.success) {
        // 更新成功
        showUpdateSuccessModal();
        
        // 清空表單
        passwordForm.value = {
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        };
      } else {
        // API 返回成功但處理失敗
        errorMessage.value = response.data.message || '目前密碼不正確，請重新輸入。';
        showUpdateFailModal();
      }
    } catch (error) {
      console.error('更新密碼失敗:', error);
      if (error.response) {
        errorMessage.value = error.response.data.message || '更新密碼失敗，請稍後再試。';
      } else if (error.request) {
        errorMessage.value = '無法連線到伺服器，請檢查您的網路連接。';
      } else {
        errorMessage.value = '更新密碼失敗，請稍後再試。';
      }
      showUpdateFailModal();
    }
  } finally {
    isSubmitting.value = false;
  }
};

// 顯示更新成功的 Modal
const showUpdateSuccessModal = () => {
  if (updateSuccessModal.value) {
    const modal = new Modal(updateSuccessModal.value);
    modal.show();
  }
};

// 顯示更新失敗的 Modal
const showUpdateFailModal = () => {
  if (updateFailModal.value) {
    const modal = new Modal(updateFailModal.value);
    modal.show();
  }
};

onMounted(() => {
  updateSuccessModal.value = document.getElementById('updateSuccessModal');
  updateFailModal.value = document.getElementById('updateFailModal');
});
</script>

<style scoped>
.password-edit-container {
  padding-bottom: 2rem;
}

.top-nav {
  position: relative;
}
</style>