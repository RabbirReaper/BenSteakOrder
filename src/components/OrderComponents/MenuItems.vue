<template>
  <div class="menu-items mb-5" v-if="categories">
    <div v-for="category in categories" :key="category.categoryName">
      <div v-if="activeCategory === category.categoryName || activeCategory === 'all'">
        <h2 class="mb-3">{{ category.categoryName }}</h2>
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          <div v-for="item in getItemsInCategory(category)" :key="item._id" class="col">
            <div class="card h-100 shadow-sm" @click="$emit('select-item', item)">
              <div class="card-img-top" style="aspect-ratio: 1/1; overflow: hidden;">
                <img :src="item.image?.url || '/placeholder.jpg'" :alt="item.name" class="w-100 h-100"
                  style="object-fit: cover;">
              </div>
              <div class="card-body">
                <h5 class="card-title">{{ item.name }}</h5>
                <p class="card-text text-danger fw-bold">${{ item.price }}</p>
                <p v-if="item.availableAsAddOn" class="card-text text-muted">
                  加點價: ${{ item.addOnPrice }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  categories: Array,
  menuItems: Array,
  activeCategory: String
});

defineEmits(['select-item']);

const getItemsInCategory = (category) => {
  return props.menuItems.filter(item => {
    return category.items.some(catItem => catItem.itemId === item._id);
  }).sort((a, b) => {
    const aOrder = category.items.find(item => item.itemId === a._id)?.order || 0;
    const bOrder = category.items.find(item => item.itemId === b._id)?.order || 0;
    return aOrder - bOrder;
  });
};
</script>