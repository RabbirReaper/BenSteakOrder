<template>
  <BaseDishForm
    form-title="Main Dish"
    api-endpoint="mainDish"
    :requires-image="true"
    :requires-description="true"
    :is-edit="false"
  />
</template>

<script setup>
import BaseDishForm from './BaseDishForm.vue';
</script>