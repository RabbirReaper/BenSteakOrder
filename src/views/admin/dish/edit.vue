<script setup>
import { onMounted, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainDishEdit from '@/views/admin/dish/components/MainDish.vue';
import ElseDishEdit from '@/views/admin/dish/components/ElseDish.vue';
import AddonDishEdit from '@/views/admin/dish/components/AddonDish.vue';
import RawMeatEdit from '@/views/admin/dish/components/RawMeat.vue';

const route = useRoute();
const router = useRouter();
const { type, id } = route.params;

const componentsMap = {
  mainDish: MainDishEdit,
  elseDish: ElseDishEdit,
  addon: AddonDishEdit,
  rawMeat: RawMeatEdit
};

const currentComponent = shallowRef(null);

onMounted(() => {
  if (componentsMap[type]) {
    currentComponent.value = componentsMap[type];
  } else {
    router.replace('/not-found'); // 無效 type 直接跳轉
  }
});
</script>

<template>
  <div class="col-12 col-md-6 offset-md-3 px-2 px-md-0">
    <component v-if="currentComponent" :is="currentComponent" />
  </div>
</template>