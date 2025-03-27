<template>
  <div class="register-container p-4">
    <div class="d-flex align-items-center mb-4">
      <button class="btn btn-link text-dark p-0 me-3" @click="goBack">
        <i class="bi bi-arrow-left fs-4"></i>
      </button>
      <h2 class="mb-0">帳號註冊</h2>
    </div>

    <!-- 驗證碼輸入階段 -->
    <div v-if="registrationStep === 'verification'">
      <p class="mb-3">
        手機號碼 {{ formattedPhone }} 尚未註冊過 犇野牛排 帳號，請點擊「註冊帳號」按鈕，系統將寄送驗證訊息到此手機號碼。
      </p>

      <!-- 註冊帳號按鈕 -->
      <div v-if="!verificationSent" class="d-grid mb-4">
        <button class="btn btn-primary btn-lg" @click="sendVerificationCode" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          註冊帳號
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

    <!-- 個人資料填寫階段 -->
    <div v-if="registrationStep === 'information'">
      <form @submit.prevent="submitRegistration">
        <!-- 姓名 -->
        <div class="mb-3">
          <label for="name" class="form-label">姓名</label>
          <input 
            type="text" 
            class="form-control" 
            id="name" 
            v-model="registrationForm.name" 
            required
            :class="{ 'is-invalid': nameError }"
            @blur="validateName"
          >
          <div class="invalid-feedback">{{ nameError }}</div>
        </div>

        <!-- 生日 -->
        <div class="mb-3">
          <label for="birthday" class="form-label">生日 (可選)</label>
          <input type="date" class="form-control" id="birthday" v-model="registrationForm.birthday">
        </div>

        <!-- 性別 -->
        <div class="mb-3">
          <label class="form-label">性別 (可選)</label>
          <div class="d-flex">
            <div class="form-check me-4">
              <input class="form-check-input" type="radio" id="male" value="male" v-model="registrationForm.gender">
              <label class="form-check-label" for="male">男性</label>
            </div>
            <div class="form-check me-4">
              <input class="form-check-input" type="radio" id="female" value="female" v-model="registrationForm.gender">
              <label class="form-check-label" for="female">女性</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" id="other" value="other" v-model="registrationForm.gender">
              <label class="form-check-label" for="other">其他</label>
            </div>
          </div>
        </div>

        <!-- 地址 -->
        <div class="mb-3">
          <label for="address" class="form-label">地址 (可選)</label>
          <input type="text" class="form-control" id="address" v-model="registrationForm.address">
        </div>

        <!-- 密碼 -->
        <div class="mb-3">
          <label for="password" class="form-label">密碼</label>
          <div class="input-group">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              class="form-control" 
              id="password"
              v-model="registrationForm.password" 
              placeholder="請設定您的密碼" 
              :class="{ 'is-invalid': passwordError }"
              @blur="validatePassword"
            >
            <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
            <div class="invalid-feedback">{{ passwordError }}</div>
          </div>
          <div class="form-text">
            請設定 8-32 個字元的密碼
          </div>
        </div>

        <!-- 確認密碼 -->
        <div class="mb-4">
          <label for="confirmPassword" class="form-label">確認密碼</label>
          <div class="input-group">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              class="form-control" 
              id="confirmPassword"
              v-model="registrationForm.confirmPassword" 
              placeholder="請再次輸入密碼"
              :class="{ 'is-invalid': confirmPasswordError }"
              @blur="validateConfirmPassword"
            >
            <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
            <div class="invalid-feedback">{{ confirmPasswordError }}</div>
          </div>
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="errorMessage" class="alert alert-danger mb-3" role="alert">
          {{ errorMessage }}
        </div>

        <!-- 提交按鈕 -->
        <div class="d-grid">
          <button type="submit" class="btn btn-primary btn-lg"
            :disabled="isSubmitting || !isFormValid">
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
            完成註冊
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- 自定義模態框 - 註冊成功 -->
  <div v-if="showSuccessModal" class="modal-container">
    <!-- 模態框遮罩層 - 點擊時關閉模態框 -->
    <div class="modal-overlay" @click="closeSuccessModal"></div>
    
    <!-- 模態框主體 -->
    <div class="modal-dialog">
      <div class="modal-content">
        <!-- 標題區域 -->
        <div class="modal-header">
          <h5 class="modal-title">註冊成功</h5>
          <button type="button" class="btn-close" @click="closeSuccessModal"></button>
        </div>
        
        <!-- 內容區域 -->
        <div class="modal-body">
          <p>恭喜您！帳號已成功註冊。</p>
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
const registrationStep = ref('verification'); // 'verification' or 'information'
const verificationSent = ref(false);
const isLoading = ref(false);
const isVerifyingCode = ref(false);
const isSubmitting = ref(false);
const resendCountdown = ref(0);
const showPassword = ref(false);
const codeInputs = ref([]);
const errorMessage = ref('');
const showSuccessModal = ref(false);

// 表單錯誤訊息
const nameError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');

// 驗證碼
const verificationCodeDigits = ref(['', '', '', '', '', '']);

// 註冊表單資料
const registrationForm = ref({
  name: '',
  birthday: '',
  gender: '',
  address: '',
  password: '',
  confirmPassword: ''
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

// 驗證姓名
const validateName = () => {
  if (!registrationForm.value.name.trim()) {
    nameError.value = '請輸入姓名';
    return false;
  }
  nameError.value = '';
  return true;
};

// 驗證密碼
const validatePassword = () => {
  if (!registrationForm.value.password) {
    passwordError.value = '請輸入密碼';
    return false;
  }
  if (registrationForm.value.password.length < 8 || registrationForm.value.password.length > 32) {
    passwordError.value = '密碼長度必須為 8-32 個字元';
    return false;
  }
  passwordError.value = '';
  return true;
};

// 驗證確認密碼
const validateConfirmPassword = () => {
  if (!registrationForm.value.confirmPassword) {
    confirmPasswordError.value = '請再次輸入密碼';
    return false;
  }
  if (registrationForm.value.password !== registrationForm.value.confirmPassword) {
    confirmPasswordError.value = '兩次輸入的密碼不一致';
    return false;
  }
  confirmPasswordError.value = '';
  return true;
};

// 檢查驗證碼是否已填寫完整
const isVerificationCodeComplete = computed(() => {
  return verificationCodeDigits.value.every(digit => digit !== '');
});

// 檢查表單是否有效
const isFormValid = computed(() => {
  return (
    validateName() &&
    validatePassword() &&
    validateConfirmPassword()
  );
});

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

// 返回上一頁
const goBack = () => {
  router.back();
};

// 發送驗證碼
const sendVerificationCode = async () => {
  if (!phoneNumber.value) {
    errorMessage.value = '請輸入電話號碼';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // 實際專案中需調用真實 API
    // const response = await api.customer.sendVerificationCode(phoneNumber.value);
    
    // 模擬驗證碼發送成功
    verificationSent.value = true;

    // 開始倒數計時（限制重新發送的時間）
    resendCountdown.value = 60;
    const countdownInterval = setInterval(() => {
      resendCountdown.value--;
      if (resendCountdown.value <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    // 聚焦第一個驗證碼輸入框
    setTimeout(() => {
      if (codeInputs.value[0]) {
        codeInputs.value[0].focus();
      }
    }, 100);
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

// 驗證驗證碼
const verifyCode = async () => {
  if (!isVerificationCodeComplete.value) {
    return;
  }

  isVerifyingCode.value = true;
  errorMessage.value = '';

  try {
    const verificationCode = verificationCodeDigits.value.join('');
    
    // 實際專案中需調用真實 API
    // const response = await api.customer.verifyCode(phoneNumber.value, verificationCode);
    
    // 模擬驗證成功
    registrationStep.value = 'information';
  } catch (error) {
    console.error('驗證碼驗證失敗:', error);
    errorMessage.value = '驗證碼錯誤或已過期，請重新獲取';
  } finally {
    isVerifyingCode.value = false;
  }
};

// 提交註冊
const submitRegistration = async () => {
  if (!isFormValid.value) {
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  
  try {
    // 實際調用 API 註冊帳號
    const response = await api.customer.register(
      registrationForm.value.name,
      phoneNumber.value,
      registrationForm.value.password,
      registrationForm.value.birthday,
      registrationForm.value.gender,
      registrationForm.value.address
    );

    // 檢查 API 回應
    if (response.data.success) {
      // 顯示成功模態框
      showSuccessModal.value = true;
    } else {
      // API 回應成功但操作失敗
      errorMessage.value = response.data.message || '註冊失敗，請稍後再試';
    }
  } catch (error) {
    console.error('註冊失敗:', error);

    // 參照 ForgotPassword.vue 的錯誤處理方式
    if (error.response) {
      // 伺服器有回應但狀態碼不是 2xx
      errorMessage.value = error.response.data.message || '註冊失敗，請稍後再試';
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

// 從 URL 查詢參數獲取電話號碼
onMounted(() => {
  // 從 URL 查詢參數獲取電話號碼
  if (route.query.phone) {
    phoneNumber.value = route.query.phone;
  } else {
    // 如果沒有電話號碼，返回登入頁面
    router.push('/customer/login');
  }
});
</script>

<style scoped>
.verification-code-input input {
  width: 48px;
  height: 48px;
  font-size: 1.5rem;
  font-weight: bold;
}

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