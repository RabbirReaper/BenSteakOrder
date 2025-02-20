<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error" class="alert alert-danger">
    {{ error }}
  </div>
  <template v-else>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Edit Raw Meat: {{ form.name }}</h2>
      <button class="btn btn-danger" @click="handleDelete">Delete Raw Meat</button>
    </div>

    <form class="needs-validation" @submit.prevent="handleSubmit" novalidate>
      <div class="mb-3">
        <label for="name" class="form-label">Raw Meat Name</label>
        <input type="text" class="form-control" :class="{ 'is-invalid': errors.name }" id="name" v-model="form.name"
          required>
        <div class="invalid-feedback">
          Please enter a raw meat name.
        </div>
      </div>

      <!-- 餐點圖片上傳 -->
      <div class="mb-3">
        <label for="imageUpload" class="form-label">Update Image</label>
        <div class="input-group mb-3">
          <input type="file" class="form-control" id="imageUpload" @change="handleImageUpload" accept="image/*"
            :disabled="isUploading">
        </div>
        <div v-if="isUploading" class="progress mt-2">
          <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%">
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
        <input type="text" class="form-control" :class="{ 'is-invalid': errors.imageAlt }" id="imageAlt"
          v-model="form.image.alt" required>
        <div class="invalid-feedback">
          Please enter an image description.
        </div>
      </div>

      <div class="mb-3">
        <label for="price" class="form-label">Price</label>
        <div class="input-group">
          <span class="input-group-text">$</span>
          <input type="number" class="form-control" :class="{ 'is-invalid': errors.price }" id="price"
            v-model.number="form.price" min="0" step="0.01" required>
          <div class="invalid-feedback">
            Please enter a valid price (greater than 0).
          </div>
        </div>
      </div>

      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <textarea class="form-control" id="description" v-model="form.description" rows="3"
          :class="{ 'is-invalid': errors.description }" required></textarea>
        <div class="invalid-feedback">
          Please enter a description.
        </div>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-primary flex-grow-1" type="submit">Update Raw Meat</button>
        <button class="btn btn-secondary" type="button" @click="router.push('/admin/dish/show')">Cancel</button>
      </div>
    </form>
  </template>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const loading = ref(true)
const error = ref(null)
const isUploading = ref(false)

const form = reactive({
  name: '',
  price: 0,
  description: '',
  image: {
    url: '',
    publicId: '',
    alt: ''
  }
})

const errors = reactive({
  name: false,
  price: false,
  description: false,
  image: false,
  imageAlt: false
})

const fetchRawMeat = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dish/rawMeat/${route.params.id}`)
    const rawMeat = response.data

    Object.keys(form).forEach(key => {
      if (key === 'image') {
        form.image.url = rawMeat.image.url
        form.image.publicId = rawMeat.image.publicId
        form.image.alt = rawMeat.image.alt
      } else {
        form[key] = rawMeat[key]
      }
    })

    loading.value = false
  } catch (err) {
    error.value = 'Error loading raw meat data: ' + err.message
    loading.value = false
  }
}

onMounted(fetchRawMeat)

const validateForm = () => {
  errors.name = !form.name.trim()
  errors.price = !form.price || form.price <= 0
  errors.description = !form.description.trim()
  errors.image = !form.image.url
  errors.imageAlt = !form.image.alt.trim()
  return Object.values(errors).some(error => error)
}

const handleSubmit = async () => {
  if (validateForm()) {
    return
  }

  try {
    await axios.put(`${API_BASE_URL}/dish/rawMeat/${route.params.id}`, form)
    router.push('/admin/dish/show')
  } catch (error) {
    console.error('Error updating raw meat:', error)
  }
}

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this raw meat?')) {
    return
  }

  try {
    await axios.delete(`${API_BASE_URL}/dish/rawMeat/${route.params.id}`)
    router.push('/admin/dish/show')
  } catch (error) {
    console.error('Error deleting raw meat:', error)
  }
}

// 處理圖片上傳
const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  isUploading.value = true

  try {
    // 轉換檔案為 base64
    const base64Image = await convertFileToBase64(file)

    if (form.image.publicId) {
      // 如果已有圖片，進行修改
      const response = await axios.put(`${API_BASE_URL}/image`, {
        publicId: form.image.publicId,
        newImage: base64Image
      })

      updateFormImage(response.data)
    } else {
      // 如果沒有圖片，進行新增
      const response = await axios.post(`${API_BASE_URL}/image`, {
        image: base64Image
      })

      updateFormImage(response.data)
    }
  } catch (error) {
    console.error('Error handling image:', error)
    alert('Image upload failed. Please try again.')
  } finally {
    isUploading.value = false
  }
}

// 將檔案轉換為 base64
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 更新表單的圖片資訊
const updateFormImage = (data) => {
  form.image.url = data.secure_url
  form.image.publicId = data.public_id
  if (!form.image.alt) {
    form.image.alt = form.name || 'Dish image'
  }
}
</script>