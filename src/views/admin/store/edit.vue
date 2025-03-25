<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <!-- Store Info Card -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h2 class="mb-0">編輯店家</h2>
            <button class="btn btn-danger" @click="handleDelete" :disabled="isDeleting">
              <span v-if="isDeleting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              刪除店家
            </button>
          </div>
          <div class="card-body">
            <div v-if="isLoading" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-if="errorMessage" class="alert alert-danger mb-3" role="alert">
              {{ errorMessage }}
            </div>

            <form v-if="!isLoading" @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="storeName" class="form-label">店家名稱</label>
                <input type="text" class="form-control" :class="{ 'is-invalid': errors.name }" id="storeName" v-model="storeForm.name" required />
                <div class="invalid-feedback">
                  請輸入店家名稱
                </div>
              </div>

              <!-- 店家圖片上傳 -->
              <div class="mb-3">
                <label for="imageUpload" class="form-label">店家圖片</label>
                <div class="input-group mb-3">
                  <input type="file" class="form-control" :class="{ 'is-invalid': errors.image }" id="imageUpload" @change="handleImageSelect" accept="image/*">
                  <div class="invalid-feedback">
                    請上傳圖片
                  </div>
                </div>
                <div v-if="imagePreview || storeForm.image?.url" class="mt-2">
                  <img :src="imagePreview || storeForm.image?.url" :alt="storeForm.image?.alt || 'Preview'" class="img-thumbnail" style="max-height: 200px">
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
                <select class="form-select" :class="{ 'is-invalid': errors.menuItem }" id="menuSelect" v-model="storeForm.menuItem" required>
                  <option value="">請選擇菜單</option>
                  <option v-for="menu in menus" :key="menu._id" :value="menu._id">
                    {{ menu.name }}
                  </option>
                </select>
                <div class="invalid-feedback">
                  請選擇菜單
                </div>
              </div>

              <div class="d-flex justify-content-between">
                <router-link to="./show" class="btn btn-secondary">
                  返回
                </router-link>
                <button type="submit" class="btn btn-primary" :disabled="isSaving">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isSaving ? '儲存中...' : '儲存' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Announcements Card -->
        <div class="card" v-if="!isLoading">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h3 class="mb-0">店家公告</h3>
            <button class="btn btn-success" @click="openAnnouncementModal()">
              新增公告
            </button>
          </div>
          <div class="card-body">
            <div v-if="!storeForm.announcements?.length" class="text-center py-3">
              尚無公告
            </div>
            <div v-else class="list-group">
              <div v-for="(announcement, index) in storeForm.announcements" :key="index" 
                   class="list-group-item list-group-item-action">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 class="mb-1">{{ announcement.title }}</h5>
                    <p class="mb-1">{{ announcement.content }}</p>
                  </div>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" 
                            @click="openAnnouncementModal(index)">
                      編輯
                    </button>
                    <button class="btn btn-sm btn-outline-danger" 
                            @click="deleteAnnouncement(index)"
                            :disabled="isDeletingAnnouncement === index">
                      <span v-if="isDeletingAnnouncement === index" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      刪除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Announcement Modal -->
    <div class="modal fade" id="announcementModal" tabindex="-1" ref="announcementModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingAnnouncementIndex === null ? '新增公告' : '編輯公告' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="announcementError" class="alert alert-danger mb-3" role="alert">
              {{ announcementError }}
            </div>
            <form @submit.prevent="saveAnnouncement">
              <div class="mb-3">
                <label class="form-label">公告標題</label>
                <input type="text" class="form-control" :class="{ 'is-invalid': errors.title }" v-model="currentAnnouncement.title" required>
                <div class="invalid-feedback">
                  請輸入公告標題
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">公告內容</label>
                <textarea class="form-control" :class="{ 'is-invalid': errors.content }" v-model="currentAnnouncement.content" rows="3" required></textarea>
                <div class="invalid-feedback">
                  請輸入公告內容
                </div>
              </div>
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">取消</button>
                <button type="submit" class="btn btn-primary" :disabled="isSavingAnnouncement">
                  <span v-if="isSavingAnnouncement" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  儲存
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
import { useRouter, useRoute } from 'vue-router'
import { Modal } from 'bootstrap'

const router = useRouter()
const route = useRoute()
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const isSavingAnnouncement = ref(false)
const isDeletingAnnouncement = ref(null)
const errorMessage = ref('')
const announcementError = ref('')
const menus = ref([])
const announcementModal = ref(null)
const editingAnnouncementIndex = ref(null)
const currentAnnouncement = ref({ title: '', content: '' })

// 圖片相關
const selectedImage = ref(null)
const imagePreview = ref(null)

// 表單錯誤狀態
const errors = reactive({
  name: false,
  image: false,
  imageAlt: false,
  menuItem: false,
  title: false,
  content: false
})

// 店家表單資料
const storeForm = ref({
  name: '',
  menuItem: '',
  announcements: [],
  image: {
    url: '',
    publicId: '',
    alt: ''
  }
})

// 獲取所有菜單
const fetchMenus = async () => {
  try {
    errorMessage.value = ''
    const response = await api.menu.getAll()
    
    if (response.data.success) {
      menus.value = response.data.menus
    } else {
      errorMessage.value = response.data.message || '獲取菜單失敗'
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
      // 其他錯誤
      errorMessage.value = '發生錯誤，請稍後再試'
    }
  }
}

// 獲取店家資料
const fetchStore = async () => {
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    const storeId = route.params.id
    const response = await api.store.getById(storeId)
    
    if (response.data.success) {
      const storeData = response.data.store
      storeForm.value = {
        name: storeData.name,
        menuItem: storeData.menuItem?._id || storeData.menuItem || '',
        announcements: storeData.announcements || [],
        image: storeData.image || {
          url: '',
          publicId: '',
          alt: ''
        }
      }
    } else {
      errorMessage.value = response.data.message || '獲取店家資料失敗'
      setTimeout(() => {
        router.push('./show')
      }, 2000)
    }
  } catch (error) {
    console.error('獲取店家資料失敗:', error)
    
    if (error.response) {
      // 伺服器有回應但狀態碼不是 2xx
      errorMessage.value = error.response.data.message || '獲取店家資料失敗'
    } else if (error.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      errorMessage.value = '無法連線到伺服器'
    } else {
      // 其他錯誤
      errorMessage.value = '發生錯誤，請稍後再試'
    }
    
    setTimeout(() => {
      router.push('./show')
    }, 2000)
  } finally {
    isLoading.value = false
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
    
    let response
    if (storeForm.value.image.publicId) {
      // 如果已有圖片，進行修改
      response = await api.image.modify(storeForm.value.image.publicId, base64Image)
    } else {
      // 如果沒有圖片，進行新增
      response = await api.image.upload(base64Image)
    }
    
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
  
  // 檢查店家名稱
  if (!storeForm.value.name.trim()) {
    errors.name = true
    isValid = false
  } else {
    errors.name = false
  }
  
  // 檢查菜單選擇
  if (!storeForm.value.menuItem) {
    errors.menuItem = true
    isValid = false
  } else {
    errors.menuItem = false
  }
  
  // 如果已選擇新圖片或已有圖片但沒有填寫描述
  if ((selectedImage.value || storeForm.value.image.url) && !storeForm.value.image.alt.trim()) {
    errors.imageAlt = true
    isValid = false
  } else {
    errors.imageAlt = false
  }
  
  return isValid
}

// 提交表單
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  errorMessage.value = ''
  isSaving.value = true
  
  try {
    // 如果有選擇新圖片，先上傳圖片
    if (selectedImage.value) {
      const imageData = await uploadImage()
      if (imageData) {
        storeForm.value.image.url = imageData.secure_url
        storeForm.value.image.publicId = imageData.public_id
      }
    }
    
    const storeId = route.params.id
    const response = await api.store.update(storeId, storeForm.value)
    
    if (response.data.success) {
      router.push('./show')
    } else {
      errorMessage.value = response.data.message || '更新失敗'
    }
  } catch (error) {
    console.error('更新失敗:', error)
    
    if (error.response) {
      // 伺服器有回應但狀態碼不是 2xx
      errorMessage.value = error.response.data.message || '更新失敗'
    } else if (error.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      errorMessage.value = '無法連線到伺服器'
    } else {
      // 其他錯誤
      errorMessage.value = '發生錯誤，請稍後再試'
    }
  } finally {
    isSaving.value = false
  }
}

// 刪除店家
const handleDelete = async () => {
  if (!confirm('確定要刪除這個店家嗎？')) return

  errorMessage.value = ''
  isDeleting.value = true
  
  try {
    const storeId = route.params.id
    const response = await api.store.delete(storeId)
    
    if (response.data.success) {
      router.push('./show')
    } else {
      errorMessage.value = response.data.message || '刪除失敗'
    }
  } catch (error) {
    console.error('刪除失敗:', error)
    
    if (error.response) {
      // 伺服器有回應但狀態碼不是 2xx
      errorMessage.value = error.response.data.message || '刪除失敗'
    } else if (error.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      errorMessage.value = '無法連線到伺服器'
    } else {
      // 其他錯誤
      errorMessage.value = '發生錯誤，請稍後再試'
    }
  } finally {
    isDeleting.value = false
  }
}

// 打開公告編輯視窗
const openAnnouncementModal = (index = null) => {
  editingAnnouncementIndex.value = index
  announcementError.value = ''
  
  // 重置表單錯誤狀態
  errors.title = false
  errors.content = false
  
  if (index !== null) {
    currentAnnouncement.value = { ...storeForm.value.announcements[index] }
  } else {
    currentAnnouncement.value = { title: '', content: '' }
  }
  
  const modal = new Modal(announcementModal.value)
  modal.show()
}

// 驗證公告表單
const validateAnnouncementForm = () => {
  let isValid = true
  
  if (!currentAnnouncement.value.title.trim()) {
    errors.title = true
    isValid = false
  } else {
    errors.title = false
  }
  
  if (!currentAnnouncement.value.content.trim()) {
    errors.content = true
    isValid = false
  } else {
    errors.content = false
  }
  
  return isValid
}

// 儲存公告
const saveAnnouncement = async () => {
  if (!validateAnnouncementForm()) {
    return
  }
  
  announcementError.value = ''
  isSavingAnnouncement.value = true
  
  // 先更新本地公告資料
  if (editingAnnouncementIndex.value !== null) {
    storeForm.value.announcements[editingAnnouncementIndex.value] = { ...currentAnnouncement.value }
  } else {
    storeForm.value.announcements.push({ ...currentAnnouncement.value })
  }
  
  try {
    const storeId = route.params.id
    const response = await api.store.update(storeId, storeForm.value)
    
    if (response.data.success) {
      const modal = Modal.getInstance(announcementModal.value)
      modal.hide()
    } else {
      // 恢復原本的資料
      if (editingAnnouncementIndex.value !== null) {
        const originalAnnouncement = { ...storeForm.value.announcements[editingAnnouncementIndex.value] }
        storeForm.value.announcements[editingAnnouncementIndex.value] = originalAnnouncement
      } else {
        storeForm.value.announcements.pop()
      }
      
      announcementError.value = response.data.message || '儲存公告失敗'
    }
  } catch (error) {
    console.error('儲存公告失敗:', error)
    
    // 恢復原本的資料
    if (editingAnnouncementIndex.value !== null) {
      fetchStore() // 重新獲取資料
    } else {
      storeForm.value.announcements.pop()
    }
    
    if (error.response) {
      // 伺服器有回應但狀態碼不是 2xx
      announcementError.value = error.response.data.message || '儲存公告失敗'
    } else if (error.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      announcementError.value = '無法連線到伺服器'
    } else {
      // 其他錯誤
      announcementError.value = '發生錯誤，請稍後再試'
    }
  } finally {
    isSavingAnnouncement.value = false
  }
}

// 刪除公告
const deleteAnnouncement = async (index) => {
  if (!confirm('確定要刪除這則公告嗎？')) return

  isDeletingAnnouncement.value = index
  
  // 先備份要刪除的公告
  const deletedAnnouncement = { ...storeForm.value.announcements[index] }
  
  // 先更新本地資料
  storeForm.value.announcements.splice(index, 1)
  
  try {
    const storeId = route.params.id
    const response = await api.store.update(storeId, storeForm.value)
    
    if (!response.data.success) {
      // 恢復刪除的公告
      storeForm.value.announcements.splice(index, 0, deletedAnnouncement)
      errorMessage.value = response.data.message || '刪除公告失敗'
    }
  } catch (error) {
    console.error('刪除公告失敗:', error)
    
    // 恢復刪除的公告
    storeForm.value.announcements.splice(index, 0, deletedAnnouncement)
    
    if (error.response) {
      // 伺服器有回應但狀態碼不是 2xx
      errorMessage.value = error.response.data.message || '刪除公告失敗'
    } else if (error.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      errorMessage.value = '無法連線到伺服器'
    } else {
      // 其他錯誤
      errorMessage.value = '發生錯誤，請稍後再試'
    }
  } finally {
    isDeletingAnnouncement.value = null
  }
}

onMounted(() => {
  Promise.all([fetchStore(), fetchMenus()])
})
</script>