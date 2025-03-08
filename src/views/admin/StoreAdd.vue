<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h2 class="mb-0">新增店家</h2>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="storeName" class="form-label">店家名稱</label>
                <input
                  type="text"
                  class="form-control"
                  id="storeName"
                  v-model="storeForm.name"
                  required
                />
              </div>

              <!-- 店家圖片上傳 -->
              <div class="mb-3">
                <label for="imageUpload" class="form-label">店家圖片</label>
                <div class="input-group mb-3">
                  <input type="file" class="form-control" id="imageUpload" @change="handleImageSelect" accept="image/*">
                </div>
                <div v-if="imagePreview" class="mt-2">
                  <img :src="imagePreview" :alt="storeForm.image.alt || '圖片預覽'" class="img-thumbnail" style="max-height: 200px">
                </div>
                <div class="invalid-feedback" v-if="errors.image">
                  請上傳圖片
                </div>
              </div>

              <div class="mb-3">
                <label for="imageAlt" class="form-label">圖片描述</label>
                <input type="text" class="form-control" :class="{ 'is-invalid': errors.imageAlt }" id="imageAlt"
                  v-model="storeForm.image.alt">
                <div class="invalid-feedback">
                  請輸入圖片描述
                </div>
              </div>

              <div class="mb-3">
                <label for="menuSelect" class="form-label">選擇菜單</label>
                <select 
                  class="form-select"
                  id="menuSelect"
                  v-model="storeForm.menuItem"
                  required
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
              </div>

              <div class="d-flex justify-content-between">
                <router-link to="./show" class="btn btn-secondary">
                  返回
                </router-link>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  {{ loading ? '儲存中...' : '儲存' }}
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
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const loading = ref(false)
const menus = ref([])

// 圖片相關
const selectedImage = ref(null)
const imagePreview = ref(null)

const errors = reactive({
  image: false,
  imageAlt: false
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

// 獲取所有菜單
const fetchMenus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/menu`)
    menus.value = response.data
  } catch (error) {
    console.error('獲取菜單失敗:', error)
    alert('獲取菜單失敗')
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
}

// 上傳圖片到伺服器
const uploadImage = async () => {
  if (!selectedImage.value) return null
  
  try {
    // 轉換檔案為 base64
    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(selectedImage.value)
    })
    
    // 上傳新圖片
    const response = await axios.post(`${API_BASE_URL}/image`, {
      image: base64Image
    })
    return response.data
  } catch (error) {
    console.error('圖片上傳失敗:', error)
    throw error
  }
}

const validateForm = () => {
  let isValid = true
  
  // 如果已選擇圖片但沒有填寫描述
  if (selectedImage.value && !storeForm.value.image.alt.trim()) {
    errors.imageAlt = true
    isValid = false
  } else {
    errors.imageAlt = false
  }
  
  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  try {
    loading.value = true
    
    // 如果有選擇圖片，先上傳圖片
    if (selectedImage.value) {
      const imageData = await uploadImage()
      if (imageData) {
        storeForm.value.image.url = imageData.secure_url
        storeForm.value.image.publicId = imageData.public_id
      }
    }
    console.log(storeForm.value)
    await axios.post(`${API_BASE_URL}/store`, storeForm.value)
    router.push('./show')
  } catch (error) {
    console.error('新增失敗:', error)
    alert('新增失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMenus()
})
</script>