<template>
  <div class="row g-2 g-md-3">
    <h1 class="text-center fs-1 px-2">Add New Dish</h1>

    <div class="col-12 col-md-6 offset-md-3 px-2 px-md-0">
      <div class="btn-group w-100 mb-4" role="group">
        <input type="radio" class="btn-check" name="dishType" id="mainDish" v-model="currentView" value="main"
          checked>
        <label class="btn btn-outline-primary" for="mainDish">Main Dish</label>

        <input type="radio" class="btn-check" name="dishType" id="elseDish" v-model="currentView" value="else">
        <label class="btn btn-outline-primary" for="elseDish">Else Dish</label>

        <input type="radio" class="btn-check" name="dishType" id="addonDish" v-model="currentView" value="addon">
        <label class="btn btn-outline-primary" for="addonDish">Add-on</label>

        <input type="radio" class="btn-check" name="dishType" id="rawMeat" v-model="currentView" value="raw">
        <label for="rawMeat" class="btn btn-outline-primary"> Raw Meat</label>
      </div>

      <component :is="currentComponent"></component>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MainDishAdd from '@/views/admin/dish/components/MainDish.vue'
import ElseDishAdd from '@/views/admin/dish/components/ElseDish.vue'
import AddonDishAdd from '@/views/admin/dish/components/AddonDish.vue'
import RawMeatAdd from '@/views/admin/dish/components/RawMeat.vue'

const currentView = ref('main')

const currentComponent = computed(() => {
  switch (currentView.value) {
    case 'main':
      return MainDishAdd
    case 'else':
      return ElseDishAdd
    case 'addon':
      return AddonDishAdd
    case 'raw':
      return RawMeatAdd
    default:
      return MainDishAdd
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