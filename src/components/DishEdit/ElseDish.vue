<template>
  <BaseDishEdit
    :id="id"
    form-title="Else Dish"
    api-endpoint="elseDish"
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