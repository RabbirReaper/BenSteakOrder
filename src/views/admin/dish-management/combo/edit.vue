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
    
    <!-- 表單 -->
    <template v-else>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ isNew ? '新增套餐' : '編輯套餐' }}</h2>
        <div class="btn-group">
          <button v-if="!isNew" @click="confirmDelete" class="btn btn-danger" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            刪除
          </button>
          <button @click="goBack" class="btn btn-secondary">返回</button>
        </div>
      </div>

      <form @submit.prevent="saveTemplate">
        <div class="row">
          <!-- 左側欄位 -->
          <div class="col-md-6">
            <!-- 基本資料 -->
            <div class="card mb-4">
              <div class="card-header">基本資料</div>
              <div class="card-body">
                <!-- 名稱 -->
                <div class="mb-3">
                  <label for="name" class="form-label">套餐名稱 <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="name" 
                    v-model="form.name" 
                    required
                    :class="{ 'is-invalid': validationErrors.name }"
                  >
                  <div class="invalid-feedback">{{ validationErrors.name }}</div>
                </div>
                
                <!-- 價格 -->
                <div class="mb-3">
                  <label for="basePrice" class="form-label">套餐價格 <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input 
                      type="number" 
                      class="form-control" 
                      id="basePrice" 
                      v-model.number="form.basePrice" 
                      min="0"
                      required
                      :class="{ 'is-invalid': validationErrors.basePrice }"
                    >
                    <div class="invalid-feedback">{{ validationErrors.basePrice }}</div>
                  </div>
                </div>
                
                <!-- 描述 -->
                <div class="mb-3">
                  <label for="description" class="form-label">描述</label>
                  <textarea 
                    class="form-control" 
                    id="description" 
                    v-model="form.description" 
                    rows="3"
                  ></textarea>
                </div>
                
                <!-- 上下架狀態 -->
                <div class="mb-3">
                  <div class="form-check form-switch">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="isAvailable" 
                      v-model="form.isAvailable"
                    >
                    <label class="form-check-label" for="isAvailable">
                      {{ form.isAvailable ? '上架中' : '下架中' }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 庫存設定 -->
            <div class="card mb-4">
              <div class="card-header">庫存設定</div>
              <div class="card-body">
                <div class="mb-3">
                  <label for="actualStock" class="form-label">實際庫存</label>
                  <div class="input-group">
                    <input 
                      type="number" 
                      class="form-control" 
                      id="actualStock" 
                      v-model.number="form.actualStock" 
                      :disabled="form.actualStock === -1"
                    >
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button" 
                      @click="toggleStockLimit('actual')"
                    >
                      {{ form.actualStock === -1 ? '啟用庫存' : '停用庫存' }}
                    </button>
                  </div>
                  <div class="form-text text-muted">設為 -1 表示無庫存限制</div>
                </div>
                
                <div class="mb-3">
                  <label for="displayStock" class="form-label">顯示庫存</label>
                  <div class="input-group">
                    <input 
                      type="number" 
                      class="form-control" 
                      id="displayStock" 
                      v-model.number="form.displayStock" 
                      :disabled="form.displayStock === -1 || form.actualStock === -1"
                    >
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button" 
                      @click="toggleStockLimit('display')"
                      :disabled="form.actualStock === -1"
                    >
                      {{ form.displayStock === -1 ? '啟用顯示' : '停用顯示' }}
                    </button>
                  </div>
                  <div class="form-text text-muted">顯示庫存不得大於實際庫存</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 右側欄位 -->
          <div class="col-md-6">
            <!-- 圖片上傳 -->
            <div class="card mb-4">
              <div class="card-header">套餐圖片</div>
              <div class="card-body">
                <div v-if="form.image && form.image.url" class="mb-3 text-center">
                  <img 
                    :src="form.image.url" 
                    :alt="form.image.alt || '預覽'" 
                    class="img-fluid img-thumbnail"
                    style="max-height: 200px"
                  >
                </div>
                
                <div class="mb-3">
                  <label for="imageUpload" class="form-label">{{ form.image && form.image.url ? '更換圖片' : '上傳圖片' }}</label>
                  <input 
                    type="file" 
                    class="form-control" 
                    id="imageUpload" 
                    @change="handleImageSelect" 
                    accept="image/*"
                    :disabled="isUploading"
                  >
                  <div v-if="isUploading" class="progress mt-2">
                    <div 
                      class="progress-bar progress-bar-striped progress-bar-animated" 
                      role="progressbar" 
                      style="width: 100%"
                    >
                      上傳中...
                    </div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="imageAlt" class="form-label">圖片描述</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="imageAlt" 
                    v-model="form.image.alt"
                  >
                </div>
                
                <button 
                  v-if="form.image && form.image.url" 
                  type="button" 
                  class="btn btn-outline-danger" 
                  @click="removeImage"
                >
                  移除圖片
                </button>
              </div>
            </div>
            
            <!-- 套餐餐點 -->
            <div class="card mb-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span>套餐餐點</span>
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-primary" 
                  @click="addDish"
                >
                  新增餐點
                </button>
              </div>
              <div class="card-body">
                <div v-if="form.dishes.length === 0" class="text-center py-3 text-muted">
                  尚未選擇任何餐點
                </div>
                
                <div v-for="(dish, index) in form.dishes" :key="index" class="mb-3 border p-3 rounded">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="d-flex align-items-center">
                      <select 
                        v-model="dish.dish" 
                        class="form-select me-2"
                        style="min-width: 200px;"
                        :class="{ 'is-invalid': dish.error }"
                      >
                        <option value="" disabled>選擇餐點</option>
                        <option 
                          v-for="template in dishTemplates" 
                          :key="template._id" 
                          :value="template._id"
                        >
                          {{ template.name }} - ${{ template.basePrice }}
                        </option>
                      </select>
                      <div class="invalid-feedback">{{ dish.error }}</div>
                    </div>
                    <div class="btn-group">
                      <button 
                        type="button" 
                        class="btn btn-sm btn-outline-secondary" 
                        @click="moveDish(index, -1)"
                        :disabled="index === 0"
                      >
                        ↑
                      </button>
                      <button 
                        type="button" 
                        class="btn btn-sm btn-outline-secondary" 
                        @click="moveDish(index, 1)"
                        :disabled="index === form.dishes.length - 1"
                      >
                        ↓
                      </button>
                      <button 
                        type="button" 
                        class="btn btn-sm btn-outline-danger" 
                        @click="removeDish(index)"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  <!-- 餐點選項 -->
                  <div v-if="dish.dish" class="mt-2">
                    <h6>餐點選項：</h6>
                    <div v-if="getDishOptions(dish.dish).length === 0" class="text-muted small">
                      此餐點沒有可用選項
                    </div>
                    <div v-else>
                      <div 
                        v-for="option in getDishOptions(dish.dish)" 
                        :key="option._id"
                        class="form-check"
                      >
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          :id="`option-${index}-${option._id}`" 
                          :value="option._id" 
                          v-model="dish.options"
                        >
                        <label class="form-check-label" :for="`option-${index}-${option._id}`">
                          {{ option.name }} {{ option.price > 0 ? `(+$${option.price})` : '' }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 提交按鈕 -->
        <div class="d-flex justify-content-end mt-4">
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="isSubmitting || isUploading"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ isNew ? '新增套餐' : '儲存修改' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id);
const isNew = computed(() => id.value === 'new');

// 狀態
const loading = ref(true);
const error = ref(null);
const isSubmitting = ref(false);
const isUploading = ref(false);
const selectedImage = ref(null);
const dishTemplates = ref([]);

// 表單資料
const form = ref({
  name: '',
  basePrice: 0,
  description: '',
  image: {
    url: '',
    publicId: '',
    alt: ''
  },
  isAvailable: true,
  actualStock: -1,
  displayStock: -1,
  dishes: []
});

// 表單驗證錯誤
const validationErrors = ref({});

// 獲取套餐模板資料
const fetchTemplateData = async () => {
  if (isNew.value) {
    loading.value = false;
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    const response = await api.comboTemplate.getById(id.value);
    
    if (response.data.success) {
      const template = response.data.template;
      
      // 設置表單資料
      form.value = {
        name: template.name,
        basePrice: template.basePrice,
        description: template.description || '',
        image: {
          url: template.image?.url || '',
          publicId: template.image?.publicId || '',
          alt: template.image?.alt || ''
        },
        isAvailable: template.isAvailable !== undefined ? template.isAvailable : true,
        actualStock: template.actualStock !== undefined ? template.actualStock : -1,
        displayStock: template.displayStock !== undefined ? template.displayStock : -1,
        dishes: template.dishes?.map(dish => ({
          dish: dish.dish,
          options: dish.options || []
        })) || []
      };
    } else {
      error.value = response.data.message || '獲取套餐模板資料失敗';
    }
  } catch (err) {
    console.error('Error fetching template data:', err);
    
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

// 獲取餐點模板列表
const fetchDishTemplates = async () => {
  try {
    const response = await api.dishTemplate.getAll();
    
    if (response.data.success) {
      dishTemplates.value = response.data.templates || [];
    } else {
      console.error('Error fetching dish templates:', response.data.message);
    }
  } catch (err) {
    console.error('Error fetching dish templates:', err);
  }
};

// 獲取餐點的選項
const getDishOptions = (dishId) => {
  if (!dishId) return [];
  
  const dish = dishTemplates.value.find(d => d._id === dishId);
  if (!dish || !dish.optionCategories) return [];
  
  // 假設 optionCategories 中包含了選項的資訊，需要根據實際的資料結構調整
  return dish.optionCategories.map(cat => cat.options || []).flat();
};

// 圖片選擇處理
const handleImageSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  selectedImage.value = file;
  
  // 創建臨時 URL 來顯示預覽
  const previewUrl = URL.createObjectURL(file);
  form.value.image.url = previewUrl;
  
  // 如果沒有 Alt 文字，使用檔案名或餐點名稱
  if (!form.value.image.alt) {
    form.value.image.alt = form.value.name || file.name;
  }
};

// 移除圖片
const removeImage = () => {
  // 如果有實際圖片 ID，需要記錄以便儲存時刪除
  form.value.image = {
    url: '',
    publicId: '',
    alt: ''
  };
  
  selectedImage.value = null;
};

// 上傳圖片
const uploadImage = async () => {
  if (!selectedImage.value) return true;
  
  isUploading.value = true;
  
  try {
    // 轉換文件為 base64
    const base64Image = await api.image.fileToBase64(selectedImage.value);
    
    let response;
    if (form.value.image.publicId) {
      // 如果已有圖片，進行修改
      response = await api.image.modify(form.value.image.publicId, base64Image);
    } else {
      // 如果沒有圖片，進行新增
      response = await api.image.upload(base64Image);
    }
    
    // 檢查 API 響應
    if (response.data.success) {
      // 更新 form 的圖片資訊
      form.value.image.url = response.data.secure_url;
      form.value.image.publicId = response.data.public_id;
      return true;
    } else {
      error.value = response.data.message || '圖片上傳失敗';
      return false;
    }
  } catch (err) {
    console.error('圖片上傳錯誤:', err);
    
    if (err.response) {
      error.value = err.response.data.message || '圖片上傳失敗';
    } else if (err.request) {
      error.value = '無法連線到伺服器';
    } else {
      error.value = '圖片上傳發生錯誤，請稍後再試';
    }
    
    return false;
  } finally {
    isUploading.value = false;
  }
};

// 切換庫存限制
const toggleStockLimit = (type) => {
  if (type === 'actual') {
    if (form.value.actualStock === -1) {
      form.value.actualStock = 0;
      form.value.displayStock = 0;
    } else {
      form.value.actualStock = -1;
      form.value.displayStock = -1;
    }
  } else if (type === 'display') {
    form.value.displayStock = form.value.displayStock === -1 ? 0 : -1;
  }
};

// 新增餐點
const addDish = () => {
  form.value.dishes.push({
    dish: '',
    options: []
  });
};

// 移除餐點
const removeDish = (index) => {
  form.value.dishes.splice(index, 1);
};

// 移動餐點順序
const moveDish = (index, direction) => {
  const newIndex = index + direction;
  if (newIndex >= 0 && newIndex < form.value.dishes.length) {
    const temp = form.value.dishes[index];
    form.value.dishes[index] = form.value.dishes[newIndex];
    form.value.dishes[newIndex] = temp;
  }
};

// 驗證表單
const validateForm = () => {
  const errors = {};
  
  if (!form.value.name.trim()) {
    errors.name = '請輸入套餐名稱';
  }
  
  if (!form.value.basePrice || form.value.basePrice <= 0) {
    errors.basePrice = '請輸入有效的價格（大於 0）';
  }
  
  // 檢查餐點是否都有選擇
  let hasEmptyDish = false;
  form.value.dishes.forEach((dish, index) => {
    if (!dish.dish) {
      dish.error = '請選擇餐點';
      hasEmptyDish = true;
    } else {
      dish.error = '';
    }
  });
  
  if (hasEmptyDish) {
    errors.dishes = '請選擇所有餐點或移除空白項目';
  }
  
  // 檢查是否至少有一個餐點
  if (form.value.dishes.length === 0) {
    errors.dishes = '套餐至少需要包含一個餐點';
  }
  
  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// 儲存套餐模板
const saveTemplate = async () => {
  // 表單驗證
  if (!validateForm()) {
    return;
  }
  
  isSubmitting.value = true;
  error.value = null;
  
  try {
    // 如果有選擇新圖片，先上傳圖片
    if (selectedImage.value) {
      const uploadSuccess = await uploadImage();
      if (!uploadSuccess) {
        isSubmitting.value = false;
        return;
      }
    }
    
    // 準備表單數據
    const templateData = {
      name: form.value.name,
      basePrice: form.value.basePrice,
      description: form.value.description,
      image: form.value.image,
      isAvailable: form.value.isAvailable,
      actualStock: form.value.actualStock,
      displayStock: form.value.displayStock,
      dishes: form.value.dishes
    };
    
    let response;
    
    // 根據是新增還是編輯來呼叫不同的 API
    if (isNew.value) {
      response = await api.comboTemplate.create(templateData);
    } else {
      response = await api.comboTemplate.update(id.value, templateData);
    }
    
    // 檢查 API 響應
    if (response.data.success) {
      alert(isNew.value ? '套餐新增成功！' : '套餐更新成功！');
      router.push({ name: 'admin-combo-template' });
    } else {
      error.value = response.data.message || '儲存失敗，請稍後再試';
    }
  } catch (err) {
    console.error('Error saving template:', err);
    
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
const confirmDelete = async () => {
  if (!confirm(`確定要刪除套餐「${form.value.name}」嗎？此操作無法復原！`)) {
    return;
  }
  
  isSubmitting.value = true;
  error.value = null;
  
  try {
    const response = await api.comboTemplate.delete(id.value);
    
    if (response.data.success) {
      alert('套餐刪除成功！');
      router.push({ name: 'admin-combo-template' });
    } else {
      error.value = response.data.message || '刪除失敗，請稍後再試';
    }
  } catch (err) {
    console.error('Error deleting template:', err);
    
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

// 返回列表頁
const goBack = () => {
  router.push({ name: 'admin-combo-template' });
};

// 初始化
onMounted(async () => {
  await Promise.all([
    fetchDishTemplates(),
    fetchTemplateData()
  ]);
});

// 監聽庫存變化，確保顯示庫存不大於實際庫存
watch(() => form.value.actualStock, (newValue) => {
  if (newValue !== -1 && form.value.displayStock !== -1) {
    form.value.displayStock = Math.min(form.value.displayStock, newValue);
  }
});

</script>