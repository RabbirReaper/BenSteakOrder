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

// 返回上一頁
const goBack = () => {
  router.go(-1);
};

// 處理驗證碼輸入
const handleVerificationCodeInput = (index, event) => {
  // 只允許數字
  if (!/^\d*$/.test(verificationCodeDigits.value[index])) {
    verificationCodeDigits.value[index] = '';
    return;
  }
  
  // 自動跳到下一個輸入框
  if (
    event.key !== 'Backspace' && 
    verificationCodeDigits.value[index] !== '' && 
    index < 5
  ) {
    codeInputs.value[index + 1].focus();
  }
  
  // 退格鍵返回上一個輸入框
  if (event.key === 'Backspace' && index > 0 && verificationCodeDigits.value[index] === '') {
    codeInputs.value[index - 1].focus();
  }
};

// 處理驗證碼粘貼
const handlePaste = (event) => {
  event.preventDefault();
  const pastedData = (event.clipboardData || window.clipboardData).getData('text');
  
  // 只處理數字
  const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6);
  
  if (digits.length > 0) {
    for (let i = 0; i < digits.length && i < 6; i++) {
      verificationCodeDigits.value[i] = digits[i];
    }
    
    // 如果粘貼滿了所有輸入框，自動聚焦最後一個
    if (digits.length >= 6) {
      codeInputs.value[5].focus();
    } else {
      // 否則聚焦下一個空輸入框
      codeInputs.value[digits.length].focus();
    }
  }
};

// 發送驗證碼
const sendVerificationCode = async () => {
  try {
    isLoading.value = true;
    
    // 這裡應該調用實際的 API 來發送驗證碼
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 顯示驗證碼輸入
    verificationSent.value = true;
    
    // 啟動重發倒計時
    startResendCountdown();
    
    // 聚焦第一個驗證碼輸入框
    setTimeout(() => {
      if (codeInputs.value[0]) {
        codeInputs.value[0].focus();
      }
    }, 100);
    
  } catch (error) {
    console.error('發送驗證碼失敗:', error);
    alert('發送驗證碼失敗，請稍後再試。');
  } finally {
    isLoading.value = false;
  }
};

// 重發驗證碼
const resendVerificationCode = async () => {
  if (resendCountdown.value > 0) return;
  
  try {
    isLoading.value = true;
    
    // 這裡應該調用實際的 API 來重發驗證碼
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 重置驗證碼
    verificationCodeDigits.value = ['', '', '', '', '', ''];
    
    // 啟動重發倒計時
    startResendCountdown();
    
    // 聚焦第一個驗證碼輸入框
    setTimeout(() => {
      if (codeInputs.value[0]) {
        codeInputs.value[0].focus();
      }
    }, 100);
    
  } catch (error) {
    console.error('重發驗證碼失敗:', error);
    alert('重發驗證碼失敗，請稍後再試。');
  } finally {
    isLoading.value = false;
  }
};

// 啟動重發倒計時
const startResendCountdown = () => {
  resendCountdown.value = 60;
  const timer = setInterval(() => {
    resendCountdown.value--;
    if (resendCountdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

// 驗證驗證碼
const verifyCode = async () => {
  if (!isVerificationCodeComplete.value) return;
  
  try {
    isVerifyingCode.value = true;
    
    // 獲取完整的驗證碼
    const code = verificationCodeDigits.value.join('');
    
    // 這裡應該調用實際的 API 來驗證驗證碼
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模擬驗證 - 假設任何 6 位數驗證碼都是有效的
    if (code.length === 6) {
      // 驗證成功，進入重設密碼階段
      resetStep.value = 'reset';
    } else {
      // 驗證失敗
      alert('驗證碼不正確，請重新輸入。');
    }
    
  } catch (error) {
    console.error('驗證驗證碼失敗:', error);
    alert('驗證失敗，請稍後再試。');
  } finally {
    isVerifyingCode.value = false;
  }
};

// 提交密碼重設
const submitPasswordReset = async () => {
  if (!isFormValid.value) return;
  
  try {
    isSubmitting.value = true;
    
    // 準備重設密碼數據
    const resetData = {
      phoneNumber: phoneNumber.value,
      newPassword: resetForm.value.newPassword
    };
    
    // 這裡應該調用實際的 API 來提交重設密碼
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 嘗試重設密碼
    try {
      // 假設重設密碼 API
      // const response = await api.auth.resetPassword(resetData);
      
      // 重設成功，顯示成功 Modal
      showResetSuccessModal();
    } catch (error) {
      console.error('重設密碼失敗:', error);
      alert('重設密碼失敗，請稍後再試。');
    }
    
  } catch (error) {
    console.error('提交重設密碼失敗:', error);
    alert('提交失敗，請稍後再試。');
  } finally {
    isSubmitting.value = false;
  }
};

// 顯示重設成功 Modal
const showResetSuccessModal = () => {
  if (resetSuccessModal.value) {
    const modal = new Modal(resetSuccessModal.value);
    modal.show();
  }
};

// 前往登入頁面
const goToLogin = () => {
  // 關閉 Modal
  if (resetSuccessModal.value) {
    const modal = Modal.getInstance(resetSuccessModal.value);
    if (modal) {
      modal.hide();
    }
  }
  
  // 跳轉到登入頁面
  router.push({
    name: 'customer-login-password',
    query: { phone: phoneNumber.value }
  });
};

onMounted(() => {
  // 從 URL 獲取電話號碼
  phoneNumber.value = route.query.phone || localStorage.getItem('phoneNumber') || '';
  
  // 自動觸發發送驗證碼
  sendVerificationCode();
  
  // 初始化 Modal
  resetSuccessModal.value = document.getElementById('resetSuccessModal');
});
</script>

<style scoped>
.forgot-password-container {
  max-width: 500px;
  margin: 0 auto;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.verification-code-input input {
  width: 45px;
  height: 50px;
  font-size: 1.5rem;
  margin: 0 5px;
}

@media (max-width: 400px) {
  .verification-code-input input {
    width: 40px;
    height: 45px;
    font-size: 1.25rem;
    margin: 0 2px;
  }
}
</style>