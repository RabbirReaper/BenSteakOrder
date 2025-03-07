<template>
  <BaseDishForm
    formTitle="Else Dish"
    apiEndpoint="elseDish"
    :requires-image="true"
    :requires-description="true"
    :is-edit="false"
  />
</template>

<script setup>
import BaseDishForm from './BaseDishForm.vue';
</script>