<template>
  <div class="modal fade show" tabindex="-1" style="display: block; background-color: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ editingCoupon ? '編輯優惠券' : '新增優惠券' }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <!-- 名稱 -->
            <div class="mb-3">
              <label for="name" class="form-label">名稱</label>
              <input
                type="text"
                class="form-control"
                id="name"
                v-model="form.name"
                required
                placeholder="例如：生日優惠券、新會員優惠"
              />
            </div>

            <!-- 優惠券類型 -->
            <div class="mb-3">
              <label class="form-label">優惠券類型</label>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  name="couponType"
                  id="typeDiscount"
                  value="discount"
                  v-model="form.type"
                  @change="handleTypeChange"
                >
                <label class="form-check-label" for="typeDiscount">
                  折扣金額 (直接扣除固定金額)
                </label>
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  name="couponType"
                  id="typeExchange"
                  value="exchange"
                  v-model="form.type"
                  @change="handleTypeChange"
                >
                <label class="form-check-label" for="typeExchange">
                  商品兌換 (可兌換指定餐點)
                </label>
              </div>
            </div>

            <!-- 折扣金額 (折扣類型) -->
            <div v-if="form.type === 'discount'" class="mb-3">
              <label for="discount" class="form-label">折扣金額</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input
                  type="number"
                  class="form-control"
                  id="discount"
                  v-model.number="form.discount"
                  required
                  min="1"
                  placeholder="100"
                />
              </div>
              <div class="form-text">使用此優惠券可直接折抵指定金額</div>
            </div>

            <!-- 兌換商品 (兌換類型) -->
            <div v-if="form.type === 'exchange'" class="mb-4">
              <label class="form-label">可兌換商品</label>
              <div class="card mb-2">
                <div class="card-body">
                  <div v-if="form.items.length === 0" class="text-center text-muted">
                    尚未選擇任何商品
                  </div>
                  <div v-else>
                    <div v-for="(item, index) in form.items" :key="index" class="mb-2 d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{{ item.name || '未知商品' }}</strong> x {{ item.amount || 1 }}
                      </div>
                      <button type="button" class="btn btn-sm btn-outline-danger" @click="removeItem(index)">
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" class="btn btn-outline-primary" @click="showItemSelector = true">
                <i class="bi bi-plus-circle me-2"></i>新增商品
              </button>

              <!-- 商品選擇器 -->
              <div v-if="showItemSelector" class="mt-3 border p-3 rounded">
                <h6>選擇商品</h6>
                <div class="mb-3">
                  <label class="form-label">商品類型</label>
                  <select class="form-select" v-model="itemSelector.type" @change="fetchItems">
                    <option value="MainDish">主餐</option>
                    <option value="ElseDish">其他餐點</option>
                    <option value="Addon">配料</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">選擇商品</label>
                  <select class="form-select" v-model="itemSelector.item">
                    <option v-for="item in availableItems" :key="item._id" :value="item">
                      {{ item.name }} - ${{ item.price }}
                    </option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">數量</label>
                  <input type="number" class="form-control" v-model.number="itemSelector.amount" min="1" max="10" />
                </div>
                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" @click="showItemSelector = false">取消</button>
                  <button type="button" class="btn btn-primary" @click="addItem" :disabled="!itemSelector.item">確認</button>
                </div>
              </div>
            </div>

            <!-- 有效期間 -->
            <div class="mb-3">
              <label class="form-label">有效期間</label>
              <div class="row">
                <div class="col-md-6">
                  <label for="startAt" class="form-label">開始日期</label>
                  <input type="date" class="form-control" id="startAt" v-model="form.startAt" />
                </div>
                <div class="col-md-6">
                  <label for="expireAt" class="form-label">結束日期</label>
                  <input type="date" class="form-control" id="expireAt" v-model="form.expireAt" />
                </div>
              </div>
              <div class="form-text">不設定則為無限期</div>
            </div>

            <!-- 描述 -->
            <div class="mb-3">
              <label for="description" class="form-label">描述 (選填)</label>
              <textarea
                class="form-control"
                id="description"
                v-model="form.description"
                rows="3"
                placeholder="輸入關於此優惠券的說明"
              ></textarea>
            </div>

            <!-- 啟用設定 -->
            <div class="mb-3 form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="active"
                v-model="form.active"
              />
              <label class="form-check-label" for="active">
                立即啟用此優惠券
              </label>
            </div>

            <!-- 表單按鈕 -->
            <div class="d-flex justify-content-end gap-2">
              <button
                type="button"
                class="btn btn-secondary"
                @click="$emit('close')"
              >
                取消
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="isSubmitting || !isFormValid"
              >
                <span
                  v-if="isSubmitting"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                儲存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, defineProps, defineEmits } from 'vue';
import api from '@/api';

const props = defineProps({
  editingCoupon: Object
});

const emit = defineEmits(['close', 'save']);

// 表單數據
const form = reactive({
  name: '',
  type: 'discount', // 'discount' 或 'exchange'
  discount: 100,
  items: [],
  description: '',
  active: true,
  startAt: '',
  expireAt: ''
});

// 商品選擇器狀態
const showItemSelector = ref(false);
const itemSelector = reactive({
  type: 'MainDish',
  item: null,
  amount: 1
});
const availableItems = ref([]);

// 狀態
const isSubmitting = ref(false);

// 初始化表單
const initForm = () => {
  if (props.editingCoupon) {
    // 編輯模式 - 複製現有優惠券數據
    form.name = props.editingCoupon.name;
    form.type = props.editingCoupon.type;
    form.discount = props.editingCoupon.discount || 0;
    form.items = props.editingCoupon.items ? [...props.editingCoupon.items] : [];
    form.description = props.editingCoupon.description || '';
    form.active = props.editingCoupon.active;
    
    // 處理日期格式
    if (props.editingCoupon.startAt) {
      form.startAt = new Date(props.editingCoupon.startAt).toISOString().split('T')[0];
    } else {
      form.startAt = '';
    }
    
    if (props.editingCoupon.expireAt) {
      form.expireAt = new Date(props.editingCoupon.expireAt).toISOString().split('T')[0];
    } else {
      form.expireAt = '';
    }
  } else {
    // 新增模式 - 使用默認值
    form.name = '';
    form.type = 'discount';
    form.discount = 100;
    form.items = [];
    form.description = '';
    form.active = true;
    form.startAt = '';
    form.expireAt = '';
  }
};

// 處理類型變更
const handleTypeChange = () => {
  if (form.type === 'discount') {
    form.items = [];
  } else {
    form.discount = 0;
  }
};

// 獲取可選商品
const fetchItems = async () => {
  try {
    let endpoint;
    switch (itemSelector.type) {
      case 'MainDish':
        endpoint = 'mainDish';
        break;
      case 'ElseDish':
        endpoint = 'elseDish';
        break;
      case 'Addon':
        endpoint = 'addon';
        break;
      default:
        endpoint = 'mainDish';
    }
    
    const response = await api.dish.getAll(endpoint);
    availableItems.value = response.data;
    itemSelector.item = null;
  } catch (error) {
    console.error('獲取商品失敗:', error);
    availableItems.value = [];
  }
};

// 添加商品到優惠券
const addItem = () => {
  if (!itemSelector.item) return;
  
  form.items.push({
    itemModel: itemSelector.type,
    itemId: itemSelector.item._id,
    name: itemSelector.item.name,
    amount: itemSelector.amount || 1
  });
  
  // 重置選擇器
  itemSelector.item = null;
  itemSelector.amount = 1;
  showItemSelector.value = false;
};

// 從優惠券中移除商品
const removeItem = (index) => {
  form.items.splice(index, 1);
};

// 表單驗證
const isFormValid = computed(() => {
  if (!form.name.trim()) return false;
  
  if (form.type === 'discount') {
    if (!form.discount || form.discount <= 0) return false;
  } else if (form.type === 'exchange') {
    if (form.items.length === 0) return false;
  }
  
  // 如果設定了結束日期，確保它在開始日期之後
  if (form.startAt && form.expireAt) {
    if (new Date(form.expireAt) <= new Date(form.startAt)) return false;
  }
  
  return true;
});

// 提交表單
const handleSubmit = async () => {
  if (!isFormValid.value) return;
  
  try {
    isSubmitting.value = true;
    
    // 處理提交數據
    const couponData = {
      name: form.name,
      type: form.type,
      active: form.active,
      description: form.description
    };
    
    // 根據類型添加不同字段
    if (form.type === 'discount') {
      couponData.discount = form.discount;
    } else {
      couponData.items = form.items;
    }
    
    // 添加日期 (如果有)
    if (form.startAt) {
      couponData.startAt = new Date(form.startAt);
    }
    
    if (form.expireAt) {
      couponData.expireAt = new Date(form.expireAt);
    }
    
    if (props.editingCoupon) {
      // 更新現有優惠券
      await api.coupon.update(props.editingCoupon._id, couponData);
    } else {
      // 創建新優惠券
      await api.coupon.create(couponData);
    }
    
    // 通知父組件保存成功
    emit('save');
    
    // 關閉模態框
    emit('close');
  } catch (error) {
    console.error('保存優惠券失敗:', error);
    alert('保存優惠券失敗，請稍後再試');
  } finally {
    isSubmitting.value = false;
  }
};

// 監聽編輯數據變化
watch(() => props.editingCoupon, () => {
  initForm();
}, { immediate: true });

// 組件掛載時初始化
onMounted(() => {
  initForm();
  fetchItems();
});
</script>