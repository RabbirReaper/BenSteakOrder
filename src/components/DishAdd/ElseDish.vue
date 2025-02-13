<template>
    <form class="needs-validation" @submit.prevent="handleSubmit" novalidate>
        <div class="mb-3">
            <label for="name" class="form-label">Side Dish Name</label>
            <input type="text" class="form-control" :class="{ 'is-invalid': errors.name }" id="name" v-model="form.name"
                required>
            <div class="invalid-feedback">
                Please enter a side dish name.
            </div>
        </div>

        <!-- New Image Fields -->
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

        <button class="btn btn-primary w-100" type="submit">Add Side Dish</button>
    </form>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

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
        await axios.post("/elseDish", form)
        router.push('/dishes')
    } catch (error) {
        console.error('Error adding side dish:', error)
    }
}
</script>