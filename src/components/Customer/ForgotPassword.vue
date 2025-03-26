<template>
  <div class="forgot-password-container p-4">
    <div class="d-flex align-items-center mb-4">
      <button class="btn btn-link text-dark p-0 me-3" @click="goBack">
        <i class="bi bi-arrow-left fs-4"></i>
      </button>
      <h2 class="mb-0">忘記密碼</h2>
    </div>
    
    <!-- 驗證碼輸入階段 -->
    <div v-if="resetStep === 'verification'">
      <p class="mb-3">
        簡訊驗證碼已發送至 {{ formattedPhone }}，請於 5 分鐘內完成驗證。
      </p>
      
      <!-- 發送驗證碼按鈕 -->
      <div v-if="!verificationSent" class="d-grid mb-4">
        <button 
          class="btn btn-primary btn-lg" 
          @click="sendVerificationCode"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          發送驗證碼
        </button>
      </div>
      
      <!-- 驗證碼輸入 -->
      <div v-else>
        <div class="mb-4">
          <label class="form-label">驗證碼</label>
          <div class="verification-code-input d-flex justify-content-between">
            <input 
              v-for="(digit, index) in verificationCodeDigits" 
              :key="index"
              type="text"
              class="form-control text-center"
              maxlength="1"
              v-model="verificationCodeDigits[index]"
              @keyup="handleVerificationCodeInput(index, $event)"
              @paste="handlePaste"
              ref="codeInputs"
            >
          </div>
        </div>
        
        <div class="mb-4">
          <div class="d-grid">
            <button 
              class="btn btn-primary btn-lg" 
              @click="verifyCode"
              :disabled="isVerifyingCode || !isVerificationCodeComplete"
            >
              <span v-if="isVerifyingCode" class="spinner-border spinner-border-sm me-2" role="status"></span>
              確認送出
            </button>
          </div>
        </div>
        
        <div class="text-center">
          <button 
            class="btn btn-link" 
            @click="resendVerificationCode"
            :disabled="resendCountdown > 0"
          >
            {{ resendCountdown > 0 ? `重新傳送驗證碼 (${resendCountdown}s)` : '重新傳送驗證碼' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 重設密碼階段 -->
    <div v-if="resetStep === 'reset'">
      <form @submit.prevent="submitPasswordReset">
        <!-- 新密碼 -->
        <div class="mb-3">
          <label for="newPassword" class="form-label">新密碼</label>
          <div class="input-group">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              class="form-control"
              id="newPassword"
              v-model="resetForm.newPassword"
              placeholder="請設定新密碼"
              required
            >
            <button 
              class="btn btn-outline-secondary" 
              type="button"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
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
              :type="showPassword ? 'text' : 'password'" 
              class="form-control"
              id="confirmNewPassword"
              v-model="resetForm.confirmNewPassword"
              placeholder="請再次輸入新密碼"
              required
            >
            <button 
              class="btn btn-outline-secondary" 
              type="button"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <div v-if="passwordMismatch" class="text-danger mt-1">
            兩次輸入的密碼不一致
          </div>
        </div>
        
        <!-- 提交按鈕 -->
        <div class="d-grid">
          <button 
            type="submit" 
            class="btn btn-primary btn-lg"
            :disabled="isSubmitting || passwordMismatch || !isFormValid"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
            重設密碼
          </button>
        </div>
      </form>
    </div>
  </div>
  
  <!-- 重設密碼成功的 Modal -->
  <div class="modal fade" id="resetSuccessModal" tabindex="-1" ref="resetSuccessModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">密碼重設成功</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>您的密碼已成功重設。</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="goToLogin">前往登入</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/api';
import { Modal } from 'bootstrap';

const router = useRouter();
const route = useRoute();
const phoneNumber = ref('');
const resetStep = ref('verification'); // 'verification' or 'reset'
const verificationSent = ref(false);
const isLoading = ref(false);
const isVerifyingCode = ref(false);
const isSubmitting = ref(false);
const resendCountdown = ref(0);
const showPassword = ref(false);
const resetSuccessModal = ref(null);
const codeInputs = ref([]);
const errorMessage = ref('');

// 驗證碼
const verificationCodeDigits = ref(['', '', '', '', '', '']);

// 重設密碼表單
const resetForm = ref({
  newPassword: '',
  confirmNewPassword: ''
});

// 格式化電話號碼顯示
const formattedPhone = computed(() => {
  const countryCode = localStorage.getItem('countryCode') || '+886';
  const phone = phoneNumber.value;
  
  if (countryCode === '+886' && phone.startsWith('09')) {
    return `(${countryCode}) ${phone}`;
  }
  
  return `${countryCode} ${phone}`;
});

// 檢查驗證碼是否已填寫完整
const isVerificationCodeComplete = computed(() => {
  return verificationCodeDigits.value.every(digit => digit !== '');
});

// 檢查密碼是否有效
const isPasswordValid = computed(() => {
  if (!resetForm.value.newPassword) return true; // 未輸入時不顯示錯誤
  return resetForm.value.newPassword.length >= 8 && resetForm.value.newPassword.length <= 32;
});

// 檢查密碼是否一致
const passwordMismatch = computed(() => {
  if (!resetForm.value.newPassword || !resetForm.value.confirmNewPassword) {
    return false;
  }
  return resetForm.value.newPassword !== resetForm.value.confirmNewPassword;
});

// 檢查表單是否有效
const isFormValid = computed(() => {
  return (
    isPasswordValid.value &&
    resetForm.value.newPassword === resetForm.value.confirmNewPassword
  );
});
</script>