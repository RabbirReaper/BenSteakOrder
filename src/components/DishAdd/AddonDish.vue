<template>
  <BaseDishForm
    form-title="Add-on"
    api-endpoint="addon"
    :requires-image="false"
    :requires-description="false"
    :is-edit="false"
  />
</template>

<script setup>
import BaseDishForm from './BaseDishForm.vue';
</script>