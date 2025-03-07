<template>
  <BaseDishForm
    formTitle="Add-on"
    apiEndpoint="addon"
    :requires-image="false"
    :requires-description="false"
    :is-edit="false"
  />
</template>

<script setup>
import BaseDishForm from './BaseDishForm.vue';
</script>