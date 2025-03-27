<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h2 class="mb-0">新增店家</h2>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSubmit" novalidate>
              <div class="mb-3">
                <label for="storeName" class="form-label">店家名稱</label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.name }"
                  id="storeName"
                  v-model="storeForm.name"
                  required
                  @blur="validateName"
                />
                <div class="invalid-feedback">
                  請輸入店家名稱
                </div>
              </div>

              <!-- 店家圖片上傳 -->
              <div class="mb-3">
                <label for="imageUpload" class="form-label">店家圖片</label>
                <div class="input-group mb-3">
                  <input type="file" class="form-control" :class="{ 'is-invalid': errors.image }" id="imageUpload" @change="handleImageSelect" accept="image/*">
                </div>
                <div v-if="imagePreview" class="mt-2">
                  <img :src="imagePreview" :alt="storeForm.image.alt || '圖片預覽'" class="img-thumbnail" style="max-height: 200px">
                </div>
                <div class="invalid-feedback">
                  請上傳圖片
                </div>
              </div>

              <div class="mb-3">
                <label for="imageAlt" class="form-label">圖片描述</label>
                <input 
                  type="text" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.imageAlt }" 
                  id="imageAlt"
                  v-model="storeForm.image.alt"
                  @blur="validateImageAlt"
                />
                <div class="invalid-feedback">
                  請輸入圖片描述
                </div>
              </div>

              <div class="mb-3">
                <label for="menuSelect" class="form-label">選擇菜單</label>
                <select 
                  class="form-select"
                  :class="{ 'is-invalid': errors.menuItem }"
                  id="menuSelect"
                  v-model="storeForm.menuItem"
                  required
                  @blur="validateMenu"
                >
                  <option value="">請選擇菜單</option>
                  <option 
                    v-for="menu in menus" 
                    :key="menu._id"
                    :value="menu._id"
                  >
                    {{ menu.name }}
                  </option>
                </select>
                <div class="invalid-feedback">
                  請選擇菜單
                </div>
              </div>

              <!-- 錯誤訊息 -->
              <div v-if="errorMessage" class="alert alert-danger mb-3" role="alert">
                {{ errorMessage }}
              </div>

              <div class="d-flex justify-content-between">
                <router-link to="./show" class="btn btn-secondary">
                  返回
                </router-link>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isSubmitting ? '儲存中...' : '儲存' }}
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
import { ref, reactive, onMounted } from 'vue'
import api from '@/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const errorMessage = ref('') // 儲存錯誤訊息
const isSubmitting = ref(false) // 提交狀態
const menus = ref([])

// 圖片相關
const selectedImage = ref(null)
const imagePreview = ref(null)

// 表單錯誤
const errors = reactive({
  name: false,
  image: false,
  imageAlt: false,
  menuItem: false
})

const storeForm = ref({
  name: '',
  menuItem: '',
  image: {
    url: '',
    publicId: '',
    alt: ''
  }
})

// 驗證店家名稱
const validateName = () => {
  if (!storeForm.value.name.trim()) {
    errors.name = true
    return false
  }
  errors.name = false
  return true
}

// 驗證菜單選擇
const validateMenu = () => {
  if (!storeForm.value.menuItem) {
    errors.menuItem = true
    return false
  }
  errors.menuItem = false
  return true
}

// 驗證圖片描述
const validateImageAlt = () => {
  if (selectedImage.value && !storeForm.value.image.alt.trim()) {
    errors.imageAlt = true
    return false
  }
  errors.imageAlt = false
  return true
}

// 獲取所有菜單
const fetchMenus = async () => {
  try {
    const response = await api.menu.getAll()
    if (response.data.success) {
      menus.value = response.data.menus
    } else {
      errorMessage.value = response.data.message || '獲取菜單資料失敗'
    }
  } catch (error) {
    console.error('獲取菜單失敗:', error)
    if (error.response) {
      // 伺服器有回應但狀態碼不是 2xx
      errorMessage.value = error.response.data.message || '獲取菜單失敗'
    } else if (error.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      errorMessage.value = '無法連線到伺服器'
    } else {
      // 其他錯誤（例如程式錯誤）
      errorMessage.value = '發生錯誤，請稍後再試'
    }
  }
}

// 選擇圖片時的處理
const handleImageSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 儲存選擇的檔案，等待提交表單時上傳
  selectedImage.value = file
  
  // 創建本地預覽
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
  
  // 如果未輸入圖片描述，自動設定為店家名稱
  if (!storeForm.value.image.alt) {
    storeForm.value.image.alt = storeForm.value.name || '店家圖片'
  }
  
  errors.image = false
}

// 上傳圖片到伺服器
const uploadImage = async () => {
  if (!selectedImage.value) return null
  
  try {
    // 轉換檔案為 base64
    const base64Image = await api.image.fileToBase64(selectedImage.value)
    
    // 上傳新圖片
    const response = await api.image.upload(base64Image)
    
    if (response.data.success) {
      return response.data
    } else {
      throw new Error(response.data.message || '圖片上傳失敗')
    }
  } catch (error) {
    console.error('圖片上傳失敗:', error)
    throw error
  }
}

// 表單驗證
const validateForm = () => {
  let isValid = true
  
  // 驗證店家名稱
  if (!validateName()) {
    isValid = false
  }
  
  // 驗證菜單選擇
  if (!validateMenu()) {
    isValid = false
  }
  
  // 圖片描述驗證
  if (!validateImageAlt()) {
    isValid = false
  }
  
  return isValid
}

// 提交表單
const handleSubmit = async () => {
  errorMessage.value = '' // 先清空錯誤訊息
  
  // 表單驗證
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true // 設置提交狀態為 true
  
  try {
    // 如果有選擇圖片，先上傳圖片
    if (selectedImage.value) {
      const imageData = await uploadImage()
      if (imageData) {
        storeForm.value.image.url = imageData.secure_url
        storeForm.value.image.publicId = imageData.public_id
      }
    }

    // 提交店家資料
    const response = await api.store.create(storeForm.value)
    
    if (response.data.success) {
      // 創建成功，導向店家列表頁
      router.push('./show')
    } else {
      errorMessage.value = response.data.message || '新增店家失敗'
    }
  } catch (error) {
    console.error('新增失敗:', error)
    
    if (error.response) {
      // 伺服器有回應但狀態碼不是 2xx
      errorMessage.value = error.response.data.message || '新增失敗，請稍後再試'
    } else if (error.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      errorMessage.value = '無法連線到伺服器'
    } else {
      // 其他錯誤（例如程式錯誤）
      errorMessage.value = '發生錯誤，請稍後再試'
    }
  } finally {
    isSubmitting.value = false // 無論成功或失敗，都將提交狀態設回 false
  }
}

onMounted(() => {
  fetchMenus()
})
</script>