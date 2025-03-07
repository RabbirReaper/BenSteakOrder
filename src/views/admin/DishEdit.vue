<script setup>
import { onMounted, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainDishEdit from '@/components/DishEdit/MainDish.vue';
import ElseDishEdit from '@/components/DishEdit/ElseDish.vue';
import AddonDishEdit from '@/components/DishEdit/AddonDish.vue';
import RawMeatEdit from '@/components/DishEdit/RawMeat.vue';

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