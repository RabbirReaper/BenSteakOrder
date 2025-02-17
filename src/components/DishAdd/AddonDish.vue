<template>
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

		<button class="btn btn-primary w-100" type="submit">Add Add-on Item</button>
	</form>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const form = reactive({
	name: '',
	price: 0
})

const errors = reactive({
	name: false,
	price: false
})

const validateForm = () => {
	errors.name = !form.name.trim()
	errors.price = !form.price || form.price <= 0

	return !Object.values(errors).some(error => error)
}

const handleSubmit = async () => {
	if (!validateForm()) {
		return
	}

	try {
		await axios.post(`${API_BASE_URL}/dish/addon`, form)
		router.push('/admin/dish/show')
	} catch (error) {
		console.error('Error adding add-on item:', error)
	}
}
</script>