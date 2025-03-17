<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>餐點列表</h1>
      <router-link to="./add" class="btn btn-primary">
        新增餐點
      </router-link>
    </div>
    <div class="row mb-4">
      <div class="col">
        <div class="btn-group w-100" role="group">
          <input type="radio" class="btn-check" name="dishType" id="mainDish" v-model="currentView" value="main"
            checked>
          <label class="btn btn-outline-primary" for="mainDish">Main Dishes</label>

          <input type="radio" class="btn-check" name="dishType" id="elseDish" v-model="currentView" value="else">
          <label class="btn btn-outline-primary" for="elseDish">Else Dishes</label>

          <input type="radio" class="btn-check" name="dishType" id="addonDish" v-model="currentView" value="addon">
          <label class="btn btn-outline-primary" for="addonDish">Add-ons</label>

          <input type="radio" class="btn-check" name="dishType" id="rawMeat" v-model="currentView" value="raw">
          <label class="btn btn-outline-primary" for="rawMeat">Raw Meat</label>
        </div>
      </div>
    </div>

    <!-- Cards Grid -->
    <div class="row row-cols-1 row-cols-md-3 g-4">
      <div v-for="dish in dishes" :key="dish._id" class="col">
        <div class="card h-100">
          <img v-if="dish.image?.url" :src="dish.image.url" :alt="dish.image.alt" class="card-img-top"
            style="height: 200px; object-fit: cover;">
          <div class="card-body">
            <h5 class="card-title">{{ dish.name }}</h5>
            <p class="card-text">${{ dish.price }}</p>
            <button class="btn btn-primary" @click="showDetails(dish)">View Details</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="dishes.length === 0" class="col-12">
        <div class="text-center py-5 text-muted">
          <p>目前沒有餐點</p>
        </div>
      </div>

    <!-- Details Modal -->
    <div class="modal fade" id="dishModal" tabindex="-1" ref="modal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedDish?.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedDish">
              <!-- Main Dish Details -->
              <div v-if="currentView === 'main'">
                <p><strong>Category:</strong> {{ selectedDish.category }}</p>
                <p><strong>Price:</strong> ${{ selectedDish.price }}</p>
                <p v-if="selectedDish.description"><strong>Description:</strong> {{
                  selectedDish.description }}</p>

                <div v-if="selectedDish.sauceOptions?.length">
                  <strong>Sauce Options:</strong>
                  <ul>
                    <li v-for="sauce in selectedDish.sauceOptions" :key="sauce">{{ sauce }}</li>
                  </ul>
                </div>

                <div v-if="selectedDish.category == 'Steak' && selectedDish.steakDoneness?.length">
                  <strong>Doneness Options:</strong>
                  <ul>
                    <li v-for="doneness in selectedDish.steakDoneness" :key="doneness">{{ doneness
                    }}</li>
                  </ul>
                </div>

                <div v-if="selectedDish.extraOptions?.length">
                  <strong>Extra Options:</strong>
                  <ul>
                    <li v-for="option in selectedDish.extraOptions" :key="option">{{ option }}</li>
                  </ul>
                </div>

                <p v-if="selectedDish.extraPrice"><strong>Extra Price:</strong> ${{
                  selectedDish.extraPrice }}</p>
              </div>

              <!-- Else Dish Details -->
              <div v-if="currentView === 'else'">
                <p><strong>Price:</strong> ${{ selectedDish.price }}</p>
                <p v-if="selectedDish.description"><strong>Description:</strong> {{
                  selectedDish.description }}</p>
              </div>

              <!-- Add-on Details -->
              <div v-if="currentView === 'addon'">
                <p><strong>Price:</strong> ${{ selectedDish.price }}</p>
              </div>

              <!-- Raw Meat Details -->
              <div v-if="currentView === 'raw'">
                <p><strong>Price:</strong> ${{ selectedDish.price }}</p>
                <p><strong>Description:</strong> {{ selectedDish.description }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="editDish">Edit</button>
            <button type="button" class="btn btn-danger" @click="deleteDish">Delete</button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { Modal } from 'bootstrap'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const currentView = ref('main')
const dishes = ref([])
const selectedDish = ref(null)
const modal = ref(null)

const endpoints = {
  main: 'mainDish',
  else: 'elseDish',
  addon: 'addon',
  raw: 'rawMeat'
}

const fetchDishes = async () => {
  try {
    const response = await api.dish.getAll(endpoints[currentView.value]);
    dishes.value = response.data
  } catch (error) {
    console.error('Error fetching dishes:', error)
  }
}

const showDetails = (dish) => {
  selectedDish.value = dish
  if (modal.value) {
    new Modal(modal.value).show()
  }
}

const editDish = () => {
  if (selectedDish.value) {
    router.push(`/admin/dish${endpoints[currentView.value]}/${selectedDish.value._id}`)
  }
}

const deleteDish = async () => {
  if (!selectedDish.value || !confirm('Are you sure you want to delete this dish?')) {
    return
  }

  try {
    await api.dish.delete(endpoints[currentView.value], selectedDish.value._id);
    await fetchDishes()
    if (modal.value) {
      Modal.getInstance(modal.value).hide()
    }
  } catch (error) {
    console.error('Error deleting dish:', error)
  }
}

watch(currentView, fetchDishes)

// Initial fetch
onMounted(() => {
  fetchDishes()
})

onBeforeUnmount(() => {
  // 1. 先嘗試正常隱藏模態框
  if (modal.value) {
    const modalInstance = Modal.getInstance(modal.value);
    if (modalInstance) {
      modalInstance.hide();
    }
  }

  // 2. 強制清理背景遮罩
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.remove();
  }

  // 3. 重置 body 樣式
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
});
</script>