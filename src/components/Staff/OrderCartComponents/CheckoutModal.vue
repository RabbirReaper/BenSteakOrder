<template>
  <div class="custom-modal-container">
    <div class="custom-modal-overlay" @click="$emit('close')"></div>
    <div class="custom-modal-dialog">
      <div class="custom-modal-content">
        <div class="custom-modal-header">
          <h5 class="custom-modal-title">選擇付款方式</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="custom-modal-body text-center">
          <div class="mb-4">
            <h3>應付金額：${{ total }}</h3>
          </div>
          <div class="row g-3">
            <div class="col-6">
              <button class="btn btn-primary btn-lg w-100 py-4" @click="$emit('onlinePayment')">
                <i class="bi bi-credit-card fs-1 d-block mb-2"></i>
                線上付款
              </button>
            </div>
            <div class="col-6">
              <button class="btn btn-success btn-lg w-100 py-4" @click="$emit('cashPayment')">
                <i class="bi bi-cash-stack fs-1 d-block mb-2"></i>
                現場付款
              </button>
            </div>
          </div>
        </div>
        <div class="custom-modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  total: {
    type: Number,
    required: true
  }
});

defineEmits(['close', 'onlinePayment', 'cashPayment']);
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
  width: 600px;
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
  padding: 1.5rem;
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

.btn-lg {
  transition: all 0.3s;
}

.btn-lg:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
</style>