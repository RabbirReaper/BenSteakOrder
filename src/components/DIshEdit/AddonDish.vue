<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error" class="alert alert-danger">
    {{ error }}
  </div>
  <template v-else>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Edit Add-on: {{ form.name }}</h2>
      <button class="btn btn-danger" @click="handleDelete">Delete Add-on</button>
    </div>

    <form class="needs-validation" @submit.prevent="handleSubmit" novalidate>
      <div class="mb-3">
        <label for="name" class="form-label">Add-on Name</label>
        <input type="text" class="form-control" :class="{ 'is-invalid': errors.name }" id="name" v-model="form.name"
          required>
        <div class="invalid-feedback">
          Please enter an add-on name.
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

      <div class="d-flex gap-2">
        <button class="btn btn-primary flex-grow-1" type="submit">Update Add-on</button>
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

const form = reactive({
  name: '',
  price: 0
})

const errors = reactive({
  name: false,
  price: false
})

const fetchAddon = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dish/addon/${route.params.id}`)
    const addon = response.data
    Object.keys(form).forEach(key => {
      form[key] = addon[key]
    })
    loading.value = false
  } catch (err) {
    error.value = 'Error loading add-on data: ' + err.message
    loading.value = false
  }
}

onMounted(fetchAddon)

const validateForm = () => {
  errors.name = !form.name.trim()
  errors.price = !form.price || form.price <= 0
  return Object.values(errors).some(error => error)
}

const handleSubmit = async () => {
  if (validateForm()) {
    return
  }

  try {
    await axios.put(`${API_BASE_URL}/dish/addon/${route.params.id}`, form)
    router.push('/admin/dish/show')
  } catch (error) {
    console.error('Error updating add-on:', error)
  }
}

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this add-on?')) {
    return
  }

  try {
    await axios.delete(`${API_BASE_URL}/dish/addon/${route.params.id}`)
    router.push('/admin/dish/show')
  } catch (error) {
    console.error('Error deleting add-on:', error)
  }
}
</script>