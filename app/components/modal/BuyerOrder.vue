<script lang="ts" setup>
import Swal from 'sweetalert2'

// =============================================
// BuyerOrderModal — 買家訂單詳細 Modal
// 功能：查看訂單項目、標記已付款/確認收貨、評價賣家
// =============================================

interface OrderDetail { Id: number; Name: string; Price: number }
interface BuyerOrder {
  Id: number; RoomName: string; RoomPicture: string; SellerNickname: string
  TotalPrice: number; Status: string; Payment: string; Pickup: string
  Name: string; Phone: string; Email: string; Address: string; Remark: string
  SellerStar: string; SellerReviews: string; Detail: OrderDetail[]
}

const props = defineProps<{ visible: boolean; orderData: BuyerOrder | null; status: string }>()
const emit  = defineEmits<{ 'update:visible': [boolean]; refreshed: [] }>()

const config    = useRuntimeConfig()
const { token } = useAuth()

const showReviewInput = ref(false)
const reviewRating    = ref(0)
const reviewComment   = ref('')

const closeModal = () => emit('update:visible', false)

const payDone = async () => {
  if (!props.orderData || props.orderData.Status !== '未付款') return
  try {
    await $fetch(`${config.public.apiBase}/api/Orders/${props.orderData.Id}`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token.value}` },
      body: { Status: '已付款' },
    })
    await Swal.fire({ position: 'center', icon: 'success', title: '通知賣家已付款(´ω`)', showConfirmButton: false, timer: 5000 })
    emit('refreshed'); closeModal()
  } catch (err) { console.error('更新付款狀態失敗', err) }
}

const pickDone = async () => {
  if (!props.orderData || props.status !== '已發貨') return
  try {
    await $fetch(`${config.public.apiBase}/api/Orders/${props.orderData.Id}`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token.value}` },
      body: { Status: '訂單完成' },
    })
    await Swal.fire({ position: 'center', icon: 'success', title: '通知賣家收到商品！(´ω`)', showConfirmButton: false, timer: 2500 })
    emit('refreshed'); closeModal()
  } catch (err) { console.error('更新收貨狀態失敗', err) }
}

const sendReview = async () => {
  if (!props.orderData) return
  try {
    await $fetch(`${config.public.apiBase}/api/Ratings/${props.orderData.Id}`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token.value}` },
      body: { SellerStar: reviewRating.value, SellerReviews: reviewComment.value },
    })
    await Swal.fire({ position: 'center', icon: 'success', title: '評價成功送出 (´・ω・｀)', showConfirmButton: false, timer: 2500 })
    emit('refreshed'); closeModal()
  } catch (err) { console.error('評價送出失敗', err) }
}
</script>

<template>
  <Teleport to="body">
    <div class="b-modale" :class="{ opened: visible }">
      <div class="b-modal-dialog">
        <div class="b-modal-header">
          <h2 class="modal-title">
            <img src="/image/deco_cat.png" alt="" class="star001" />訂單詳細<img src="/image/deco_cat.png" alt="" class="star001" />
          </h2>
        </div>
        <div v-if="orderData" class="b-modal-body">
          <div class="b-modal-l">
            <h2 class="shop-name">{{ orderData.RoomName }}</h2>
            <div class="room-photo" :style="{ backgroundImage: `url(${orderData.RoomPicture})` }" />
            <h2>賣家：<span>{{ orderData.SellerNickname }}</span></h2>
            <h2>訂單金額：<span>$ {{ orderData.TotalPrice }}</span></h2>
            <ul>
              <li><h2>訂單項目</h2></li>
              <li v-for="item in orderData.Detail" :key="item.Id" class="buy-item">
                <img src="/image/pin.png" alt="" width="30px" /><span>{{ item.Name }}</span><span class="item-price">$ {{ item.Price }}</span>
              </li>
            </ul>
          </div>
          <div class="b-modal-r">
            <div>
              <h2>訂單狀態：<span>{{ orderData.Status }}</span></h2>
              <h2>付款方式：<span>{{ orderData.Payment }}</span></h2>
              <h2>取貨方式：<span>{{ orderData.Pickup }}</span></h2>
            </div>
            <div class="line005" />
            <div>
              <h2>買家姓名：<span>{{ orderData.Name }}</span></h2>
              <h2>買家電話：<span>{{ orderData.Phone }}</span></h2>
              <h2>買家信箱：<span>{{ orderData.Email }}</span></h2>
              <h2>買家地址：<span>{{ orderData.Address }}</span></h2>
              <h2>買家備註：<span>{{ orderData.Remark }}</span></h2>
            </div>
            <div class="line005" />
            <div class="review-group">
              <h2>給賣家的評價</h2>
              <template v-if="orderData.SellerStar === '☆☆☆☆☆'">
                <button v-if="!showReviewInput" class="review-btn" @click="showReviewInput = true">評價賣家</button>
                <div v-else class="review-content">
                  <div class="review-row">
                    <div class="star-group">
                      <span v-for="n in 5" :key="n" class="star" :class="{ active: n <= reviewRating }" @click="reviewRating = n">★</span>
                    </div>
                    <Icon name="mdi:check-circle-outline" class="confirm-icon" @click="sendReview" />
                  </div>
                  <h2>留言：<input v-model="reviewComment" type="text" class="review-text" /></h2>
                </div>
              </template>
              <template v-else>
                <h3 class="review-star">{{ orderData.SellerStar }}</h3>
                <h3 class="review-comment">{{ orderData.SellerReviews }}</h3>
              </template>
            </div>
          </div>
        </div>
        <div class="b-modal-footer">
          <button v-if="status === '未付款'" class="btn-action" @click="payDone">已付款</button>
          <button v-if="status === '已發貨'" class="btn-action" @click="pickDone">確認收貨</button>
          <button class="btn-close-modal" @click="closeModal">關閉</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
$color-ribon: rgb(204, 104, 116);
.b-modale::before { content: ''; display: none; background: rgba(95,95,95,0.6); position: fixed; inset: 0; z-index: 10; }
.opened::before { display: block; }
.opened .b-modal-dialog { transform: translateX(-20%); top: 15%; }
.b-modal-dialog { overflow: initial; background: $color-header; border-radius: 8px; margin-left: -200px; position: fixed; left: 50%; top: -100%; z-index: 11; width: 680px; box-shadow: 0 2px 5px rgba(85,85,85,0.432); transform: translate(0,-500%); transition: transform 0.3s ease-out; }
.modal-title { font-family: myfont, japanese-font, serif; font-size: 24px; margin: 15px 0; color: #fff; display: flex; align-items: center; justify-content: center; .star001 { margin-left: 8px; width: 30px; } }
.b-modal-body { display: flex; justify-content: center; background-color: #fff; padding: 25px; height: 450px; overflow-y: scroll; h2 { font-family: myfont, japanese-font, serif; font-size: 20px; color: $color-brown; margin-bottom: 8px; } span { color: lighten($color-brown, 10%); } }
.b-modal-l { width: 45%; margin-right: 30px; .shop-name { color: $color-ribon; } }
.b-modal-r { width: 55%; }
.room-photo { width: 200px; height: 100px; background-size: cover; background-position: center; margin-bottom: 10px; }
.buy-item { display: flex; align-items: center; margin-bottom: 6px; }
.item-price { margin-left: 10px; }
.line005 { width: 250px; height: 22px; background-image: url('/image/line005.png'); background-size: cover; margin: 10px 0 20px; }
.review-btn { min-width: 75px; min-height: 35px; font-size: 20px; background-color: $color-bar; border: none; color: #fff; border-radius: 4px; margin: 15px 0 0 15px; font-family: myfont, japanese-font, serif; cursor: pointer; &:hover { background-color: darken($color-bar, 10%); } }
.star-group { display: flex; }
.star { font-size: 28px; color: lighten($color-brown, 30%); cursor: pointer; &.active { color: $color-header; } }
.review-row { display: flex; align-items: center; justify-content: space-between; }
.confirm-icon { margin-right: 30px; cursor: pointer; font-size: 26px; color: lighten($color-brown, 20%); &:hover { color: $color-brown; } }
.review-text { border: none; height: 30px; font-size: 26px; font-family: myfont, japanese-font, serif; border-bottom: 1px solid rgb(190,185,179); min-width: 240px; color: $color-brown; }
.review-star { margin-top: 10px; color: darken($color-header, 10%); font-size: 28px; display: flex; justify-content: center; font-family: myfont, serif; }
.review-comment { margin-top: 10px; color: $color-brown; font-size: 24px; display: flex; justify-content: center; font-family: myfont, serif; }
.b-modal-footer { margin: 10px 10px 10px 0; display: flex; justify-content: flex-end; align-items: center; button { height: 38px; margin-left: 10px; width: 80px; font-family: myfont, japanese-font, serif; font-size: 20px; color: #fff; background-color: $color-brown; border: none; border-radius: 5px; cursor: pointer; &:hover { background-color: lighten($color-brown, 10%); } } }
.btn-action { background-color: $color-ribon !important; width: 100px !important; &:hover { background-color: darken($color-ribon, 10%) !important; } }
</style>
