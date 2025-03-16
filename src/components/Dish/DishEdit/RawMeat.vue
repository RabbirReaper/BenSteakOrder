<template>
  <BaseDishEdit
    form-title="Raw Meat"
    api-endpoint="rawMeat"
    :requires-image="true"
    :requires-description="true"
  />
</template>

<script setup>
import BaseDishEdit from './BaseDishEdit.vue';
</script>