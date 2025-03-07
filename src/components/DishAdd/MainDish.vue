<template>
  <BaseDishForm
    formTitle="Main Dish"
    apiEndpoint="mainDish"
    :requires-image="true"
    :requires-description="true"
    :is-edit="false"
  >
    <template #additional-fields>
      <!-- 牛排或非牛排選擇 -->
      <div class="mb-3">
        <label class="form-label">Category</label>
        <div class="d-flex gap-3">
          <div class="form-check">
            <input class="form-check-input" type="radio" id="steak" value="Steak" v-model="form.category" required>
            <label class="form-check-label" for="steak">Steak</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" id="nonSteak" value="Non-Steak" v-model="form.category" required>
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
          <button type="button" class="btn btn-outline-primary" @click="addSauce">Add</button>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="(sauce, index) in form.sauceOptions" :key="index"
            class="badge bg-primary d-flex align-items-center">
            {{ sauce }}
            <button type="button" class="btn-close btn-close-white ms-2" @click="removeSauce(index)"></button>
          </span>
        </div>
      </div>

      <!-- 牛排熟度選項 -->
      <div class="mb-3" v-if="form.category === 'Steak'">
        <label class="form-label">Steak Doneness Options</label>
        <div class="d-flex gap-2 mb-2">
          <input type="text" class="form-control" v-model="newDoneness" placeholder="Add steak doneness">
          <button type="button" class="btn btn-outline-primary" @click="addDoneness">Add</button>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="(doneness, index) in form.steakDoneness" :key="index"
            class="badge bg-primary d-flex align-items-center">
            {{ doneness }}
            <button type="button" class="btn-close btn-close-white ms-2" @click="removeDoneness(index)"></button>
          </span>
        </div>
      </div>

      <!-- 額外選項 -->
      <div class="mb-3">
        <label class="form-label">Extra Options</label>
        <div class="d-flex gap-2 mb-2">
          <input type="text" class="form-control" v-model="newExtra" placeholder="Add new option">
          <button type="button" class="btn btn-outline-primary" @click="addExtra">Add</button>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="(option, index) in form.extraOptions" :key="index"
            class="badge bg-primary d-flex align-items-center">
            {{ option }}
            <button type="button" class="btn-close btn-close-white ms-2" @click="removeExtra(index)"></button>
          </span>
        </div>
      </div>

      <!-- 加點價格 -->
      <div class="mb-3">
        <label for="extraPrice" class="form-label">Extra Price (如果為0代表不開放加點)</label>
        <div class="input-group">
          <span class="input-group-text">$</span>
          <input type="number" class="form-control" :class="{ 'is-invalid': errors.extraPrice }" id="extraPrice"
            v-model.number="form.extraPrice" min="0" step="1">
          <div class="invalid-feedback">
            Extra price cannot be negative.
          </div>
        </div>
      </div>
    </template>
  </BaseDishForm>
</template>

<script setup>
import { ref, reactive } from 'vue';
import BaseDishForm from './BaseDishForm.vue';

const defaultSauceOptions = ['蘑菇醬', '綜合醬', '黑胡椒醬'];
const defaultExtraOptions = ['麵換蛋', '麵換花椰菜', '加麵', '不要麵包'];
const defaultSteakDoneness = ['5分熟', '7分熟', '9分熟'];

const form = reactive({
  category: 'Steak',
  sauceOptions: [...defaultSauceOptions],
  extraPrice: 0,
  extraOptions: [...defaultExtraOptions],
  steakDoneness: [...defaultSteakDoneness]
});

const errors = reactive({
  category: false,
  extraPrice: false,
  steakDoneness: false,
});

const newSauce = ref('');
const newExtra = ref('');
const newDoneness = ref('');

const addSauce = () => {
  if (newSauce.value.trim()) {
    form.sauceOptions.push(newSauce.value.trim());
    newSauce.value = '';
  }
};

const removeSauce = (index) => {
  form.sauceOptions.splice(index, 1);
};

const addDoneness = () => {
  if (newDoneness.value.trim()) {
    form.steakDoneness.push(newDoneness.value.trim());
    newDoneness.value = '';
  }
};

const removeDoneness = (index) => {
  form.steakDoneness.splice(index, 1);
};

const addExtra = () => {
  if (newExtra.value.trim()) {
    form.extraOptions.push(newExtra.value.trim());
    newExtra.value = '';
  }
};

const removeExtra = (index) => {
  form.extraOptions.splice(index, 1);
};
</script>