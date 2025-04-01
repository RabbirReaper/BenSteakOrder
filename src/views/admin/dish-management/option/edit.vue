<template>
  <div>
    <!-- 載入中提示 -->
    <div v-if="loading" class="d-flex justify-content-center align-items-center p-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <span class="ms-3">載入中...</span>
    </div>
    
    <!-- 錯誤提示 -->
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <template v-else-if="category">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>{{ category.name }} 選項管理</h2>
          <p class="text-muted">選項類型: {{ category.inputType === 'single' ? '單選' : '多選' }}</p>
        </div>
        <button @click="goBack" class="btn btn-secondary">返回類別列表</button>
      </div>
      
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>選項列表</span>
          <button class="btn btn-primary" @click="showAddModal">新增選項</button>
        </div>
        <div class="card-body">
          <div v-if="options.length === 0" class="text-center py-4 text-muted">
            <p>目前沒有選項</p>
            <button class="btn btn-primary" @click="showAddModal">
              新增第一個選項
            </button>
          </div>
          
          <div v-else class="list-group">
            <div v-for="(option, index) in options" :key="option._id" class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <div class="fw-bold">{{ option.name }}</div>
                <div v-if="option.price > 0" class="text-muted small">
                  價格: ${{ option.price }}
                </div>
              </div>
              <div class="btn-group">
                <button 
                  class="btn btn-sm btn-outline-secondary" 
                  @click="moveOption(index, -1)"
                  :disabled="index === 0"
                >
                  ↑
                </button>
                <button 
                  class="btn btn-sm btn-outline-secondary" 
                  @click="moveOption(index, 1)"
                  :disabled="index === options.length - 1"
                >
                  ↓
                </button>
                <button class="btn btn-sm btn-outline-primary" @click="showEditModal(option)">
                  編輯
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(option)">
                  刪除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 新增/編輯選項 Modal -->
      <div class="modal fade" id="optionModal" tabindex="-1" ref="optionModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEditMode ? '編輯選項' : '新增選項' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveOption">
                <!-- 名稱 -->
                <div class="mb-3">
                  <label for="name" class="form-label">選項名稱 <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="name" 
                    v-model="formData.name" 
                    required
                    :class="{ 'is-invalid': validationErrors.name }"
                  >
                  <div class="invalid-feedback">{{ validationErrors.name }}</div>
                </div>
                
                <!-- 價格 -->
                <div class="mb-3">
                  <label for="price" class="form-label">額外價格</label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input 
                      type="number" 
                      class="form-control" 
                      id="price" 
                      v-model.number="formData.price" 
                      min="0"
                      :class="{ 'is-invalid': validationErrors.price }"
                    >
                    <div class="invalid-feedback">{{ validationErrors.price }}</div>
                  </div>
                  <div class="form-text text-muted">若為 0 則表示不需額外付費</div>
                </div>
                
                <div class="d-flex justify-content-end">
                  <button 
                    type="button" 
                    class="btn btn-secondary me-2" 
                    data-bs-dismiss="modal"
                  >
                    取消
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary" 
                    :disabled="isSubmitting"
                  >
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {{ isEditMode ? '儲存修改' : '新增' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';
import { Modal } from 'bootstrap';

const route = useRoute();
const router = useRouter();
const categoryId = route.params.id;

const loading = ref(true);
const error = ref(null);
const category = ref(null);
const options = ref([]);
const isSubmitting = ref(false);
const isEditMode = ref(false);
const optionModal = ref(null);
const modalInstance = ref(null);

// 表單資料
const formData = ref({
  _id: null,
  name: '',
  price: 0,
  category: categoryId
});

// 表單驗證錯誤
const validationErrors = ref({});

// 獲取類別資料
const fetchCategory = async () => {
  try {
    const response = await api.optionCategory.getById(categoryId);
    
    if (response.data.success) {
      category.value = response.data.category;
    } else {
      error.value = response.data.message || '獲取選項類別資料失敗';
    }
  } catch (err) {
    console.error('Error fetching category:', err);
    
    if (err.response) {
      error.value = err.response.data.message || '伺服器回應錯誤';
    } else if (err.request) {
      error.value = '無法連線到伺服器';
    } else {
      error.value = '發生錯誤，請稍後再試';
    }
  }
};

// 獲取選項
const fetchOptions = async () => {
  try {
    const response = await api.option.getAll(categoryId);
    
    if (response.data.success) {
      options.value = response.data.options || [];
      // 根據 order 排序
      options.value.sort((a, b) => a.order - b.order);
    } else {
      error.value = response.data.message || '獲取選項資料失敗';
    }
  } catch (err) {
    console.error('Error fetching options:', err);
    
    if (err.response) {
      error.value = err.response.data.message || '伺服器回應錯誤';
    } else if (err.request) {
      error.value = '無法連線到伺服器';
    } else {
      error.value = '發生錯誤，請稍後再試';
    }
  } finally {
    loading.value = false;
  }
};

// 顯示新增 Modal
const showAddModal = () => {
  isEditMode.value = false;
  formData.value = {
    _id: null,
    name: '',
    price: 0,
    category: categoryId
  };
  validationErrors.value = {};
  
  if (modalInstance.value) {
    modalInstance.value.show();
  }
};

// 顯示編輯 Modal
const showEditModal = (option) => {
  isEditMode.value = true;
  formData.value = {
    _id: option._id,
    name: option.name,
    price: option.price,
    category: option.category
  };
  validationErrors.value = {};
  
  if (modalInstance.value) {
    modalInstance.value.show();
  }
};

// 驗證表單
const validateForm = () => {
  const errors = {};
  
  if (!formData.value.name.trim()) {
    errors.name = '請輸入選項名稱';
  }
  
  if (formData.value.price < 0) {
    errors.price = '價格不能為負數';
  }
  
  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// 儲存選項
const saveOption = async () => {
  if (!validateForm()) {
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    const data = {
      name: formData.value.name,
      price: formData.value.price,
      category: formData.value.category,
      order: isEditMode.value ? 
        options.value.find(o => o._id === formData.value._id)?.order || 0 : 
        options.value.length
    };
    
    let response;
    
    if (isEditMode.value) {
      response = await api.option.update(formData.value._id, data);
    } else {
      response = await api.option.create(data);
    }
    
    if (response.data.success) {
      // 關閉 Modal
      modalInstance.value.hide();
      
      // 重新載入選項列表
      fetchOptions();
      
      alert(isEditMode.value ? '選項更新成功！' : '選項新增成功！');
    } else {
      error.value = response.data.message || '儲存失敗，請稍後再試';
    }
  } catch (err) {
    console.error('Error saving option:', err);
    
    if (err.response) {
      error.value = err.response.data.message || '伺服器回應錯誤';
    } else if (err.request) {
      error.value = '無法連線到伺服器';
    } else {
      error.value = '發生錯誤，請稍後再試';
    }
  } finally {
    isSubmitting.value = false;
  }
};

// 移動選項順序
const moveOption = (index, direction) => {
  const newIndex = index + direction;
  if (newIndex >= 0 && newIndex < options.value.length) {
    // 交換位置
    const temp = options.value[index];
    options.value[index] = options.value[newIndex];
    options.value[newIndex] = temp;
    
    // 更新順序值
    options.value[index].order = index;
    options.value[newIndex].order = newIndex;
    
    // 儲存到伺服器
    updateOptionOrder();
  }
};

// 更新選項順序
const updateOptionOrder = async () => {
  try {
    const orderUpdates = options.value.map((option, index) => ({
      id: option._id,
      order: index
    }));
    
    const response = await api.option.updateBatchOrder(orderUpdates);
    
    if (!response.data.success) {
      console.error('Error updating options order:', response.data.message);
      // 重新載入數據，確保 UI 與伺服器數據一致
      fetchOptions();
    }
  } catch (err) {
    console.error('Error updating options order:', err);
    // 發生錯誤時重新載入數據
    fetchOptions();
  }
};

// 確認刪除
const confirmDelete = async (option) => {
  if (!confirm(`確定要刪除選項「${option.name}」嗎？此操作無法復原！`)) {
    return;
  }
  
  try {
    const response = await api.option.delete(option._id);
    
    if (response.data.success) {
      alert('選項刪除成功！');
      fetchOptions();
    } else {
      error.value = response.data.message || '刪除失敗，請稍後再試';
    }
  } catch (err) {
    console.error('Error deleting option:', err);
    
    if (err.response) {
      error.value = err.response.data.message || '伺服器回應錯誤';
    } else if (err.request) {
      error.value = '無法連線到伺服器';
    } else {
      error.value = '發生錯誤，請稍後再試';
    }
  }
};

// 返回選項類別列表
const goBack = () => {
  router.push({ name: 'admin-option-category' });
};

// 初始化
onMounted(async () => {
  // 初始化 Modal
  if (optionModal.value) {
    modalInstance.value = new Modal(optionModal.value);
  }
  
  // 獲取資料
  await fetchCategory();
  await fetchOptions();
});

// 組件卸載前清理
onBeforeUnmount(() => {
  // 處理可能的 Modal 遺留
  if (modalInstance.value) {
    modalInstance.value.hide();
  }
  
  // 移除 Modal backdrop
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.remove();
  }
  
  // 移除 body 相關樣式
  document.body.classList.remove('modal-open');
  document.body.style.paddingRight = '';
});
</script>