<template>
  <div class="row mb-4" v-if="categories">
    <div class="col-12 d-flex overflow-auto pb-2">
      <button v-for="category in categories" :key="category.categoryName"
        :class="{ 'btn-primary': modelValue === category.categoryName, 'btn-outline-primary': modelValue !== category.categoryName }"
        class="btn mx-1 flex-shrink-0" @click="$emit('update:modelValue', category.categoryName)">
        {{ category.categoryName }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  categories: Array,
  modelValue: String
});
defineEmits(['update:modelValue']);
</script>