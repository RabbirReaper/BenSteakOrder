<template>
  <BaseDishForm
    form-title="Else Dish"
    api-endpoint="elseDish"
    :requires-image="true"
    :requires-description="true"
    :is-edit="false"
  />
</template>

<script setup>
import BaseDishForm from './BaseDishForm.vue';
</script>