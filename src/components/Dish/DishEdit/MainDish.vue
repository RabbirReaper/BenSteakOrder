<template>
  <BaseDishEdit
    form-title="Main Dish"
    api-endpoint="mainDish"
    :requires-image="true"
    :requires-description="true"
  />
</template>

<script setup>
import BaseDishEdit from './BaseDishEdit.vue';
</script>