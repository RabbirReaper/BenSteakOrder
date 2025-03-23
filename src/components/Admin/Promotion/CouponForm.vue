<template>
  <div class="modal fade show" tabindex="-1" style="display: block; background-color: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">新增點數系統</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
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
              />
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
                />
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
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="testFormula"
                >
                  測試
                </button>
              </div>
              <div class="form-text">
                請使用 JavaScript 語法，x 為消費金額。例如：<code>Math.floor(x * 0.01)</code> 表示每 100 元 1 點
              </div>
              <div v-if="testResult !== null" class="alert alert-info mt-2">
                測試結果：消費 $1000 可獲得 {{ testResult }} 點
              </div>
              <div v-if="formulaError" class="alert alert-danger mt-2">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                公式測試失敗：{{ formulaError }}
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
import { ref } from 'vue';
import api from '@/api';

const emit = defineEmits(['close', 'save']);

// 表單數據
const form = ref({
  name: '',
  minAmount: 100,
  formula: 'Math.floor(x * 0.01)',
  description: '',
  active: false
});

// 狀態
const isSubmitting = ref(false);
const testResult = ref(null);
const formulaError = ref(null);

// 測試公式
const testFormula = () => {
  try {
    formulaError.value = null;
    testResult.value = null;
    
    if (!form.value.formula) {
      formulaError.value = '請輸入計算公式';
      return;
    }
    
    testResult.value = api.pointSystem.testFormula(form.value.formula, 1000);
  } catch (error) {
    formulaError.value = error.message;
  }
};

// 提交表單
const handleSubmit = async () => {
  try {
    isSubmitting.value = true;
    
    // 再次測試公式，確保格式正確
    try {
      api.pointSystem.testFormula(form.value.formula, 1000);
    } catch (error) {
      formulaError.value = error.message;
      isSubmitting.value = false;
      return;
    }
    
    // 創建點數系統
    await api.pointSystem.create(form.value);
    
    // 通知父組件保存成功
    emit('save');
    
    // 關閉模態框
    emit('close');
  } catch (error) {
    console.error('新增點數系統失敗:', error);
    alert('新增點數系統失敗，請稍後再試');
  } finally {
    isSubmitting.value = false;
  }
};
</script>