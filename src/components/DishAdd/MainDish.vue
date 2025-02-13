<template>
    <form class="needs-validation" @submit.prevent="handleSubmit" novalidate>
        <!-- 牛排或非牛排選擇 -->
        <div class="mb-3">
            <label class="form-label">Category</label>
            <div class="d-flex gap-3">
                <div class="form-check">
                    <input class="form-check-input" type="radio" id="steak" value="Steak" v-model="form.category"
                        required>
                    <label class="form-check-label" for="steak">Steak</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" id="nonSteak" value="Non-Steak" v-model="form.category"
                        required>
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

        <!-- 餐點圖片 -->
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
                <input type="text" class="form-control" v-model="newDoneness" placeholder="Add steak doneness" min="1">
                <button type="button" class="btn btn-outline-primary" @click="addDoneness">Add</button>
            </div>
            <div class="d-flex flex-wrap gap-2">
                <span v-for="(doneness, index) in form.steakDoneness" :key="index"
                    class="badge bg-primary d-flex align-items-center">
                    {{ doneness }}
                    <button type="button" class="btn-close btn-close-white ms-2"
                        @click="removeDoneness(index)"></button>
                </span>
            </div>
            <div class="invalid-feedback" v-if="errors.steakDoneness">
                Please add at least one doneness option.
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

        <button class="btn btn-primary w-100" type="submit">Add Main Dish</button>
    </form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

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
    imageUrl: false,
    publicId: false,
    imageAlt: false
})

const newSauce = ref('')
const newExtra = ref('')
const newDoneness = ref('')


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
    errors.imageUrl = !form.image.url.trim()
    errors.publicId = !form.image.publicId.trim()
    errors.imageAlt = !form.image.alt.trim()

    if (form.category === 'Steak') {
        errors.steakDoneness = form.steakDoneness.length === 0
    }

    return Object.values(errors).some(error => error)
}

const handleSubmit = async () => {
    if (validateForm()) {
        console.log('Invalid form')
        return
    }

    try {
        await axios.post("/mainDish", form)
        router.push('/dishes')
    } catch (error) {
        console.error('Error adding main dish:', error)
    }
}
</script>