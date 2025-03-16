<template>
  <BaseDishEdit
    form-title="Add-on"
    api-endpoint="addon"
    :requires-image="false"
    :requires-description="false"
  />
</template>

<script setup>
import BaseDishEdit from './BaseDishEdit.vue';
</script>