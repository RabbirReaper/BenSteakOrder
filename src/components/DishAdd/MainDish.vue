<template>
  <form class="needs-validation" @submit.prevent="handleSubmit" novalidate>
    <!-- 牛排或非牛排選擇 -->
    <div class="mb-3">
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

    <!-- 新增的菜單名稱 -->
    <div class="mb-3">
      <label for="name" class="form-label">Dish Name</label>
      <input type="text" class="form-control" :class="{ 'is-invalid': errors.name }" id="name" v-model="form.name"
        required>
      <div class="invalid-feedback">
        Please enter a dish name.
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

    <!-- Rest of your form fields remain the same -->
    <!-- 餐點價格 -->
    <div class="mb-3">
      <label for="price" class="form-label">Price</label>
      <div class="input-group">
        <span class="input-group-text">$</span>
        <input type="number" class="form-control" :class="{ 'is-invalid': errors.price }" id="price"
          v-model.number="form.price" min="0" step="1" required>
        <div class="invalid-feedback">
          Please enter a valid price (greater than 0).
        </div>
      </div>
    </div>

    <!-- 餐點描述 -->
    <div class="mb-3">
      <label for="description" class="form-label">Description</label>
      <textarea class="form-control" id="description" v-model="form.description" rows="3"
        :class="{ 'is-invalid': errors.description }"></textarea>
      <div class="invalid-feedback">
        Please enter some details.
      </div>
    </div>

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

    <button class="btn btn-primary w-100" type="submit" :disabled="isUploading">Add Main Dish</button>
  </form>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const defaultSauceOptions = ['蘑菇醬', '綜合醬', '黑胡椒醬']
const defaultExtraOptions = ['麵換蛋', '麵換花椰菜', '加麵', '不要麵包']
const defaultSteakDoneness = ['5分熟', '7分熟', '9分熟']

const form = reactive({
  category: 'Steak',
  name: '',
  sauceOptions: [...defaultSauceOptions],
  price: 0,
  extraPrice: 0,
  extraOptions: [...defaultExtraOptions],
  description: '',
  steakDoneness: [...defaultSteakDoneness],
  image: {
    url: '',
    publicId: '',
    alt: ''
  }
})

const errors = reactive({
  category: false,
  name: false,
  price: false,
  extraPrice: false,
  description: false,
  steakDoneness: false,
  image: false,
  imageAlt: false
})

const newSauce = ref('')
const newExtra = ref('')
const newDoneness = ref('')
const isUploading = ref(false)

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

const addSauce = () => {
  if (newSauce.value.trim()) {
    form.sauceOptions.push(newSauce.value.trim())
    newSauce.value = ''
  }
}

const removeSauce = (index) => {
  form.sauceOptions.splice(index, 1)
}

const addDoneness = () => {
  if (newDoneness.value.trim()) {
    form.steakDoneness.push(newDoneness.value.trim())
    newDoneness.value = ''
  }
}

const removeDoneness = (index) => {
  form.steakDoneness.splice(index, 1)
}

const addExtra = () => {
  if (newExtra.value.trim()) {
    form.extraOptions.push(newExtra.value.trim())
    newExtra.value = ''
  }
}

const removeExtra = (index) => {
  form.extraOptions.splice(index, 1)
}

const validateForm = () => {
  errors.category = !form.category
  errors.name = !form.name.trim()
  errors.price = !form.price || form.price <= 0
  errors.extraPrice = form.extraPrice < 0
  errors.description = !form.description
  errors.image = !form.image.url
  errors.imageAlt = !form.image.alt.trim()

  if (form.category === 'Steak') {
    errors.steakDoneness = form.steakDoneness.length === 0
  }

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
  // 如果有臨時上傳的圖片但未提交表單，刪除該圖片
  console.log('onBeforeUnmount')
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
</script>