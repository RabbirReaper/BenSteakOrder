<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error" class="alert alert-danger">
    {{ error }}
  </div>
  <template v-else>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Edit Dish: {{ form.name }}</h2>
      <button class="btn btn-danger" @click="handleDelete">Delete Dish</button>
    </div>

    <form class="needs-validation" @submit.prevent="handleSubmit" novalidate>
      <div class="mb-3">
        <label for="name" class="form-label">Else Dish Name</label>
        <input type="text" class="form-control" :class="{ 'is-invalid': errors.name }" id="name" v-model="form.name"
          required>
        <div class="invalid-feedback">
          Please enter a side dish name.
        </div>
      </div>

      <div class="mb-3">
        <label for="imageUrl" class="form-label">Image URL</label>
        <input type="url" class="form-control" :class="{ 'is-invalid': errors.imageUrl }" id="imageUrl"
          v-model="form.image.url" required>
        <div class="invalid-feedback">
          Please enter a valid image URL.
        </div>
      </div>

      <div class="mb-3">
        <label for="publicId" class="form-label">Image Public ID</label>
        <input type="text" class="form-control" :class="{ 'is-invalid': errors.publicId }" id="publicId"
          v-model="form.image.publicId" required>
        <div class="invalid-feedback">
          Please enter an image public ID.
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
          :class="{ 'is-invalid': errors.description }"> </textarea>
        <div class="invalid-feedback">
          Please enter some details.
        </div>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-primary flex-grow-1" type="submit">Update Dish</button>
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
const loading = ref(true)
const error = ref(null)

const form = reactive({
  name: '',
  description: '',
  price: 0,
  image: {
    url: '',
    publicId: '',
    alt: ''
  }
})

const errors = reactive({
  name: false,
  description: false,
  price: false,
  imageUrl: false,
  publicId: false,
  imageAlt: false
})

// Fetch dish data
const fetchDish = async () => {
  try {
    const response = await axios.get(`/dish/elseDish/${route.params.id}`)
    const dish = response.data
    
    // Populate form with existing data
    Object.keys(form).forEach(key => {
      if (key === 'image') {
        form.image.url = dish.image.url
        form.image.publicId = dish.image.publicId
        form.image.alt = dish.image.alt
      } else {
        form[key] = dish[key]
      }
    })
    
    loading.value = false
  } catch (err) {
    error.value = 'Error loading dish data: ' + err.message
    loading.value = false
  }
}

onMounted(fetchDish)

const validateForm = () => {
  errors.name = !form.name.trim()
  errors.description = !form.description
  errors.price = !form.price || form.price <= 0
  errors.imageUrl = !form.image.url.trim()
  errors.publicId = !form.image.publicId.trim()
  errors.imageAlt = !form.image.alt.trim()

  return Object.values(errors).some(error => error)
}

const handleSubmit = async () => {
  if (validateForm()) {
    return
  }

  try {
    await axios.put(`/dish/elseDish/${route.params.id}`, form)
    router.push('/admin/dish/show')
  } catch (error) {
    console.error('Error updating dish:', error)
  }
}

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this dish?')) {
    return
  }

  try {
    await axios.delete(`/dish/elseDish/${route.params.id}`)
    router.push('/admin/dish/show')
  } catch (error) {
    console.error('Error deleting dish:', error)
  }
}
</script>