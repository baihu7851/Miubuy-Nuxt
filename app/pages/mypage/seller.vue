<script lang="ts" setup>
// =============================================
// mypage/seller.vue — 賣家訂單紀錄
// =============================================
definePageMeta({ middleware: 'auth' });

interface SellerOrder {
  Id: number;
  RoomName: string;
  RoomPicture: string;
  BuyerNickname: string;
  TotalPrice: number;
  Status: string;
  Payment: string;
  Pickup: string;
  Name: string;
  Phone: string;
  Email: string;
  Address: string;
  Remark: string;
  // ☆ 買家給賣家的評價（BuyerStar/BuyerReviews）
  // ☆ 賣家自己收到的評價，列表欄位顯示用（SellerStar/SellerReviews）
  BuyerStar: string;
  BuyerReviews: string;
  SellerStar: string;
  SellerReviews: string;
  Detail: Array<{ Id: number; Name: string; Price: number }>;
}

const config = useRuntimeConfig();
const { token } = useAuth();

const orders = ref<SellerOrder[]>([]);
const selectedOrder = ref<SellerOrder | null>(null);
const selectedStatus = ref('');
const showModal = ref(false);

const fetchOrders = async () => {
  try {
    orders.value = await $fetch<SellerOrder[]>(
      `${config.public.apiBase}/api/SellerRatings`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
      },
    );
  } catch (err) {
    console.error('取得賣家訂單失敗', err);
  }
};

onMounted(fetchOrders);

const openOrder = (order: SellerOrder) => {
  selectedOrder.value = order;
  selectedStatus.value = order.Status;
  setTimeout(() => {
    showModal.value = true;
  }, 50);
};

const onRefreshed = async () => {
  showModal.value = false;
  await fetchOrders();
};
</script>

<template>
  <div class="mypage-order-content">
    <div class="deco01">
      <img src="/image/deco_cat-ribon.png" alt="" class="deco-cat-ribon" />
    </div>
    <div class="deco02">
      <img src="/image/deco_cat.png" alt="" width="40px" />
    </div>
    <div class="deco03">
      <img src="/image/sellist.png" alt="" class="sellist-icon" />
    </div>

    <ul v-if="orders.length > 0" class="selling-content">
      <li
        v-for="order in orders"
        :key="order.Id"
        class="buying-list-opened"
        @click="openOrder(order)"
      >
        <div class="expand-bar">
          <img src="/image/star002.png" alt="" class="deco001" />
        </div>
        <div class="order-content">
          <div class="order-title">
            <div class="order-photo-link">
              <div
                class="order-photo"
                :style="{ backgroundImage: `url(${order.RoomPicture})` }"
              />
            </div>
            <h3 class="order-name">
              <a>{{ order.RoomName }}</a>
            </h3>
          </div>
          <div class="title-group">
            <h3 class="price">
              <p class="price-title">
                <img
                  src="/image/ribon_icon.png"
                  alt=""
                  width="28px"
                  class="title-deco"
                />金額
              </p>
              <p class="order-price">
                $ <span>{{ order.TotalPrice }}</span>
              </p>
            </h3>
            <h3 class="status">
              <p class="status-title">
                <img
                  src="/image/cat_icon.png"
                  alt=""
                  width="24px"
                  class="title-deco"
                />訂單狀態
              </p>
              <p class="order-status">{{ order.Status }}</p>
            </h3>
            <h3 class="review">
              <p class="review-title">
                <img
                  src="/image/cat_icon.png"
                  alt=""
                  width="28px"
                  class="title-deco"
                />買家評價
              </p>
              <p class="order-review">
                {{ order.SellerStar }}<br /><span>{{
                  order.SellerReviews
                }}</span>
              </p>
            </h3>
          </div>
        </div>
      </li>
    </ul>

    <ul v-else class="buying-content">
      <li class="nodetail"><img src="/image/dodetail-sell.png" alt="" /></li>
    </ul>

    <ModalSellerOrderModal
      v-model:visible="showModal"
      :order-data="selectedOrder"
      :status="selectedStatus"
      @refreshed="onRefreshed"
    />
  </div>
</template>

<style lang="scss" scoped>
.mypage-order-content {
  font-family: myfont, japanese-font, serif;
  color: darken($color-brown, 10%);
  position: relative;
  background-color: $color-brown;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid darken($color-brown, 10%);
  margin: 20px;
  margin-top: 10px;
}
.deco01 {
  position: absolute;
  z-index: 0;
  top: -40px;
  left: -30px;
}
.deco02 {
  position: absolute;
  z-index: 0;
  bottom: -10px;
  right: -15px;
}
.deco03 {
  position: absolute;
  z-index: 0;
  top: -84px;
  left: 80px;
}
.deco-cat-ribon {
  width: 100px;
}
.sellist-icon {
  width: 250px;
}

.buying-list-opened {
  position: relative;
  margin: 30px;
  cursor: pointer;
  .expand-bar {
    display: flex;
    justify-content: flex-end;
    padding-right: 10px;
    align-items: center;
    border-radius: 8px 8px 0 0;
    background-color: $color-header;
    height: 20px;
    border: 2px solid darken($color-brown, 10%);
    transition: all 0.5s;
  }
  .order-content {
    border-radius: 0 0 8px 8px;
    background-color: $color-cat;
    display: flex;
    justify-content: space-between;
    padding: 20px;
    border: 2px solid darken($color-brown, 10%);
    border-top: none;
  }
}
.order-title {
  flex: 1;
  a {
    color: $color-brown;
    text-decoration: none;
    &:hover {
      color: $color-header;
    }
  }
  .order-photo-link {
    display: flex;
    justify-content: center;
  }
  .order-name {
    text-align: center;
    margin-top: 5px;
    font-size: 22px;
  }
}
.order-photo {
  width: 90%;
  height: 100px;
  background-size: cover;
  background-position: center;
}
.title-group {
  display: flex;
  flex: 2;
  justify-content: space-between;
  .price,
  .status,
  .review {
    flex: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
  }
  .order-price {
    font-size: 28px;
    color: $color-brown;
  }
  .order-status {
    font-size: 22px;
    color: $color-brown;
  }
  .order-review {
    font-size: 22px;
    color: darken($color-header, 10%);
    display: flex;
    flex-direction: column;
    align-items: center;
    span {
      color: $color-brown;
    }
  }
  .price-title,
  .review-title,
  .status-title {
    position: relative;
    padding: 6px;
    margin-left: 20px;
    background: linear-gradient(transparent 50%, $color-header 20%);
    font-size: 25px;
  }
  .title-deco {
    position: absolute;
    top: 5px;
    left: -15px;
  }
}
.nodetail {
  display: flex;
  justify-content: center;
  img {
    width: 50%;
  }
}
</style>
