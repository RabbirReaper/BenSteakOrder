<template>
  <BaseDishEdit
    :id="id"
    form-title="Raw Meat"
    api-endpoint="rawMeat"
    :requires-image="true"
    :requires-description="true"
  />
</template>

<script setup>
import BaseDishEdit from './BaseDishEdit.vue';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});
</script>