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
        <button class="btn btn-primary btn-lg" @click="sendVerificationCode" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          發送驗證碼
        </button>
      </div>

      <!-- 驗證碼輸入 -->
      <div v-else>
        <div class="mb-4">
          <label class="form-label">驗證碼</label>
          <div class="verification-code-input d-flex justify-content-between">
            <input v-for="(digit, index) in verificationCodeDigits" :key="index" type="text"
              class="form-control text-center" maxlength="1" v-model="verificationCodeDigits[index]"
              @keyup="handleVerificationCodeInput(index, $event)" @paste="handlePaste" ref="codeInputs">
          </div>
        </div>

        <div class="mb-4">
          <div class="d-grid">
            <button class="btn btn-primary btn-lg" @click="verifyCode"
              :disabled="isVerifyingCode || !isVerificationCodeComplete">
              <span v-if="isVerifyingCode" class="spinner-border spinner-border-sm me-2" role="status"></span>
              確認送出
            </button>
          </div>
        </div>

        <div class="text-center">
          <button class="btn btn-link" @click="resendVerificationCode" :disabled="resendCountdown > 0">
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
            <input :type="showPassword ? 'text' : 'password'" class="form-control" id="newPassword"
              v-model="resetForm.newPassword" placeholder="請設定新密碼" required>
            <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <div class="form-text" :class="{ 'text-danger': !isPasswordValid }">
            請設定 8-32 個字元的密碼
          </div>
        </div>

        <!-- 確認新密碼 -->
        <div class="mb-4">
          <label for="confirmNewPassword" class="form-label">確認新密碼</label>
          <div class="input-group">
            <input :type="showPassword ? 'text' : 'password'" class="form-control" id="confirmNewPassword"
              v-model="resetForm.confirmNewPassword" placeholder="請再次輸入新密碼" required>
            <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <div v-if="passwordMismatch" class="text-danger mt-1">
            兩次輸入的密碼不一致
          </div>
        </div>

        <!-- 提交按鈕 -->
        <div class="d-grid">
          <button type="submit" class="btn btn-primary btn-lg"
            :disabled="isSubmitting || passwordMismatch || !isFormValid">
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
            重設密碼
          </button>
        </div>
      </form>
      <!-- 在重設密碼表單中添加錯誤訊息顯示 -->
      <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
        {{ errorMessage }}
      </div>
    </div>
  </div>

  <!-- 自定義模態框 - 參考 BaseModal.vue 的結構 -->
  <div v-if="showSuccessModal" class="modal-container">
    <!-- 模態框遮罩層 - 點擊時關閉模態框 -->
    <div class="modal-overlay" @click="closeSuccessModal"></div>
    
    <!-- 模態框主體 -->
    <div class="modal-dialog">
      <div class="modal-content">
        <!-- 標題區域 -->
        <div class="modal-header">
          <h5 class="modal-title">密碼重設成功</h5>
          <button type="button" class="btn-close" @click="closeSuccessModal"></button>
        </div>
        
        <!-- 內容區域 -->
        <div class="modal-body">
          <p>您的密碼已成功重設。</p>
        </div>
        
        <!-- 底部按鈕區域 -->
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="goToLogin"
          >
            前往登入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/api';

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
const codeInputs = ref([]);
const errorMessage = ref('');
const showSuccessModal = ref(false); // 控制是否顯示成功提示模態框

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

// 回到上一頁
const goBack = () => {
  router.back();
};

// 從 URL 查詢參數或本地存儲獲取電話號碼
onMounted(() => {
  // 從 URL 查詢參數獲取電話號碼
  if (route.query.phone) {
    phoneNumber.value = route.query.phone;
  }

  // 如果有電話號碼，默認顯示驗證碼發送按鈕
  if (phoneNumber.value) {
    verificationSent.value = false;
  } else {
    // 如果沒有電話號碼，返回登入頁面
    router.push('/customer/login');
  }
});

// 發送驗證碼
const sendVerificationCode = async () => {
  if (!phoneNumber.value) {
    errorMessage.value = '請輸入電話號碼';
    return;
  }

  isLoading.value = true;

  try {
    // 模擬 API 請求 - 在實際應用中應使用真實 API
    // const response = await api.customer.sendVerificationCode(phoneNumber.value);
    // 假設驗證碼發送成功
    verificationSent.value = true;

    // 開始倒數計時（限制重新發送的時間）
    resendCountdown.value = 60;
    const countdownInterval = setInterval(() => {
      resendCountdown.value--;
      if (resendCountdown.value <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
  } catch (error) {
    console.error('發送驗證碼失敗:', error);
    errorMessage.value = '發送驗證碼失敗，請稍後再試';
  } finally {
    isLoading.value = false;
  }
};

// 重新發送驗證碼
const resendVerificationCode = () => {
  if (resendCountdown.value > 0) return;

  // 清空驗證碼輸入
  verificationCodeDigits.value = ['', '', '', '', '', ''];

  // 再次發送驗證碼
  sendVerificationCode();
};

// 處理驗證碼輸入
const handleVerificationCodeInput = (index, event) => {
  // 只允許數字
  const digit = event.target.value.replace(/\D/g, '');
  verificationCodeDigits.value[index] = digit;

  // 如果有輸入數字且不是最後一個框，自動跳到下一個框
  if (digit && index < 5) {
    codeInputs.value[index + 1].focus();
  }

  // 如果按下退格鍵且當前框為空，跳到上一個框
  if (event.key === 'Backspace' && !digit && index > 0) {
    codeInputs.value[index - 1].focus();
  }
};

// 處理驗證碼粘貼
const handlePaste = (event) => {
  event.preventDefault();
  const pastedData = event.clipboardData.getData('text').replace(/\D/g, '');

  // 逐個填入粘貼的數字
  for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
    verificationCodeDigits.value[i] = pastedData[i];
  }

  // 如果有足夠的數字，將焦點放在最後一個填入的框
  if (pastedData.length > 0 && pastedData.length <= 6) {
    codeInputs.value[Math.min(pastedData.length - 1, 5)].focus();
  }
};

// 驗證驗證碼
const verifyCode = async () => {
  if (!isVerificationCodeComplete.value) {
    return;
  }

  isVerifyingCode.value = true;

  try {
    const verificationCode = verificationCodeDigits.value.join('');
    // 模擬 API 請求 - 在實際應用中應使用真實 API
    // const response = await api.customer.verifyCode(phoneNumber.value, verificationCode);
    // 假設驗證成功
    resetStep.value = 'reset';
  } catch (error) {
    console.error('驗證碼驗證失敗:', error);
    errorMessage.value = '驗證碼錯誤或已過期，請重新獲取';
  } finally {
    isVerifyingCode.value = false;
  }
};

// 提交密碼重設
const submitPasswordReset = async () => {
  if (!isFormValid.value) {
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = ''; // 清空之前的錯誤訊息
  
  try {
    // 實際調用 API 重設密碼
    const response = await api.customer.resetPassword(phoneNumber.value, resetForm.value.newPassword);

    // 檢查 API 回應
    if (response.data.success) {
      // 顯示成功模態框
      showSuccessModal.value = true;
    } else {
      // API 回應成功但操作失敗
      errorMessage.value = response.data.message || '密碼重設失敗，請稍後再試';
    }
  } catch (error) {
    console.error('密碼重設失敗:', error);

    // 參照 loginView.vue 的錯誤處理方式
    if (error.response) {
      // 伺服器有回應但狀態碼不是 2xx
      errorMessage.value = error.response.data.message || '密碼重設失敗，請稍後再試';
    } else if (error.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      errorMessage.value = '無法連線到伺服器';
    } else {
      // 其他錯誤（例如程式錯誤）
      errorMessage.value = '發生錯誤，請稍後再試';
    }
  } finally {
    isSubmitting.value = false;
  }
};

// 關閉成功模態框
const closeSuccessModal = () => {
  showSuccessModal.value = false;
};

// 跳轉到登入頁面
const goToLogin = () => {
  showSuccessModal.value = false; // 關閉模態框
  router.push({
    name: 'customer-login-password',
    query: { phone: phoneNumber.value }
  });
};
</script>

<style scoped>
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}
.modal-dialog {
  position: relative;
  width: 500px;
  max-width: 90%;
  z-index: 2;
  margin: 0 auto;
}
.modal-content {
  background-color: #fff;
  border-radius: 0.3rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}
.modal-title {
  margin: 0;
}
.modal-body {
  padding: 1rem;
  overflow-y: auto;
}
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  gap: 0.5rem;
}
</style>