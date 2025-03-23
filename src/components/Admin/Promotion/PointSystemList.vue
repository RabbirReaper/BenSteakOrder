<template>
  <div>
    <!-- 標題和添加按鈕 -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>點數系統設定</h2>
      <button class="btn btn-primary" @click="openAddModal">
        <i class="bi bi-plus-circle me-2"></i>新增點數系統
      </button>
    </div>

    <!-- 加載提示 -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="mt-2">正在加載點數系統設定...</p>
    </div>

    <!-- 錯誤提示 -->
    <div v-else-if="error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ error }}
    </div>

    <!-- 無數據提示 -->
    <div v-else-if="pointSystems.length === 0" class="text-center my-5">
      <i class="bi bi-file-earmark-x fs-1 text-muted"></i>
      <p class="mt-2 text-muted">尚未設定任何點數系統</p>
    </div>

    <!-- 點數系統列表 -->
    <div v-else class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>名稱</th>
                <th>最低消費</th>
                <th>計算公式</th>
                <th>描述</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="system in pointSystems" :key="system._id">
                <td>{{ system.name }}</td>
                <td>${{ system.minAmount }}</td>
                <td>
                  <code>{{ system.formula }}</code>
                  <button class="btn btn-sm btn-outline-info ms-2" @click="openTestFormula(system)">
                    <i class="bi bi-calculator"></i>
                  </button>
                </td>
                <td>{{ system.description || '無' }}</td>
                <td>
                  <span
                    :class="[
                      'badge',
                      system.active ? 'bg-success' : 'bg-secondary'
                    ]"
                  >
                    {{ system.active ? '啟用中' : '未啟用' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button
                      v-if="!system.active"
                      class="btn btn-sm btn-success"
                      @click="activateSystem(system._id)"
                      :disabled="isActivating"
                    >
                      <i class="bi bi-check-circle"></i> 啟用
                    </button>
                    <button
                      v-else
                      class="btn btn-sm btn-secondary"
                      @click="deactivateSystem(system._id)"
                      :disabled="isActivating"
                    >
                      <i class="bi bi-pause-circle"></i> 停用
                    </button>
                    <button
                      class="btn btn-sm btn-danger"
                      @click="confirmDelete(system)"
                      :disabled="system.active"
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

    <!-- 添加/編輯點數系統模態框 -->
    <PointSystemForm
      v-if="showModal"
      :show="showModal"
      @close="closeModal"
      @save="refreshData"
    />

    <!-- 測試公式模態框 -->
    <div class="modal fade" id="testFormulaModal" tabindex="-1" ref="testFormulaModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">測試點數計算公式</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedSystem">
              <p>
                <strong>公式:</strong> <code>{{ selectedSystem.formula }}</code>
              </p>
              <p>
                <strong>最低消費金額:</strong> ${{ selectedSystem.minAmount }}
              </p>
              <div class="mb-3">
                <label for="testAmount" class="form-label">請輸入消費金額</label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input
                    type="number"
                    class="form-control"
                    id="testAmount"
                    v-model.number="testAmount"
                    min="0"
                  />
                </div>
              </div>
              <div class="alert alert-info">
                <div v-if="testAmount < selectedSystem.minAmount">
                  <i class="bi bi-info-circle-fill me-2"></i>
                  未達最低消費金額，無法獲得點數
                </div>
                <div v-else>
                  <i class="bi bi-award-fill me-2"></i>
                  消費 ${{ testAmount }} 可獲得 <strong>{{ calculatedPoints }}</strong> 點
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 確認刪除模態框 -->
    <div class="modal fade" id="confirmDeleteModal" tabindex="-1" ref="confirmDeleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">確認刪除</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>確定要刪除點數系統 "{{ selectedSystem?.name }}" 嗎？</p>
            <p class="text-danger">此操作無法復原。</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button
              type="button"
              class="btn btn-danger"
              @click="deleteSystem"
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
import { ref, onMounted, computed } from 'vue';
import { Modal } from 'bootstrap';
import api from '@/api';
import PointSystemForm from './PointSystemForm.vue';

// 狀態
const pointSystems = ref([]);
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);
const selectedSystem = ref(null);
const testAmount = ref(1000);
const isActivating = ref(false);
const isDeleting = ref(false);

// DOM 引用
const testFormulaModal = ref(null);
const confirmDeleteModal = ref(null);

// 計算屬性
const calculatedPoints = computed(() => {
  if (!selectedSystem.value || testAmount.value < selectedSystem.value.minAmount) {
    return 0;
  }
  return api.pointSystem.testFormula(selectedSystem.value.formula, testAmount.value);
});

// 獲取點數系統列表
const fetchPointSystems = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await api.pointSystem.getAll();
    pointSystems.value = response.data;
  } catch (err) {
    console.error('獲取點數系統失敗:', err);
    error.value = '獲取點數系統設定失敗，請稍後再試';
  } finally {
    loading.value = false;
  }
};

// 啟用點數系統
const activateSystem = async (id) => {
  try {
    isActivating.value = true;
    await api.pointSystem.updateStatus(id, true);
    await fetchPointSystems();
  } catch (err) {
    console.error('啟用點數系統失敗:', err);
    alert('啟用點數系統失敗，請稍後再試');
  } finally {
    isActivating.value = false;
  }
};

// 停用點數系統
const deactivateSystem = async (id) => {
  try {
    isActivating.value = true;
    await api.pointSystem.updateStatus(id, false);
    await fetchPointSystems();
  } catch (err) {
    console.error('停用點數系統失敗:', err);
    alert('停用點數系統失敗，請稍後再試');
  } finally {
    isActivating.value = false;
  }
};

// 打開添加模態框
const openAddModal = () => {
  showModal.value = true;
};

// 關閉模態框
const closeModal = () => {
  showModal.value = false;
};

// 打開測試公式模態框
const openTestFormula = (system) => {
  selectedSystem.value = system;
  testAmount.value = Math.max(system.minAmount, 1000);
  new Modal(testFormulaModal.value).show();
};

// 確認刪除
const confirmDelete = (system) => {
  if (system.active) {
    alert('無法刪除已啟用的點數系統，請先停用');
    return;
  }
  selectedSystem.value = system;
  new Modal(confirmDeleteModal.value).show();
};

// 刪除點數系統
const deleteSystem = async () => {
  if (!selectedSystem.value) return;

  try {
    isDeleting.value = true;
    await api.pointSystem.delete(selectedSystem.value._id);
    Modal.getInstance(confirmDeleteModal.value).hide();
    await fetchPointSystems();
  } catch (err) {
    console.error('刪除點數系統失敗:', err);
    alert('刪除點數系統失敗，請稍後再試');
  } finally {
    isDeleting.value = false;
  }
};

// 重新獲取數據
const refreshData = () => {
  fetchPointSystems();
};

// 組件掛載時獲取數據
onMounted(() => {
  fetchPointSystems();
  testFormulaModal.value = document.getElementById('testFormulaModal');
  confirmDeleteModal.value = document.getElementById('confirmDeleteModal');
});
</script>

<style scoped>
.table th:last-child,
.table td:last-child {
  width: 180px;
}
</style>