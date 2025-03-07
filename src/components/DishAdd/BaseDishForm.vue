<template>
  <form class="needs-validation" @submit.prevent="handleSubmit" novalidate>
    <!-- 基本字段 -->
    <div class="mb-3">
      <label :for="nameId" class="form-label">{{ formTitle }} Name</label>
      <input 
        type="text" 
        class="form-control" 
        :class="{ 'is-invalid': errors.name }" 
        :id="nameId" 
        v-model="form.name"
        required
      >
      <div class="invalid-feedback">
        Please enter a {{ formTitle.toLowerCase() }} name.
      </div>
    </div>

    <!-- 圖片上傳區塊 (僅當需要圖片時) -->
    <template v-if="requiresImage">
      <div class="mb-3">
        <label for="imageUpload" class="form-label">{{ isEdit ? 'Update' : 'Upload' }} Image</label>
        <div class="input-group mb-3">
          <input 
            type="file" 
            class="form-control" 
            id="imageUpload" 
            @change="handleImageSelect" 
            accept="image/*"
            :disabled="isUploading"
          >
        </div>
        <div v-if="isUploading" class="progress mt-2">
          <div class="progress-bar progress-bar-striped progress-bar-animated" 
               role="progressbar" 
               style="width: 100%">
            Uploading...
          </div>
        </div>
        <div v-if="form.image.url" class="mt-2">
          <img :src="form.image.url" :alt="form.image.alt || 'Preview'" class="img-thumbnail" style="max-height: 200px">
        </div>
        <div class="invalid-feedback" v-if="errors.image">
          Please upload an image.
        </div>
      </div>

      <div class="mb-3">
        <label for="imageAlt" class="form-label">Image Description</label>
        <input 
          type="text" 
          class="form-control" 
          :class="{ 'is-invalid': errors.imageAlt }" 
          id="imageAlt"
          v-model="form.image.alt" 
          required
        >
        <div class="invalid-feedback">
          Please enter an image description.
        </div>
      </div>
    </template>

    <!-- 價格字段 -->
    <div class="mb-3">
      <label for="price" class="form-label">Price</label>
      <div class="input-group">
        <span class="input-group-text">$</span>
        <input 
          type="number" 
          class="form-control" 
          :class="{ 'is-invalid': errors.price }" 
          id="price"
          v-model.number="form.price" 
          min="0" 
          step="0.01" 
          required
        >
        <div class="invalid-feedback">
          Please enter a valid price (greater than 0).
        </div>
      </div>
    </div>

    <!-- 插槽位置：允許各種表單插入自己的特定字段 -->
    <slot name="additional-fields"></slot>

    <!-- 描述字段 (僅當需要描述時) -->
    <div v-if="requiresDescription" class="mb-3">
      <label for="description" class="form-label">Description</label>
      <textarea 
        class="form-control" 
        id="description" 
        v-model="form.description" 
        rows="3"
        :class="{ 'is-invalid': errors.description }" 
        :required="requiresDescription"
      ></textarea>
      <div class="invalid-feedback">
        Please enter a description.
      </div>
    </div>

    <!-- 提交和取消按鈕區 -->
    <div v-if="isEdit" class="d-flex gap-2">
      <button class="btn btn-primary flex-grow-1" type="submit" :disabled="isSubmitting || isUploading">
        {{ isSubmitting ? 'Saving...' : `Update ${formTitle}` }}
      </button>
      <button class="btn btn-secondary" type="button" @click="handleCancel">Cancel</button>
    </div>
    <button v-else class="btn btn-primary w-100" type="submit" :disabled="isSubmitting || isUploading">
      {{ isSubmitting ? 'Saving...' : `Add ${formTitle}` }}
    </button>
  </form>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const props = defineProps({
  // 基本屬性
  formTitle: { type: String, required: true }, // 例如 "Main Dish", "Else Dish" 等
  apiEndpoint: { type: String, required: true }, // 例如 "mainDish", "elseDish" 等
  initialData: { type: Object, default: () => ({}) },
  
  // 功能標誌
  requiresImage: { type: Boolean, default: true },
  requiresDescription: { type: Boolean, default: true },
  isEdit: { type: Boolean, default: false },
  
  // ID 用於編輯模式
  itemId: { type: String, default: null }
});

const emit = defineEmits(['cancel', 'delete']);

const router = useRouter();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 狀態變數
const isUploading = ref(false);
const isSubmitting = ref(false);
const selectedImage = ref(null);

// 基本表單數據
const form = ref({
  name: '',
  price: 0,
  description: props.requiresDescription ? '' : undefined,
  image: {
    url: '',
    publicId: '',
    alt: ''
  }
});

// 初始化表單資料
const initFormData = () => {
  if (props.initialData) {
    // 先填充基本字段
    form.value.name = props.initialData.name || '';
    form.value.price = props.initialData.price || 0;
    
    if (props.requiresDescription) {
      form.value.description = props.initialData.description || '';
    }
    
    // 處理圖片數據
    if (props.requiresImage && props.initialData.image) {
      form.value.image = {
        url: props.initialData.image.url || '',
        publicId: props.initialData.image.publicId || '',
        alt: props.initialData.image.alt || ''
      };
    }
  }
};

// 確保有唯一的 ID，避免多個表單的 ID 衝突
const nameId = computed(() => {
  return `${props.apiEndpoint}-name-${Math.random().toString(36).substring(2, 9)}`;
});

// 表單驗證錯誤
const errors = ref({
  name: false,
  price: false,
  description: false,
  image: false,
  imageAlt: false
});

// 表單驗證邏輯
const validateForm = () => {
  errors.value.name = !form.value.name.trim();
  errors.value.price = !form.value.price || form.value.price <= 0;
  
  if (props.requiresDescription) {
    errors.value.description = !form.value.description?.trim();
  }
  
  if (props.requiresImage) {
    errors.value.image = !form.value.image.url;
    errors.value.imageAlt = !form.value.image.alt?.trim();
  }

  return !Object.values(errors.value).some(error => error);
};

// 圖片選擇處理 (不立即上傳)
const handleImageSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // 儲存文件以便稍後上傳
  selectedImage.value = file;
  
  // 創建臨時 URL 來顯示預覽
  const previewUrl = URL.createObjectURL(file);
  form.value.image.url = previewUrl;
  
  // 如果沒有 Alt 文字，使用檔案名
  if (!form.value.image.alt) {
    form.value.image.alt = form.value.name || file.name;
  }
};

// 將文件轉為 base64 格式
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 上傳圖片，僅在表單提交時執行
const uploadImage = async () => {
  if (!selectedImage.value) return true; // 如果沒有新選擇的圖片，不需上傳
  
  isUploading.value = true;
  
  try {
    // 轉換文件為 base64
    const base64Image = await convertFileToBase64(selectedImage.value);
    
    let response;
    if (form.value.image.publicId) {
      // 如果已有圖片，進行修改
      response = await axios.put(`${API_BASE_URL}/image`, {
        publicId: form.value.image.publicId,
        newImage: base64Image
      });
    } else {
      // 如果沒有圖片，進行新增
      response = await axios.post(`${API_BASE_URL}/image`, {
        image: base64Image
      });
    }
    
    // 更新 form 的圖片資訊
    form.value.image.url = response.data.secure_url;
    form.value.image.publicId = response.data.public_id;

    return true;
  } catch (error) {
    console.error('Error uploading image:', error);
    alert('Image upload failed. Please try again.');
    return false;
  } finally {
    isUploading.value = false;
  }
};

// 處理表單提交
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // 首先上傳圖片（如果有選擇新圖片）
    if (props.requiresImage && selectedImage.value) {
      const uploadSuccess = await uploadImage();
      if (!uploadSuccess) return;
    }
    
    // 編輯模式
    if (props.isEdit && props.itemId) {
      await axios.put(`${API_BASE_URL}/dish/${props.apiEndpoint}/${props.itemId}`, form.value);
    } 
    // 新增模式
    else {
      await axios.post(`${API_BASE_URL}/dish/${props.apiEndpoint}`, form.value);
    }
    
    // 重定向回列表頁
    router.push('/admin/dish/show');
  } catch (error) {
    console.error(`Error ${props.isEdit ? 'updating' : 'adding'} ${props.formTitle}:`, error);
    alert(`Failed to ${props.isEdit ? 'update' : 'add'} ${props.formTitle}. Please try again.`);
  } finally {
    isSubmitting.value = false;
  }
};

// 取消編輯
const handleCancel = () => {
  emit('cancel');
  router.push('/admin/dish/show');
};

// 監聽初始數據變化
watch(() => props.initialData, (newValue) => {
  if (newValue) {
    initFormData();
  }
}, { deep: true, immediate: true });

// 組件掛載時初始化
onMounted(() => {
  initFormData();
});
</script>