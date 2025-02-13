<template>
    <div class="row g-2 g-md-3">
        <h1 class="text-center fs-1 px-2">Add New Dish</h1>

        <div class="col-12 col-md-6 offset-md-3 px-2 px-md-0">
            <div class="btn-group w-100 mb-4" role="group">
                <input type="radio" class="btn-check" name="elseDishType" id="mainDish" v-model="currentView" value="main"
                    checked>
                <label class="btn btn-outline-primary" for="mainDish">Main Dish</label>

                <input type="radio" class="btn-check" name="elseDishType" id="elseDish" v-model="currentView" value="else">
                <label class="btn btn-outline-primary" for="elseDish">Else Dish</label>

                <input type="radio" class="btn-check" name="elseDishType" id="addonDish" v-model="currentView"
                    value="addon">
                <label class="btn btn-outline-primary" for="addonDish">Add-on</label>
            </div>

            <component :is="currentComponent"></component>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MainDish from '@/components/DishAdd/MainDish.vue'
import ElseDish from '@/components/DishAdd/ElseDish.vue'
import AddonDish from '@/components/DishAdd/AddonDish.vue'

const currentView = ref('main')

const currentComponent = computed(() => {
    switch (currentView.value) {
        case 'main':
            return MainDish
        case 'else':
            return ElseDish
        case 'addon':
            return AddonDish
        default:
            return MainDish
    }
})
</script>

<style scoped>
.btn-group {
    border-radius: 0.375rem;
}

.btn-check:checked+.btn {
    font-weight: bold;
}
</style>