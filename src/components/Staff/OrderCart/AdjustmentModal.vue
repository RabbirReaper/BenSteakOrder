<template>
  <div class="custom-modal-container">
    <div class="custom-modal-overlay" @click="$emit('close')"></div>
    <div class="custom-modal-dialog">
      <div class="custom-modal-content">
        <div class="custom-modal-header">
          <h5 class="custom-modal-title">訂單調帳</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="custom-modal-body">
          <div class="text-center mb-3">
            <h4>{{ adjustmentType === 'add' ? '+' : '-' }}${{ tempAdjustment }}</h4>
          </div>
          <div class="d-flex justify-content-center mb-3">
            <button class="btn btn-success btn-lg me-3" @click="$emit('setAdjustmentType', 'add')">
              <i class="bi bi-plus-lg"></i>
            </button>
            <button class="btn btn-danger btn-lg" @click="$emit('setAdjustmentType', 'subtract')">
              <i class="bi bi-dash-lg"></i>
            </button>
          </div>
          <div class="number-keypad">
            <div class="row g-2">
              <div class="col-4" v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]" :key="num">
                <button class="btn btn-outline-secondary w-100" @click="$emit('appendAdjustment', num)">{{ num }}</button>
              </div>
              <div class="col-4">
                <button class="btn btn-outline-secondary w-100" @click="$emit('appendAdjustment', 0)">0</button>
              </div>
              <div class="col-4">
                <button class="btn btn-outline-secondary w-100" @click="$emit('appendAdjustment', '00')">00</button>
              </div>
              <div class="col-4">
                <button class="btn btn-outline-danger w-100" @click="$emit('clearAdjustment')">清除</button>
              </div>
            </div>
          </div>
        </div>
        <div class="custom-modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">取消</button>
          <button type="button" class="btn btn-primary" @click="$emit('confirm')">確認</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  tempAdjustment: {
    type: Number,
    required: true
  },
  adjustmentType: {
    type: String,
    required: true
  }
});

defineEmits([
  'close', 
  'setAdjustmentType', 
  'appendAdjustment', 
  'clearAdjustment', 
  'confirm'
]);
</script>

<style scoped>
.custom-modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.custom-modal-dialog {
  position: relative;
  width: 500px;
  max-width: 90%;
  z-index: 2;
  margin: 0 auto;
}

.custom-modal-content {
  background-color: #fff;
  border-radius: 0.3rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.custom-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.custom-modal-title {
  margin: 0;
}

.custom-modal-body {
  padding: 1rem;
  overflow-y: auto;
}

.custom-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  gap: 0.5rem;
}

.number-keypad {
  max-width: 300px;
  margin: 0 auto;
}

.number-keypad .btn {
  height: 50px;
  font-size: 1.2rem;
}
</style>