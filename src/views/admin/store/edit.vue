<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <!-- Store Info Card -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h2 class="mb-0">編輯店家</h2>
            <button class="btn btn-danger" @click="handleDelete" :disabled="loading">
              刪除店家
            </button>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <form v-else @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="storeName" class="form-label">店家名稱</label>
                <input type="text" class="form-control" id="storeName" v-model="storeForm.name" required />
              </div>

              <!-- 店家圖片上傳 -->
              <div class="mb-3">
                <label for="imageUpload" class="form-label">店家圖片</label>
                <div class="input-group mb-3">
                  <input type="file" class="form-control" id="imageUpload" @change="handleImageSelect" accept="image/*">
                </div>
                <div v-if="imagePreview || storeForm.image?.url" class="mt-2">
                  <img :src="imagePreview || storeForm.image?.url" :alt="storeForm.image?.alt || 'Preview'" class="img-thumbnail" style="max-height: 200px">
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
                <select class="form-select" id="menuSelect" v-model="storeForm.menuItem._id" required>
                  <option value="">請選擇菜單</option>
                  <option v-for="menu in menus" :key="menu._id" :value="menu._id">
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

        <!-- Announcements Card -->
        <div class="card">
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
                            @click="deleteAnnouncement(index)">
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
            <form @submit.prevent="saveAnnouncement">
              <div class="mb-3">
                <label class="form-label">公告標題</label>
                <input type="text" class="form-control" v-model="currentAnnouncement.title" required>
              </div>
              <div class="mb-3">
                <label class="form-label">公告內容</label>
                <textarea class="form-control" v-model="currentAnnouncement.content" rows="3" required></textarea>
              </div>
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">取消</button>
                <button type="submit" class="btn btn-primary">儲存</button>
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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const loading = ref(false)
const menus = ref([])
const announcementModal = ref(null)
const editingAnnouncementIndex = ref(null)
const currentAnnouncement = ref({ title: '', content: '' })

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
    const response = await api.menu.getAll()
    menus.value = response.data
  } catch (error) {
    console.error('獲取菜單失敗:', error)
    alert('獲取菜單失敗')
  }
}

// 獲取店家資料
const fetchStore = async () => {
  try {
    loading.value = true
    const storeId = route.params.id
    const {data: storeData} = await api.store.getById(storeId)
    storeForm.value = {
      name: storeData.name,
      menuItem: storeData.menuItem,
      announcements: storeData.announcements || [],
      image: storeData.image || {
        url: '',
        publicId: '',
        alt: ''
      }
    }
  } catch (error) {
    console.error('獲取店家資料失敗:', error)
    alert('獲取店家資料失敗')
    router.push('./show')
  } finally {
    loading.value = false
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
    
    if (storeForm.value.image.publicId) {
      // 如果已有圖片，進行修改
      const response = await api.image.modify(storeForm.value.image.publicId, base64Image)

      return response.data
    } else {
      // 如果沒有圖片，進行新增
      const response = await api.image.upload(base64Image)

      return response.data
    }
  } catch (error) {
    console.error('圖片上傳失敗:', error)
    throw error
  }
}

const validateForm = () => {
  let isValid = true
  
  // 如果已選擇新圖片但沒有填寫描述
  if ((selectedImage.value || storeForm.value.image.url) && !storeForm.value.image.alt.trim()) {
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
    
    // 如果有選擇新圖片，先上傳圖片
    if (selectedImage.value) {
      const imageData = await uploadImage()
      if (imageData) {
        storeForm.value.image.url = imageData.secure_url
        storeForm.value.image.publicId = imageData.public_id
      }
    }
    
    const storeId = route.params.id
    await api.store.update(storeId, storeForm.value)
    router.push('./show')
  } catch (error) {
    console.error('更新失敗:', error)
    alert('更新失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('確定要刪除這個店家嗎？')) return

  try {
    loading.value = true
    const storeId = route.params.id
    await api.store.delete(storeId)
    router.push('./show')
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}

// 打開公告編輯視窗
const openAnnouncementModal = (index = null) => {
  editingAnnouncementIndex.value = index
  if (index !== null) {
    currentAnnouncement.value = { ...storeForm.value.announcements[index] }
  } else {
    currentAnnouncement.value = { title: '', content: '' }
  }
  const modal = new Modal(announcementModal.value)
  modal.show()
}

// 儲存公告
const saveAnnouncement = async () => {
  if (editingAnnouncementIndex.value !== null) {
    storeForm.value.announcements[editingAnnouncementIndex.value] = { ...currentAnnouncement.value }
  } else {
    storeForm.value.announcements.push({ ...currentAnnouncement.value })
  }
  
  try {
    const storeId = route.params.id
    await api.store.update(storeId, storeForm.value)
    const modal = Modal.getInstance(announcementModal.value)
    modal.hide()
  } catch (error) {
    console.error('儲存公告失敗:', error)
    alert('儲存公告失敗，請稍後再試')
  }
}

// 刪除公告
const deleteAnnouncement = async (index) => {
  if (!confirm('確定要刪除這則公告嗎？')) return

  try {
    storeForm.value.announcements.splice(index, 1)
    const storeId = route.params.id
    await api.store.update(storeId, storeForm.value)
  } catch (error) {
    console.error('刪除公告失敗:', error)
    alert('刪除公告失敗，請稍後再試')
  }
}

onMounted(() => {
  Promise.all([fetchStore(), fetchMenus()])
})
</script>