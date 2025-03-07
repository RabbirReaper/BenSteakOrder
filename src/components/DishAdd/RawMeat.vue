<template>
  <BaseDishForm
    formTitle="Raw Meat"
    apiEndpoint="rawMeat"
    :requires-image="true"
    :requires-description="true"
    :is-edit="false"
  />
</template>

<script setup>
import BaseDishForm from './BaseDishForm.vue';
</script>