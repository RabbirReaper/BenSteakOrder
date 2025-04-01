<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>選項類別管理</h2>
      <button class="btn btn-primary" @click="showAddModal">
        新增選項類別
      </button>
    </div>

    <!-- 載入中提示 -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="mt-2">載入中...</p>
    </div>

    <!-- 錯誤訊息 -->
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
      <button @click="fetchCategories" class="btn btn-sm btn-outline-danger ms-2">重試</button>
    </div>

    <!-- 選項類別列表 -->
    <div v-else class="card">
      <div class="card-body">
        <div v-if="categories.length === 0" class="text-center py-4 text-muted">
          <p>目前沒有選項類別</p>
          <button class="btn btn-primary" @click="showAddModal">
            新增第一個選項類別
          </button>
        </div>
        
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>名稱</th>
                <th>輸入類型</th>
                <th>選項數量</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in categories" :key="category._id" class="clickable-row" @click="goToOption(category._id)">
                <td>{{ category.name }}</td>
                <td>{{ category.inputType === 'single' ? '單選' : '多選' }}</td>
                <td>{{ getOptionCount(category._id) }}</td>
                <td>
                  <div class="btn-group" @click.stop>
                    <button class="btn btn-sm btn-outline-primary" @click="showEditModal(category)">
                      編輯
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(category)" :disabled="getOptionCount(category._id) > 0">
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- 新增/編輯選項類別 Modal -->
    <div class="modal fade" id="categoryModal" tabindex="-1" ref="categoryModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditMode ? '編輯選項類別' : '新增選項類別' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCategory">
              <!-- 名稱 -->
              <div class="mb-3">
                <label for="name" class="form-label">類別名稱 <span class="text-danger">*</span></label>
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
              
              <!-- 輸入類型 -->
              <div class="mb-3">
                <label class="form-label">輸入類型 <span class="text-danger">*</span></label>
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="radio" 
                    id="inputTypeSingle" 
                    value="single" 
                    v-model="formData.inputType"
                  >
                  <label class="form-check-label" for="inputTypeSingle">
                    單選
                  </label>
                </div>
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="radio" 
                    id="inputTypeMultiple" 
                    value="multiple" 
                    v-model="formData.inputType"
                  >
                  <label class="form-check-label" for="inputTypeMultiple">
                    多選
                  </label>
                </div>
                <div class="invalid-feedback d-block" v-if="validationErrors.inputType">
                  {{ validationErrors.inputType }}
                </div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
import { Modal } from 'bootstrap';

const router = useRouter();
const categories = ref([]);
const options = ref([]);
const loading = ref(true);
const error = ref(null);
const isSubmitting = ref(false);
const isEditMode = ref(false);
const categoryModal = ref(null);
const modalInstance = ref(null);

// 表單資料
const formData = ref({
  _id: null,
  name: '',
  inputType: 'single'
});

// 表單驗證錯誤
const validationErrors = ref({});

// 獲取所有選項類別
const fetchCategories = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await api.optionCategory.getAll();
    
    if (response.data.success) {
      categories.value = response.data.categories || [];
    } else {
      error.value = response.data.message || '獲取選項類別列表失敗';
    }
  } catch (err) {
    console.error('Error fetching option categories:', err);
    
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

// 獲取所有選項
const fetchOptions = async () => {
  try {
    const response = await api.option.getAll();
    
    if (response.data.success) {
      options.value = response.data.options || [];
    }
  } catch (err) {
    console.error('Error fetching options:', err);
  }
};

// 獲取特定類別的選項數量
const getOptionCount = (categoryId) => {
  return options.value.filter(option => option.category === categoryId).length;
};

// 顯示新增 Modal
const showAddModal = () => {
  isEditMode.value = false;
  formData.value = {
    _id: null,
    name: '',
    inputType: 'single'
  };
  validationErrors.value = {};
  
  if (modalInstance.value) {
    modalInstance.value.show();
  }
};

// 顯示編輯 Modal
const showEditModal = (category) => {
  isEditMode.value = true;
  formData.value = {
    _id: category._id,
    name: category.name,
    inputType: category.inputType
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
    errors.name = '請輸入類別名稱';
  }
  
  if (!formData.value.inputType) {
    errors.inputType = '請選擇輸入類型';
  }
  
  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// 儲存選項類別
const saveCategory = async () => {
  if (!validateForm()) {
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    const data = {
      name: formData.value.name,
      inputType: formData.value.inputType
    };
    
    let response;
    
    if (isEditMode.value) {
      response = await api.optionCategory.update(formData.value._id, data);
    } else {
      response = await api.optionCategory.create(data);
    }
    
    if (response.data.success) {
      // 關閉 Modal
      modalInstance.value.hide();
      
      // 重新載入類別列表
      fetchCategories();
      
      alert(isEditMode.value ? '選項類別更新成功！' : '選項類別新增成功！');
    } else {
      error.value = response.data.message || '儲存失敗，請稍後再試';
    }
  } catch (err) {
    console.error('Error saving option category:', err);
    
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

// 確認刪除
const confirmDelete = async (category) => {
  if (getOptionCount(category._id) > 0) {
    alert('此選項類別有關聯的選項，無法刪除！');
    return;
  }
  
  if (!confirm(`確定要刪除選項類別「${category.name}」嗎？此操作無法復原！`)) {
    return;
  }
  
  try {
    const response = await api.optionCategory.delete(category._id);
    
    if (response.data.success) {
      alert('選項類別刪除成功！');
      fetchCategories();
    } else {
      error.value = response.data.message || '刪除失敗，請稍後再試';
    }
  } catch (err) {
    console.error('Error deleting option category:', err);
    
    if (err.response) {
      error.value = err.response.data.message || '伺服器回應錯誤';
    } else if (err.request) {
      error.value = '無法連線到伺服器';
    } else {
      error.value = '發生錯誤，請稍後再試';
    }
  }
};

// 轉到選項管理頁面
const goToOption = (categoryId) => {
  router.push({ name: 'admin-option-edit', params: { id: categoryId } });
};

// 初始化
onMounted(async () => {
  // 初始化 Modal
  if (categoryModal.value) {
    modalInstance.value = new Modal(categoryModal.value);
  }
  
  // 獲取資料
  await Promise.all([
    fetchCategories(),
    fetchOptions()
  ]);
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