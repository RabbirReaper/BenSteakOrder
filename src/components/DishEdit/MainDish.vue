<template>
  <BaseDishEdit
    :id="id"
    form-title="Main Dish"
    api-endpoint="mainDish"
    :requires-image="true"
    :requires-description="true"
  >
    <template #additional-fields="{ formData, errors }">
      <!-- 牛排或非牛排選擇 -->
      <div class="mb-3">
        <label class="form-label">Category</label>
        <div class="d-flex gap-3">
          <div class="form-check">
            <input class="form-check-input" type="radio" id="steak" value="Steak" v-model="formData.category" required>
            <label class="form-check-label" for="steak">Steak</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" id="nonSteak" value="Non-Steak" v-model="formData.category"
              required>
            <label class="form-check-label" for="nonSteak">Non-Steak</label>
          </div>
        </div>
        <div class="invalid-feedback" v-if="errors.category">
          Please select a category.
        </div>
      </div>

      <!-- 醬料選項 -->
      <div class="mb-3">
        <label class="form-label">Sauce Options</label>
        <div class="d-flex gap-2 mb-2">
          <input type="text" class="form-control" v-model="newSauce" placeholder="Add new sauce">
          <button type="button" class="btn btn-outline-primary" @click="addSauce(formData)">Add</button>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="(sauce, index) in formData.sauceOptions" :key="index"
            class="badge bg-primary d-flex align-items-center">
            {{ sauce }}
            <button type="button" class="btn-close btn-close-white ms-2" @click="removeSauce(formData, index)"></button>
          </span>
        </div>
      </div>

      <!-- 牛排熟度選項 -->
      <div class="mb-3" v-if="formData.category === 'Steak'">
        <label class="form-label">Steak Doneness Options</label>
        <div class="d-flex gap-2 mb-2">
          <input type="text" class="form-control" v-model="newDoneness" placeholder="Add steak doneness">
          <button type="button" class="btn btn-outline-primary" @click="addDoneness(formData)">Add</button>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="(doneness, index) in formData.steakDoneness" :key="index"
            class="badge bg-primary d-flex align-items-center">
            {{ doneness }}
            <button type="button" class="btn-close btn-close-white ms-2" @click="removeDoneness(formData, index)"></button>
          </span>
        </div>
        <div class="invalid-feedback" v-if="errors.steakDoneness">
          Please add at least one doneness option.
        </div>
      </div>

      <!-- 額外選項 -->
      <div class="mb-3">
        <label class="form-label">Extra Options</label>
        <div class="d-flex gap-2 mb-2">
          <input type="text" class="form-control" v-model="newExtra" placeholder="Add new option">
          <button type="button" class="btn btn-outline-primary" @click="addExtra(formData)">Add</button>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="(option, index) in formData.extraOptions" :key="index"
            class="badge bg-primary d-flex align-items-center">
            {{ option }}
            <button type="button" class="btn-close btn-close-white ms-2" @click="removeExtra(formData, index)"></button>
          </span>
        </div>
      </div>

      <!-- 加點價格 -->
      <div class="mb-3">
        <label for="extraPrice" class="form-label">Extra Price (如果為0代表不開放加點)</label>
        <div class="input-group">
          <span class="input-group-text">$</span>
          <input type="number" class="form-control" :class="{ 'is-invalid': errors.extraPrice }" id="extraPrice"
            v-model.number="formData.extraPrice" min="0" step="1">
          <div class="invalid-feedback">
            Extra price cannot be negative.
          </div>
        </div>
      </div>
    </template>
  </BaseDishEdit>
</template>

<script setup>
import { ref } from 'vue';
import BaseDishEdit from './BaseDishEdit.vue';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const newSauce = ref('');
const newExtra = ref('');
const newDoneness = ref('');

const addSauce = (formData) => {
  if (newSauce.value.trim()) {
    if (!formData.sauceOptions) formData.sauceOptions = [];
    formData.sauceOptions.push(newSauce.value.trim());
    newSauce.value = '';
  }
};

const removeSauce = (formData, index) => {
  formData.sauceOptions.splice(index, 1);
};

const addDoneness = (formData) => {
  if (newDoneness.value.trim()) {
    if (!formData.steakDoneness) formData.steakDoneness = [];
    formData.steakDoneness.push(newDoneness.value.trim());
    newDoneness.value = '';
  }
};

const removeDoneness = (formData, index) => {
  formData.steakDoneness.splice(index, 1);
};

const addExtra = (formData) => {
  if (newExtra.value.trim()) {
    if (!formData.extraOptions) formData.extraOptions = [];
    formData.extraOptions.push(newExtra.value.trim());
    newExtra.value = '';
  }
};

const removeExtra = (formData, index) => {
  formData.extraOptions.splice(index, 1);
};
</script>