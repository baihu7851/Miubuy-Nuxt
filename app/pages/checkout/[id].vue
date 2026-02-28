<script lang="ts" setup>
// NOTE: 此檔案請重新命名為 [id].vue，Nuxt 動態路由需方括號檔名
// 路由：/checkout/:id

import Swal from 'sweetalert2';

// =============================================
// checkout/[id].vue — 結帳頁
// 買家填寫收件資料 + 付款取貨方式後送出
// =============================================

definePageMeta({ middleware: 'auth' });

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const { token } = useAuth();

const orderId = computed(() => Number(route.params.id));
const isLoading = ref(true);

// ── 表單 ─────────────────────────────────────
const form = reactive({
  Name: '',
  Phone: '',
  Address: '',
  Email: '',
  Payment: '2', // 1=平台付款, 2=銀行轉帳
  Pickup: '1', // 1=面交, 2=宅配
  Remark: '',
});

const isSubmitting = ref(false);

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 1500);
});

/** PUT /api/Orders/:id 送出結帳資料 */
const putOrder = async (): Promise<void> => {
  isSubmitting.value = true;
  try {
    await $fetch(`${config.public.apiBase}/api/Orders/${orderId.value}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: form,
    });
    await Swal.fire({
      position: 'center',
      icon: 'success',
      title: '✨訂單送出成功( ´∀｀)✨',
      showConfirmButton: false,
      timer: 2500,
    });
    router.push('/mypage/buyer');
  } catch (err) {
    console.error('送出訂單失敗', err);
    Swal.fire({
      position: 'center',
      icon: 'error',
      title: '訂單送出失敗，請再試一次 (´・ω・｀)',
      showConfirmButton: false,
      timer: 2500,
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <!-- 結帳頁 -->
  <div>
    <div class="checkout-container">
      <!-- 裝飾花朵 -->
      <img src="/image/flower.png" alt="" class="flower01" />
      <img src="/image/flower.png" alt="" class="flower02" />
      <img src="/image/flower.png" alt="" class="flower03" />

      <!-- 標題 -->
      <h2 class="checkout-title">
        <img src="/image/catHead.png" alt="" width="35px" />
        <span>結帳 checkout</span>
        <img src="/image/star002.png" alt="" width="35px" />
      </h2>

      <div class="checkout-form">
        <!--☆=== 左：收件人資料 ===☆-->
        <div class="left-block">
          <h2 class="receiver-detail">
            <img src="/image/ribon002.png" alt="" width="50px" />
            <span>收件人資料</span>
          </h2>
          <div class="receive-content">
            <div class="checkout-name-group">
              <label for="co-name" class="receiver-name">姓名</label>
              <input id="co-name" v-model="form.Name" type="text" />
            </div>
            <div class="checkout-phone-group">
              <label for="co-phone">手機</label>
              <input id="co-phone" v-model="form.Phone" type="text" />
            </div>
            <div class="checkout-address-group">
              <label for="co-address">地址</label>
              <input
                id="co-address"
                v-model="form.Address"
                type="text"
                class="checkout-address"
              />
            </div>
            <div class="checkout-mail-group">
              <label for="co-email">信箱</label>
              <input
                id="co-email"
                v-model="form.Email"
                type="email"
                class="checkout-email"
              />
            </div>
          </div>
        </div>

        <div class="center-line" />

        <!--☆=== 右：付款及取貨 ===☆-->
        <div class="right-block">
          <h2 class="pay-and-deliver">
            <img src="/image/ribon002.png" alt="" width="50px" />
            <span>付款及取貨</span>
          </h2>
          <div class="delive-content">
            <!--☆ 付款方式 ☆-->
            <label class="payment-detail">付款方式</label>
            <div class="pay-select-group">
              <select v-model="form.Payment">
                <option value="1">平台付款</option>
                <option value="2">銀行轉帳</option>
              </select>
            </div>

            <div class="section-divider" />

            <!--☆ 取貨方式 ☆-->
            <label class="deliver-detail">取貨方式</label>
            <div class="delivery">
              <select v-model="form.Pickup">
                <option value="1">面交</option>
                <option value="2">宅配</option>
              </select>
            </div>

            <!--☆ 備註 ☆-->
            <div class="memo">
              <label>備註</label>
              <textarea
                v-model="form.Remark"
                class="memo-area"
                placeholder="★( ^ω^ )★"
              />
            </div>
          </div>
        </div>

        <!-- 送出按鈕 -->
        <div
          class="checkout-btn"
          :class="{ 'checkout-btn--disabled': isSubmitting }"
          @click="putOrder"
        >
          <img src="/image/order-BTN.png" alt="送出訂單" width="130px" />
        </div>
      </div>
    </div>

    <CommonLoadingSpinner v-if="isLoading" />
  </div>
</template>

<style lang="scss">
body {
  background-image: url('/image/chat-bgc.png');
  background-size: cover;
}
</style>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}

// ── 容器 ─────────────────────────────────────
.checkout-container {
  max-width: 920px;
  margin: 30px auto;
  background-color: #fff;
  padding: 10px 10px 20px;
  border-radius: 8px;
  position: relative;
}

// ── 標題 ─────────────────────────────────────
.checkout-title {
  margin-top: 10px;
  font-size: 28px;
  font-family: myfont, japanese-font, serif;
  color: darken($color-brown, 10%);
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    margin: 0 8px;
  }
}

// ── 表單外框 ─────────────────────────────────
.checkout-form {
  display: flex;
  justify-content: center;
  margin-right: 20px;
  padding: 20px;
}

.left-block {
  margin-right: 100px;
}
.right-block {
  margin-left: 0;
}

// ── 收件人 / 付款區塊 ─────────────────────────
.receive-content,
.delive-content {
  display: flex;
  flex-direction: column;
  margin-left: 30px;
  margin-bottom: 20px;
  font-family: myfont, japanese-font, serif;

  label {
    color: $color-brown;
    margin-bottom: 5px;
    font-size: 20px;
  }

  input,
  select {
    height: 30px;
    width: 100%;
    margin-left: 5px;
    margin-bottom: 15px;
    border-radius: 10px;
    border: 2px solid lighten($color-brown, 10%);
    color: lighten($color-brown, 10%);
    padding-left: 8px;
    font-family: myfont, japanese-font, serif;
    font-size: 20px;
  }

  .checkout-address,
  .checkout-email {
    width: 140%;
  }

  select {
    width: 70%;
  }
}

.receiver-detail,
.pay-and-deliver {
  display: flex;
  align-items: center;
  padding: 10px;
  font-family: myfont, japanese-font, serif;

  span {
    margin-left: 10px;
    font-size: 26px;
    color: darken($color-brown, 2%);
  }
}

.memo-area {
  margin-left: 5px;
  color: $color-brown;
  font-size: 20px;
  padding: 8px;
  border: 2px solid lighten($color-brown, 10%);
  border-radius: 8px;
  resize: none;
  white-space: pre-wrap;
  width: 100%;
  height: 105px;

  &:focus {
    outline: none;
  }
  &::placeholder {
    color: $color-header;
  }
}

.section-divider {
  width: 100%;
  height: 1px;
  background-color: rgb(219, 216, 212);
  margin: 8px 0 16px;
}

// ── 中間分隔線 ────────────────────────────────
.center-line {
  margin: 70px 15px 0 20px;
  width: 1px;
  height: 250px;
  background-color: rgb(219, 216, 212);
}

// ── 送出按鈕 ─────────────────────────────────
.checkout-btn {
  position: absolute;
  bottom: -3px;
  right: 5px;
  cursor: pointer;

  &:hover {
    transform: translateX(-5px);
  }

  &--disabled {
    opacity: 0.6;
    pointer-events: none;
  }
}

// ── 裝飾花朵動畫 ─────────────────────────────
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.flower01 {
  position: absolute;
  width: 30px;
  opacity: 0.9;
  left: 70px;
  top: 25px;
  animation: spin 10s linear infinite;
}
.flower02 {
  position: absolute;
  width: 40px;
  opacity: 0.9;
  top: 150px;
  right: 50px;
  animation: spin 10s linear infinite;
}
.flower03 {
  position: absolute;
  width: 35px;
  opacity: 0.9;
  bottom: 30px;
  left: 10px;
  animation: spin 10s linear infinite;
}
</style>
