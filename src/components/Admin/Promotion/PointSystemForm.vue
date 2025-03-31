<template>
  <div class="modal fade show" tabindex="-1" style="display: block; background-color: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">新增點數系統</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit" novalidate>
            <!-- 名稱 -->
            <div class="mb-3">
              <label for="name" class="form-label">名稱</label>
              <input
                type="text"
                class="form-control"
                id="name"
                v-model="form.name"
                required
                placeholder="例如：標準點數、VIP 點數、特殊活動"
                :class="{ 'is-invalid': nameError }"
                @blur="validateName"
              />
              <div class="invalid-feedback">{{ nameError }}</div>
            </div>

            <!-- 最低消費金額 -->
            <div class="mb-3">
              <label for="minAmount" class="form-label">最低消費金額</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input
                  type="number"
                  class="form-control"
                  id="minAmount"
                  v-model.number="form.minAmount"
                  required
                  min="0"
                  placeholder="100"
                  :class="{ 'is-invalid': minAmountError }"
                  @blur="validateMinAmount"
                />
                <div class="invalid-feedback">{{ minAmountError }}</div>
              </div>
              <div class="form-text">消費金額必須大於或等於此金額才能獲得點數</div>
            </div>

            <!-- 計算公式 -->
            <div class="mb-4">
              <label for="formula" class="form-label">計算公式</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  id="formula"
                  v-model="form.formula"
                  required
                  placeholder="Math.floor(x * 0.01)"
                  :class="{ 'is-invalid': formulaError }"
                  @blur="validateFormula"
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="testFormula"
                >
                  測試
                </button>
                <div class="invalid-feedback">{{ formulaError }}</div>
              </div>
              <div class="form-text">
                請使用 JavaScript 語法，x 為消費金額。例如：<code>Math.floor(x * 0.01)</code> 表示每 100 元 1 點
              </div>
              <div v-if="testResult !== null" class="alert alert-info mt-2">
                測試結果：消費 $1000 可獲得 {{ testResult }} 點
              </div>
            </div>

            <!-- 描述 -->
            <div class="mb-3">
              <label for="description" class="form-label">描述 (選填)</label>
              <textarea
                class="form-control"
                id="description"
                v-model="form.description"
                rows="3"
                placeholder="輸入關於此點數系統的說明"
              ></textarea>
            </div>

            <!-- 啟用設定 -->
            <div class="mb-3 form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="active"
                v-model="form.active"
              />
              <label class="form-check-label" for="active">
                立即啟用此點數系統 (將停用其他點數系統)
              </label>
            </div>

            <!-- 錯誤訊息顯示 -->
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              {{ errorMessage }}
            </div>

            <!-- 表單按鈕 -->
            <div class="d-flex justify-content-end gap-2">
              <button
                type="button"
                class="btn btn-secondary"
                @click="$emit('close')"
              >
                取消
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="isSubmitting"
              >
                <span
                  v-if="isSubmitting"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                儲存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import api from '@/api';

const emit = defineEmits(['close', 'save']);

// 表單數據
const form = reactive({
  name: '',
  minAmount: 100,
  formula: 'Math.floor(x * 0.01)',
  description: '',
  active: false
});

// 錯誤訊息
const nameError = ref('');
const minAmountError = ref('');
const formulaError = ref('');
const errorMessage = ref('');

// 狀態
const isSubmitting = ref(false);
const testResult = ref(null);

// 表單驗證
const validateName = () => {
  if (!form.name.trim()) {
    nameError.value = '請輸入點數系統名稱';
    return false;
  }
  nameError.value = '';
  return true;
};

const validateMinAmount = () => {
  if (form.minAmount === undefined || form.minAmount === null) {
    minAmountError.value = '請輸入最低消費金額';
    return false;
  }
  if (form.minAmount < 0) {
    minAmountError.value = '最低消費金額不能為負數';
    return false;
  }
  minAmountError.value = '';
  return true;
};

const validateFormula = () => {
  if (!form.formula.trim()) {
    formulaError.value = '請輸入計算公式';
    return false;
  }
  
  try {
    // 測試公式是否有效
    api.pointSystem.testFormula(form.formula, 1000);
    formulaError.value = '';
    return true;
  } catch (error) {
    formulaError.value = '公式格式錯誤: ' + error.message;
    return false;
  }
};

const validateForm = () => {
  const isNameValid = validateName();
  const isMinAmountValid = validateMinAmount();
  const isFormulaValid = validateFormula();
  
  return isNameValid && isMinAmountValid && isFormulaValid;
};

// 測試公式
const testFormula = () => {
  errorMessage.value = '';
  testResult.value = null;
  
  if (!form.formula) {
    formulaError.value = '請輸入計算公式';
    return;
  }
  
  try {
    testResult.value = api.pointSystem.testFormula(form.formula, 1000);
    formulaError.value = '';
  } catch (error) {
    formulaError.value = '公式格式錯誤: ' + error.message;
    console.error('公式測試失敗:', error);
  }
};

// 提交表單
const handleSubmit = async () => {
  // 清空錯誤訊息
  errorMessage.value = '';
  
  // 驗證表單
  if (!validateForm()) {
    return;
  }
  
  try {
    isSubmitting.value = true;
    
    // 創建點數系統
    const response = await api.pointSystem.create({
      name: form.name,
      minAmount: form.minAmount,
      formula: form.formula,
      description: form.description || '',
      active: form.active
    });
    
    if (response.data.success) {
      // 通知父組件保存成功
      emit('save');
      
      // 關閉模態框
      emit('close');
    } else {
      errorMessage.value = response.data.message || '新增點數系統失敗';
    }
  } catch (error) {
    console.error('新增點數系統失敗:', error);
    
    if (error.response) {
      // 伺服器回應了錯誤
      errorMessage.value = error.response.data.message || '新增點數系統失敗';
    } else if (error.request) {
      // 請求發送了但沒有收到回應
      errorMessage.value = '無法連線到伺服器，請檢查網路連線';
    } else {
      // 發送請求時發生錯誤
      errorMessage.value = '發生錯誤，請稍後再試';
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>