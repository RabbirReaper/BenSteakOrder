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

    <!-- 牛排類別選擇（如果是主餐）-->
    <div v-if="apiEndpoint === 'mainDish'" class="mb-3">
      <label class="form-label">Category</label>
      <div class="d-flex gap-3">
        <div class="form-check">
          <input class="form-check-input" type="radio" id="steak" value="Steak" v-model="form.category" required>
          <label class="form-check-label" for="steak">Steak</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" id="nonSteak" value="Non-Steak" v-model="form.category" required>
          <label class="form-check-label" for="nonSteak">Non-Steak</label>
        </div>
      </div>
      <div class="invalid-feedback" v-if="errors.category">
        Please select a category.
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
        <div v-if="form.image && form.image.url" class="mt-2">
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
          step="1" 
          required
        >
        <div class="invalid-feedback">
          Please enter a valid price (greater than 0).
        </div>
      </div>
    </div>

    <!-- 主餐特殊選項 -->
    <template v-if="apiEndpoint === 'mainDish'">
      <!-- 醬料選項 -->
      <div class="mb-3">
        <label class="form-label">Sauce Options</label>
        <div class="d-flex gap-2 mb-2">
          <input type="text" class="form-control" v-model="newSauce" placeholder="Add new sauce">
          <button type="button" class="btn btn-outline-primary" @click="addSauce">Add</button>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="(sauce, index) in form.sauceOptions" :key="index"
            class="badge bg-primary d-flex align-items-center">
            {{ sauce }}
            <button type="button" class="btn-close btn-close-white ms-2" @click="removeSauce(index)"></button>
          </span>
        </div>
      </div>

      <!-- 牛排熟度選項 -->
      <div class="mb-3" v-if="form.category === 'Steak'">
        <label class="form-label">Steak Doneness Options</label>
        <div class="d-flex gap-2 mb-2">
          <input type="text" class="form-control" v-model="newDoneness" placeholder="Add steak doneness">
          <button type="button" class="btn btn-outline-primary" @click="addDoneness">Add</button>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="(doneness, index) in form.steakDoneness" :key="index"
            class="badge bg-primary d-flex align-items-center">
            {{ doneness }}
            <button type="button" class="btn-close btn-close-white ms-2" @click="removeDoneness(index)"></button>
          </span>
        </div>
        <div class="invalid-feedback" v-if="errors.steakDoneness">
          Please add at least one doneness option.
        </div>
      </div>

      <!-- 額外選項 -->
      <div class="mb-3">
        <label class="form-label">Extra Options</label>
        <div class="d-flex gap-2 mb-2">
          <input type="text" class="form-control" v-model="newExtra" placeholder="Add new option">
          <button type="button" class="btn btn-outline-primary" @click="addExtra">Add</button>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="(option, index) in form.extraOptions" :key="index"
            class="badge bg-primary d-flex align-items-center">
            {{ option }}
            <button type="button" class="btn-close btn-close-white ms-2" @click="removeExtra(index)"></button>
          </span>
        </div>
      </div>

      <!-- 加點價格 -->
      <div class="mb-3">
        <label for="extraPrice" class="form-label">Extra Price (如果為0代表不開放加點)</label>
        <div class="input-group">
          <span class="input-group-text">$</span>
          <input type="number" class="form-control" :class="{ 'is-invalid': errors.extraPrice }" id="extraPrice"
            v-model.number="form.extraPrice" min="0" step="1">
          <div class="invalid-feedback">
            Extra price cannot be negative.
          </div>
        </div>
      </div>
    </template>

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

// 預設值設定
const defaultSauceOptions = ['蘑菇醬', '綜合醬', '黑胡椒醬','不加醬'];
const defaultExtraOptions = ['麵換蛋', '麵換花椰菜', '加麵', '不要麵包'];
const defaultSteakDoneness = ['5分熟', '7分熟', '9分熟'];

// 狀態變數
const isUploading = ref(false);
const isSubmitting = ref(false);
const selectedImage = ref(null);
const newSauce = ref('');
const newExtra = ref('');
const newDoneness = ref('');

// 基本表單數據 - 不同類型的表單有不同的初始值
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

// 僅當是主餐時才添加這些欄位
if (props.apiEndpoint === 'mainDish') {
  form.value.category = 'Steak';
  form.value.sauceOptions = [...defaultSauceOptions];
  form.value.steakDoneness = [...defaultSteakDoneness];
  form.value.extraOptions = [...defaultExtraOptions];
  form.value.extraPrice = 0;
}

// 表單驗證錯誤
const errors = ref({
  name: false,
  price: false,
  description: false,
  image: false,
  imageAlt: false,
  category: false,
  steakDoneness: false,
  extraPrice: false
});

// 初始化表單資料
const initFormData = () => {
  if (props.initialData && Object.keys(props.initialData).length > 0) {
    // 對於主餐，確保所有特殊欄位都被初始化
    if (props.apiEndpoint === 'mainDish') {
      // 深拷貝初始數據以避免修改原始對象
      const initialDataCopy = JSON.parse(JSON.stringify(props.initialData));
      
      // 設置預設值
      form.value = {
        name: initialDataCopy.name || '',
        price: initialDataCopy.price || 0,
        description: initialDataCopy.description || '',
        category: initialDataCopy.category || 'Steak',
        sauceOptions: Array.isArray(initialDataCopy.sauceOptions) ? [...initialDataCopy.sauceOptions] : [...defaultSauceOptions],
        steakDoneness: Array.isArray(initialDataCopy.steakDoneness) ? [...initialDataCopy.steakDoneness] : [...defaultSteakDoneness],
        extraOptions: Array.isArray(initialDataCopy.extraOptions) ? [...initialDataCopy.extraOptions] : [...defaultExtraOptions],
        extraPrice: initialDataCopy.extraPrice || 0,
        image: {
          url: initialDataCopy.image?.url || '',
          publicId: initialDataCopy.image?.publicId || '',
          alt: initialDataCopy.image?.alt || ''
        }
      };
    } else {
      // 對於其他餐點類型，只複製基本欄位
      const { name, price, description, image } = props.initialData;
      form.value = {
        name: name || '',
        price: price || 0,
        description: description || '',
        image: {
          url: image?.url || '',
          publicId: image?.publicId || '',
          alt: image?.alt || ''
        }
      };
    }
  }
};

// 確保有唯一的 ID，避免多個表單的 ID 衝突
const nameId = computed(() => {
  return `${props.apiEndpoint}-name-${Math.random().toString(36).substring(2, 9)}`;
});

// 主餐特殊方法
const addSauce = () => {
  if (newSauce.value.trim()) {
    form.value.sauceOptions.push(newSauce.value.trim());
    newSauce.value = '';
  }
};

const removeSauce = (index) => {
  form.value.sauceOptions.splice(index, 1);
};

const addDoneness = () => {
  if (newDoneness.value.trim()) {
    form.value.steakDoneness.push(newDoneness.value.trim());
    newDoneness.value = '';
  }
};

const removeDoneness = (index) => {
  form.value.steakDoneness.splice(index, 1);
};

const addExtra = () => {
  if (newExtra.value.trim()) {
    form.value.extraOptions.push(newExtra.value.trim());
    newExtra.value = '';
  }
};

const removeExtra = (index) => {
  form.value.extraOptions.splice(index, 1);
};

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

  // 主餐特殊驗證
  if (props.apiEndpoint === 'mainDish') {
    errors.value.category = !form.value.category;
    if (form.value.category === 'Steak') {
      errors.value.steakDoneness = form.value.steakDoneness.length === 0;
    }
    errors.value.extraPrice = form.value.extraPrice < 0;
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

// 表單提交處理
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
    
    // 準備表單數據 - 深拷貝避免引用問題
    const formData = JSON.parse(JSON.stringify(form.value));
    
    // 編輯模式
    if (props.isEdit && props.itemId) {
      await axios.put(`${API_BASE_URL}/dish/${props.apiEndpoint}/${props.itemId}`, formData);
    } 
    // 新增模式
    else {
      await axios.post(`${API_BASE_URL}/dish/${props.apiEndpoint}`, formData);
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