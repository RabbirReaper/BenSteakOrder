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
import { ref, onMounted } from 'vue'
import axios from 'axios'
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

const storeForm = ref({
  name: '',
  menuItem: '',
  announcements: []
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

// 獲取店家資料
const fetchStore = async () => {
  try {
    loading.value = true
    const storeId = route.params.id
    const { data: storeData } = await axios.get(`${API_BASE_URL}/store/${storeId}`)

    storeForm.value = {
      name: storeData.name,
      menuItem: storeData.menuItem,
      announcements: storeData.announcements || []
    }
  } catch (error) {
    console.error('獲取店家資料失敗:', error)
    alert('獲取店家資料失敗')
    router.push('./show')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true
    const storeId = route.params.id
    await axios.put(`${API_BASE_URL}/store/${storeId}`, storeForm.value)
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
    await axios.delete(`${API_BASE_URL}/store/${storeId}`)
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
    await axios.put(`${API_BASE_URL}/store/${storeId}`, storeForm.value)
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
    await axios.put(`${API_BASE_URL}/store/${storeId}`, storeForm.value)
  } catch (error) {
    console.error('刪除公告失敗:', error)
    alert('刪除公告失敗，請稍後再試')
  }
}

onMounted(() => {
  Promise.all([fetchStore(), fetchMenus()])
})
</script>