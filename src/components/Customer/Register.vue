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
        <button 
          class="btn btn-primary btn-lg" 
          @click="sendVerificationCode"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          註冊帳號
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
          >
        </div>
        
        <!-- 生日 -->
        <div class="mb-3">
          <label for="birthday" class="form-label">生日 (可選)</label>
          <input 
            type="date" 
            class="form-control" 
            id="birthday" 
            v-model="registrationForm.birthday"
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
                v-model="registrationForm.gender"
              >
              <label class="form-check-label" for="male">男性</label>
            </div>
            <div class="form-check me-4">
              <input 
                class="form-check-input" 
                type="radio" 
                id="female" 
                value="female" 
                v-model="registrationForm.gender"
              >
              <label class="form-check-label" for="female">女性</label>
            </div>
            <div class="form-check">
              <input 
                class="form-check-input" 
                type="radio" 
                id="else" 
                value="else" 
                v-model="registrationForm.gender"
              >
              <label class="form-check-label" for="else">其他</label>
            </div>
          </div>
        </div>
        
        <!-- 地址 -->
        <div class="mb-3">
          <label for="address" class="form-label">地址 (可選)</label>
          <input 
            type="text" 
            class="form-control" 
            id="address" 
            v-model="registrationForm.address"
          >
        </div>
        
        <!-- 密碼 -->
        <div class="mb-3">
          <label for="password" class="form-label">密碼 (8-32 個字元，英數及常見特殊符號)</label>
          <div class="input-group">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              class="form-control"
              id="password"
              v-model="registrationForm.password"
              placeholder="請設定您的密碼"
            >
            <button 
              class="btn btn-outline-secondary" 
              type="button"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <div class="form-text" :class="{'text-danger': passwordMismatch}">
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
            完成註冊
          </button>
        </div>
      </form>
    </div>
  </div>
  
  <!-- 註冊成功的 Modal -->
  <div class="modal fade" id="registerSuccessModal" tabindex="-1" ref="registerSuccessModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">註冊成功</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>恭喜您！帳號已成功註冊。</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="goToLogin">前往登入</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup> 
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/api';
import { Modal } from 'bootstrap';

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
const registerSuccessModal = ref(null);
const codeInputs = ref([]);

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

// 檢查驗證碼是否已填寫完整
const isVerificationCodeComplete = computed(() => {
  return verificationCodeDigits.value.every(digit => digit !== '');
});

// 檢查密碼是否一致
const passwordMismatch = computed(() => {
  if (!registrationForm.value.password || !registrationForm.value.confirmPassword) {
    return false;
  }
  return registrationForm.value.password !== registrationForm.value.confirmPassword;
});

// 檢查表單是否有效
const isFormValid = computed(() => {
  return (
    registrationForm.value.name.trim() !== '' &&
    registrationForm.value.password.length >= 8 &&
    registrationForm.value.password.length <= 32 &&
    registrationForm.value.password === registrationForm.value.confirmPassword
  );
});

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

// 返回上一頁
const goBack = () => {
  router.go(-1);
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
      // 驗證成功，進入信息填寫階段
      registrationStep.value = 'information';
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

// 提交註冊信息
const submitRegistration = async () => {
  if (!isFormValid.value) return;
  
  try {
    isSubmitting.value = true;
    
    // 準備註冊數據
    const registrationData = {
      phoneNumber: phoneNumber.value,
      name: registrationForm.value.name,
      password: registrationForm.value.password,
      birthday: registrationForm.value.birthday || null,
      gender: registrationForm.value.gender || null,
      address: registrationForm.value.address || null
    };
    
    // 這裡應該調用實際的 API 來提交註冊信息
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 嘗試註冊
    try {
      // 假設註冊 API
      // const response = await api.auth.customerRegister(registrationData);
      
      // 註冊成功，顯示成功 Modal
      showRegisterSuccessModal();
    } catch (error) {
      console.error('註冊失敗:', error);
      alert('註冊失敗，請稍後再試。');
    }
    
  } catch (error) {
    console.error('提交註冊信息失敗:', error);
    alert('提交失敗，請稍後再試。');
  } finally {
    isSubmitting.value = false;
  }
};

// 顯示註冊成功 Modal
const showRegisterSuccessModal = () => {
  if (registerSuccessModal.value) {
    const modal = new Modal(registerSuccessModal.value);
    modal.show();
  }
};

// 前往登入頁面
const goToLogin = () => {
  // 關閉 Modal
  if (registerSuccessModal.value) {
    const modal = Modal.getInstance(registerSuccessModal.value);
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
  
  // 初始化 Modal
  registerSuccessModal.value = document.getElementById('registerSuccessModal');
});
</script>