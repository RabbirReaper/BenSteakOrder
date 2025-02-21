<template>
  <header class="text-center mb-4">
    <h1 class="mb-3">{{ storeName }}</h1>
    <div class="btn-group mb-3">
      <button class="btn"
        :class="{ 'btn-primary': modelValue === 'dineIn', 'btn-outline-primary': modelValue !== 'dineIn' }"
        @click="$emit('update:modelValue', 'dineIn')">內用</button>
      <button class="btn"
        :class="{ 'btn-primary': modelValue === 'takeout', 'btn-outline-primary': modelValue !== 'takeout' }"
        @click="$emit('update:modelValue', 'takeout')">外帶</button>
    </div>
    <div v-if="modelValue === 'dineIn'" class="mb-3">
      <div class="input-group justify-content-center" style="width: 200px; margin: 0 auto;">
        <span class="input-group-text">桌號</span>
        <input class="form-control" :value="tableNumber" @input="$emit('update:tableNumber', $event.target.value)" 
          type="text" placeholder="請輸入桌號" />
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  storeName: String,
  modelValue: String,
  tableNumber: String
});
defineEmits(['update:modelValue', 'update:tableNumber']);
</script>