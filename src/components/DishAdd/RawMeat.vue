<template>
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
      <label for="imageUpload" class="form-label">Upload Image</label>
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

    <button class="btn btn-primary w-100" type="submit">Add Raw Meat</button>
  </form>
</template>

<script setup>
import { reactive, ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
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
    await axios.post(`${API_BASE_URL}/dish/elseDish`, form)

    // 提交成功後，清除臨時圖片標記
    window.temporaryImageId = null

    router.push('/admin/dish/show')
  } catch (error) {
    console.error('Error adding side dish:', error)
  }
}

onBeforeUnmount(async () => {
  console.log('Raw:', window.temporaryImageId)
  // 如果有臨時上傳的圖片但未提交表單，刪除該圖片
  if (window.temporaryImageId) {
    try {
      await axios.delete(`${API_BASE_URL}/image`, {
        data: {
          publicId: window.temporaryImageId
        }
      });

      console.log('臨時圖片已刪除:', window.temporaryImageId)
      window.temporaryImageId = null
    } catch (error) {
      console.error('刪除臨時圖片失敗:', error)
    }
  }
})

// 處理圖片上傳
const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  isUploading.value = true

  // 保存舊圖片的 publicId
  const oldPublicId = form.image.publicId

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

      // 將新上傳的圖片ID保存到元件實例上，以便在表單未提交時能夠刪除
      window.temporaryImageId = response.data.public_id
    }
  } catch (error) {
    console.error('Error handling image:', error)
    alert('Image upload failed. Please try again.')

    // 如果上傳失敗，恢復原來的圖片資訊
    if (oldPublicId) {
      form.image.publicId = oldPublicId
    }
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