<script lang="ts" setup>
import Swal from 'sweetalert2'
import type { RoomInfo, OrderItem } from '~/types'

// =============================================
// chatroom/[id].vue — 聊天室頁
// 功能：即時訊息（SignalR）、訂單明細、訂單確認流程
// 使用官方 @microsoft/signalr 取代 signalr-no-jquery
// =============================================

definePageMeta({ middleware: 'auth' })

// ── 路由與基礎設定 ────────────────────────────
const route  = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { token, userId } = useAuth()
const signalR = useSignalR()

const roomId = computed(() => Number(route.params.id))

// ── 房間與使用者資料 ──────────────────────────
const roomInfo  = ref<RoomInfo | null>(null)
const hostId    = ref<number>(0)
const isLoading = ref(true)

// 目前在場人數
const buyerInRoom = ref(0)

// 買家 ID（由 joinRoom 事件取得）
const buyerId = ref<number>(0)

// 頭像
const myPhoto    = ref<string>('')
const otherPhoto = ref<string>('')

// ── 訊息 ─────────────────────────────────────
interface ChatMessage {
  SenderId: number
  Message:  string
  MsgTime:  string
}

const chatHistory = ref<ChatMessage[]>([])
const messageText = ref('')
const scrollRef   = ref<HTMLElement | null>(null)

// ── 訂單明細 ─────────────────────────────────
const orderItems = ref<OrderItem[]>([])
const total      = computed(() => orderItems.value.reduce((sum, i) => sum + Number(i.Price), 0))

// 新增商品 UI
const showAddInput    = ref(false)
const newItemTitle    = ref('')
const newItemPrice    = ref('')

// ── 訂單流程狀態 ──────────────────────────────
const canBuyerConfirm  = ref(true)   // 買家可以按「確認訂單」
const waitingForSeller = ref(false)  // 等待賣家確認中
const canSellerConfirm = ref(false)  // 賣家可以按「訂單成立」
const canCheckout      = ref(false)  // 買家可以按「結帳」
const orderId          = ref<number>(0)

// ── 編輯房間 Modal ─────────────────────────────
const showEditRoom = ref(false)

// ── 是否為賣家 ────────────────────────────────
const isSeller = computed(() => userId.value === hostId.value)

// ── 初始化 ────────────────────────────────────
onMounted(async () => {
  setTimeout(() => { isLoading.value = false }, 4000)

  await fetchRoomInfo()
  await signalR.connect(token.value)
  setupSignalREvents()
  await signalR.invoke('JoinRoom', userId.value, roomId.value)
})

/** 取得房間基本資料 */
const fetchRoomInfo = async (): Promise<void> => {
  try {
    const data = await $fetch<RoomInfo & { Seller: Array<{ Id: number }> }>(
      `${config.public.apiBase}/api/Rooms/${roomId.value}`,
    )
    roomInfo.value = data
    hostId.value   = (data as unknown as { Seller: Array<{ Id: number }> }).Seller[0]?.Id ?? 0
  }
  catch (err) {
    console.error('取得房間資料失敗', err)
  }
}

// ── SignalR 事件監聽 ───────────────────────────
const setupSignalREvents = (): void => {
  // 有人進入房間
  signalR.on<number>('joinRoom', (incomingUserId, incomingRoomId) => {
    if (Number(incomingUserId) === hostId.value) return

    buyerId.value = Number(incomingUserId)
    buyerInRoom.value += 1

    signalR.invoke('GetRoomUsers', roomId.value)
    signalR.invoke('MessageHistory', {
      SenderId:    Number(incomingUserId),
      RecipientId: hostId.value,
      RoomId:      Number(incomingRoomId),
    })
    signalR.invoke('ReadDetail', incomingUserId, incomingRoomId)
  })

  // 歷史訊息
  signalR.on<ChatMessage[]>('messageHistory', (history) => {
    chatHistory.value = history
    scrollToBottom()
  })

  // 即時訊息
  signalR.on<ChatMessage>('message', (msg) => {
    chatHistory.value.push(msg)
    scrollToBottom()
  })

  // 訂單明細
  signalR.on<OrderItem[]>('detail', (details) => {
    orderItems.value = details
  })

  // 取得房間用戶資料（頭像、訂單狀態）
  signalR.on<{
    Id: number
    Picture: string
    SellerPicture: string
    Status: string
    OrderId: number
  }>('getRoomUsers', (res) => {
    if (userId.value === res.Id) {
      myPhoto.value    = res.SellerPicture
      otherPhoto.value = res.Picture
    }
    else {
      otherPhoto.value = res.Picture
      myPhoto.value    = res.SellerPicture
    }

    if (res.Status === '訂單確認') {
      canSellerConfirm.value = true
    }
    if (res.Status === '訂單送出') {
      waitingForSeller.value = false
      canCheckout.value      = true
      orderId.value          = res.OrderId
    }
  })

  // 買家已結帳通知（給賣家）
  signalR.on('chked', async () => {
    const result = await Swal.fire({
      title: '★買家已經去結帳囉( ^ω^ )★',
      text: '個人頁面可以查看訂單💕',
      icon: 'warning',
      confirmButtonText: '卍 關 卍',
    })
    if (result.isConfirmed) {
      await closeRoomApi()
      router.push('/mypage/seller')
    }
  })
}

// ── 訊息捲動至底部 ────────────────────────────
const scrollToBottom = (): void => {
  nextTick(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    }
  })
}

// ── 傳送訊息 ─────────────────────────────────
const sendMessage = async (): Promise<void> => {
  if (!messageText.value.trim()) return

  const recipientId = isSeller.value ? buyerId.value : hostId.value
  await signalR.invoke('SendGroup', {
    SenderId:    userId.value,
    RecipientId: recipientId,
    RoomId:      roomId.value,
    Message:     messageText.value,
  })
  messageText.value = ''
}

// ── 訂單明細操作 ─────────────────────────────
/** 新增商品（賣家） */
const addOrderItem = async (): Promise<void> => {
  const title = newItemTitle.value.trim()
  const price = newItemPrice.value.trim()
  if (!title || !price) return

  orderItems.value.push({ Id: 0, Title: title, Price: Number(price), Checked: false })
  await signalR.invoke('NewDetail', orderItems.value, buyerId.value, roomId.value)

  newItemTitle.value  = ''
  newItemPrice.value  = ''
  showAddInput.value  = false
}

/** 刪除商品（賣家） */
const removeOrderItem = async (item: OrderItem): Promise<void> => {
  await signalR.invoke('DelDetail', Number(item.Id))
}

// ── 訂單流程 ─────────────────────────────────
/** 買家確認訂單 */
const buyerConfirmOrder = async (): Promise<void> => {
  waitingForSeller.value = true
  canBuyerConfirm.value  = false
  await signalR.invoke('CheckOrder', roomId.value)
}

/** 賣家成立訂單 */
const sellerConfirmOrder = async (): Promise<void> => {
  try {
    const newOrderId = await $fetch<number>(`${config.public.apiBase}/api/Orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { BuyerId: buyerId.value, RoomId: roomId.value },
    })
    await signalR.invoke('ReCheckOrder', buyerId.value, roomId.value, newOrderId)
  }
  catch (err) {
    console.error('建立訂單失敗', err)
  }
}

/** 買家結帳：跳轉並通知賣家 */
const goCheckout = async (): Promise<void> => {
  await signalR.invoke('Chked', roomId.value)
  router.push(`/checkout/${orderId.value}`)
}

// ── 房間操作 ─────────────────────────────────
/** 買家離開房間 */
const buyerExitRoom = async (): Promise<void> => {
  if (isSeller.value) {
    router.push('/chatroom')
    return
  }

  const result = await Swal.fire({
    title: '(´・ω・｀)你確定要離開嗎?',
    text: '點選確定將會退出聊天室☆',
    icon: 'warning',
    showCancelButton: true,
    reverseButtons: true,
    confirmButtonText: 'YES',
  })

  if (result.isConfirmed) {
    try {
      await $fetch(`${config.public.apiBase}/api/RoomUsers/${roomId.value}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token.value}` },
      })
      router.push('/chatroom')
    }
    catch (err) {
      console.error('退出房間失敗', err)
    }
  }
}

/** 賣家關閉房間 */
const closeRoom = async (): Promise<void> => {
  const result = await Swal.fire({
    title: '(´・ω・｀)你確定要關店嗎?',
    text: '關掉就... 會關掉了喔☆',
    icon: 'warning',
    showCancelButton: true,
    reverseButtons: true,
    confirmButtonText: 'YES',
  })
  if (result.isConfirmed) {
    await closeRoomApi()
    router.push('/chatroom')
  }
}

const closeRoomApi = async (): Promise<void> => {
  try {
    await $fetch(`${config.public.apiBase}/api/Rooms/${roomId.value}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` },
    })
  }
  catch (err) {
    console.error('關閉房間失敗', err)
  }
}

/** 房間資料更新後刷新 */
const onRoomUpdated = async (): Promise<void> => {
  await fetchRoomInfo()
}
</script>

<template>
  <!-- 聊天室頁 -->
  <div class="body-container">
    <div class="chatroom-max-container">

      <!-- 返回 / 離開按鈕 -->
      <img
        src="/image/ruturnBTN.png"
        alt="返回"
        class="return-btn"
        @click="buyerExitRoom"
      />

      <!-- 房間資訊欄 -->
      <div v-if="roomInfo" class="chatroom-rule-content">
        <div>
          <img src="/image/ribon002.png" alt="" class="deco-ribon002" />
        </div>

        <ul class="rule-area">
          <li><span class="roomtitle">{{ roomInfo.Name }}</span></li>
          <li>
            <span class="center">
              <img src="/image/catHead.png" alt="" width="26px" />
              最大人數：<span class="text">1</span>
            </span>
          </li>
          <li>
            <span class="center">
              <img src="/image/catHead.png" alt="" width="26px" />
              開房時間：<span class="text">{{ roomInfo.roomStart }}</span>
            </span>
          </li>
          <li class="room-rule-item">
            <span class="center">
              <img src="/image/catHead.png" alt="" width="26px" />
              房規：
            </span>
            <span class="rule-content text">{{ roomInfo.Rule }}</span>
          </li>
        </ul>

        <!-- 賣家操作按鈕 -->
        <ul v-if="isSeller" class="btn-area">
          <li @click="showEditRoom = true">編輯</li>
          <li>廣告刊登</li>
          <li class="close-chat-btn" @click="closeRoom">關店</li>
        </ul>

        <!-- 買家看到的招牌圖 -->
        <div
          v-if="!isSeller"
          class="shop-picture"
          :style="{ backgroundImage: `url(${roomInfo.Picture})` }"
        />
      </div>

      <!-- 主要內容區（訂單 + 聊天） -->
      <div class="chatroom-content">
        <img src="/image/ribon002.png" alt="" class="deco-ribon002" />

        <!-- 訂單明細區 -->
        <div class="order-area">
          <h2>
            <img src="/image/deco_cat.png" alt="" width="25px" />
            訂單明細
            <img src="/image/star002.png" alt="" width="25px" />
          </h2>

          <!-- 賣家新增商品 -->
          <div v-if="buyerInRoom >= 1 && isSeller">
            <div v-if="!showAddInput">
              <Icon
                name="mdi:plus-circle"
                class="add-icon"
                @click="showAddInput = true"
              />
            </div>
            <div v-else class="add-product">
              <input
                v-model="newItemTitle"
                type="text"
                class="add-title"
                placeholder="商品名稱"
              />
              <input
                v-model="newItemPrice"
                type="number"
                class="add-price"
                placeholder="價格"
              />
              <Icon name="mdi:check" class="confirm-icon" @click="addOrderItem" />
            </div>
          </div>

          <!-- 等待買家進入 -->
          <h3 v-if="buyerInRoom < 1" class="wait-text">等待對方進入 ... (´・∀・｀)</h3>

          <!-- 買家看到的訂單（唯讀） -->
          <ul v-if="!isSeller">
            <li v-for="item in orderItems" :key="item.Id" class="order text">
              <h3><span class="product-name">{{ item.Title }}</span></h3>
              <p>$ <span class="price">{{ item.Price }}</span></p>
            </li>
          </ul>

          <!-- 賣家看到的訂單（可刪除） -->
          <ul v-if="isSeller" class="orders">
            <li v-for="item in orderItems" :key="item.Id" class="order text">
              <h3>
                <Icon name="mdi:close" class="remove-icon" @click="removeOrderItem(item)" />
                <span class="product-name">{{ item.Title }}</span>
              </h3>
              <p>$ <span class="price">{{ item.Price }}</span></p>
            </li>
          </ul>

          <!-- 分隔線 -->
          <div class="line">
            <img src="/image/catline.png" alt="" />
          </div>

          <!-- 總計 -->
          <h3 class="total">
            <p>('∀') TOTAL ☆</p>
            <p class="money-icon">$<span class="total-price">{{ total }}</span></p>
          </h3>

          <!-- 訂單操作按鈕 -->
          <div class="decide">
            <div v-if="canBuyerConfirm && !isSeller">
              <a class="decide-btn" @click="buyerConfirmOrder">確認訂單</a>
            </div>
            <div v-if="waitingForSeller">
              <h3 class="decided-status">...等待賣家成立訂單</h3>
            </div>
            <div v-if="canSellerConfirm && isSeller">
              <a class="decide-btn" @click="sellerConfirmOrder">訂單成立</a>
            </div>
            <div v-if="canCheckout && !isSeller">
              <a class="decide-btn" @click="goCheckout">結帳</a>
            </div>
          </div>
        </div>

        <!-- 聊天區 -->
        <div class="chat-area">
          <div class="message-area">
            <div ref="scrollRef" class="messages">
              <template v-for="(msg, index) in chatHistory" :key="index">
                <!-- 對方訊息 -->
                <div v-if="msg.SenderId !== userId" class="message-user">
                  <h3>
                    <div
                      class="user-photo"
                      :style="{ backgroundImage: `url(${otherPhoto})` }"
                    />
                    <span class="user-message">{{ msg.Message }}</span>
                    <span class="submit-time">{{ msg.MsgTime }}</span>
                  </h3>
                </div>

                <!-- 自己訊息 -->
                <div v-else class="message-to-user">
                  <h3>
                    <span class="submit-time">{{ msg.MsgTime }}</span>
                    <span class="to-user-message">{{ msg.Message }}</span>
                    <div
                      class="to-user-photo"
                      :style="{ backgroundImage: `url(${myPhoto})` }"
                    />
                  </h3>
                </div>
              </template>
            </div>
          </div>

          <!-- 輸入區 -->
          <div class="submit-area">
            <span class="update-photo">
              <Icon name="mdi:image-multiple" />
            </span>
            <input
              v-model="messageText"
              type="text"
              class="text-area"
              @keypress.enter="sendMessage"
            />
            <span class="submit-btn" @click="sendMessage">
              <Icon name="mdi:comment" />
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <LoadingSpinner v-if="isLoading" />

    <!-- 編輯房間 Modal -->
    <EditRoomModal
      v-if="roomInfo"
      v-model:visible="showEditRoom"
      :room-data="roomInfo"
      @updated="onRoomUpdated"
    />
  </div>
</template>

<style lang="scss">
body { background-image: url('/image/chat-bgc.png'); background-size: cover; }

/* SweetAlert2 字體覆蓋 */
.swal2-title    { font-family: myfont, japanese-font, serif; font-size: 24px; }
.swal2-content  { font-family: myfont, japanese-font, serif; font-size: 22px; }
.swal2-styled.swal2-confirm { font-family: myfont, japanese-font, serif; padding: 8px; font-size: 20px; }
.swal2-styled.swal2-cancel  { font-family: myfont, japanese-font, serif; padding: 8px; background-color: rgb(228, 157, 157); font-size: 20px; }
</style>

<style lang="scss" scoped>
$color-bgc:   rgb(163, 135, 111);
$color-ribon: rgb(204, 104, 116);

* { box-sizing: border-box; }
::-webkit-scrollbar { display: none; }

.body-container { position: relative; }

.chatroom-max-container { max-width: 1200px; margin: 0 auto; }

// ── 返回按鈕 ─────────────────────────────────
.return-btn { position: fixed; width: 50px; right: 0; bottom: 100px; z-index: 30; cursor: pointer; &:hover { bottom: 120px; } }

// ── 房間資訊欄 ────────────────────────────────
.chatroom-rule-content {
  position: relative;
  padding: 15px;
  background-color: #fff;
  max-width: 720px;
  margin: 20px auto 0;
  border-radius: 8px;
  border: 2px solid $color-brown;
  display: flex;
}
.deco-ribon002 { position: absolute; top: -15px; left: -15px; width: 55px; transform: rotate(-10deg); }
.text { color: lighten($color-brown, 5%); font-size: 22px; }
.rule-area {
  font-family: myfont, japanese-font, serif;
  font-size: 20px;
  color: $color-brown;
  width: 65%;
  li { margin-bottom: 10px; img { margin-right: 5px; } }
  .rule-content.text { display: inline-block; text-align: justify; font-size: 23px; margin-left: 50px; max-width: 400px; }
  .center { display: flex; align-items: center; font-size: 24px; }
}
.roomtitle { font-size: 28px; margin-left: 24px; color: rgb(190, 129, 129); }
.btn-area {
  font-family: myfont, japanese-font, serif;
  font-size: 18px;
  width: 40%;
  display: flex;
  justify-content: flex-end;
  li { display: flex; justify-content: center; background-color: $color-bgc; padding: 0 10px; height: 32px; margin-left: 10px; border-radius: 8px; color: #fff; align-items: center; cursor: pointer; &:hover { background-color: darken($color-bgc, 10%); } }
}
.shop-picture { background-color: rgb(255, 249, 231); background-size: cover; background-position: center center; width: 34%; border-radius: 5px; height: 120px; margin-left: 10px; }

// ── 主內容區 ─────────────────────────────────
.chatroom-content {
  position: relative;
  max-width: 860px;
  margin: 30px auto 0;
  border-radius: 8px;
  border: 2px solid $color-brown;
  background-color: #fff;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  z-index: 10;
  height: 480px;
}

// ── 訂單區 ────────────────────────────────────
.order-area {
  position: relative;
  width: 50%;
  font-family: myfont, japanese-font, serif;
  color: $color-brown;
  padding: 5px;
  border-radius: 8px;

  h2 { font-size: 28px; display: flex; align-items: center; justify-content: center; color: $color-brown; margin-bottom: 10px; img { margin: 0 8px; } }
  h3 { display: flex; align-items: center; font-size: 24px; }
  li { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  span { margin: 0 5px; font-size: 22px; }
  ul { height: 240px; overflow-y: scroll; padding: 12px 12px 0; }
}

.add-icon { color: $color-header; display: flex; justify-content: center; margin-bottom: 5px; cursor: pointer; font-size: 26px; &:hover { color: darken($color-header, 20%); } }
.add-product { display: flex; align-items: center; justify-content: center; }
.add-title { max-width: 150px; margin-right: 10px; font-size: 14px; height: 30px; padding-left: 8px; border-radius: 5px; border: none; background-color: lighten($color-header, 20%); color: $color-brown; }
.add-price { width: 60px; margin-right: 15px; font-size: 14px; height: 30px; padding-left: 8px; border-radius: 5px; border: none; background-color: lighten($color-header, 20%); color: $color-brown; }
.confirm-icon { cursor: pointer; &:hover { color: $color-header; } }
.remove-icon  { color: $color-header; margin-right: 10px; cursor: pointer; &:hover { color: darken($color-header, 20%); } }

.wait-text { justify-content: center; }
.product-name { max-width: 280px; font-size: 24px !important; }
.price { font-size: 28px; }

.line img { display: block; width: 92%; margin: 0 auto; }
.total { padding: 10px 10px 12px; font-size: 26px; display: flex; justify-content: space-between; font-weight: bold; color: darken($color-header, 20%); }
.money-icon { color: $color-ribon !important; }
.total-price { font-size: 30px !important; color: $color-ribon; }

.decide { position: absolute; bottom: 10px; right: 0; display: flex; justify-content: flex-end; }
.decide-btn { padding: 8px; color: #fff; font-size: 20px; border-radius: 8px; background-color: $color-ribon; cursor: pointer; &:hover { background-color: darken($color-ribon, 8%); transform: translateY(1px); } }
.decided-status { margin-right: 10px; color: lighten($color-brown, 20%); }

// ── 聊天區 ────────────────────────────────────
.chat-area { position: relative; width: 50%; font-family: myfont, japanese-font, serif; color: $color-brown; padding-left: 20px; padding-right: 10px; display: flex; flex-direction: column; }
.message-area { background-color: lighten($color-header, 20%); border-radius: 8px; }
.messages { height: 390px; overflow-y: scroll; overflow-x: hidden; }

.message-user  { padding: 10px; display: flex; h3 { display: flex; width: auto; } }
.message-to-user { padding: 10px; display: flex; justify-content: flex-end; h3 { display: flex; width: auto; justify-content: flex-end; } }

.user-photo, .to-user-photo { height: 30px; width: 30px; border-radius: 100%; background-size: cover; }
.user-message  { display: flex; padding: 6px; max-width: 180px; font-size: 24px; align-items: center; margin-left: 5px; background-color: #fff; border-radius: 5px; }
.to-user-message { display: flex; max-width: 180px; padding: 6px; font-size: 24px; align-items: center; margin-right: 5px; background-color: #fff; border-radius: 5px; }
.submit-time { display: flex; align-items: flex-end; margin: 0 5px; font-size: 16px; }

.submit-area { margin-top: 10px; display: flex; align-items: center; flex: 1; position: relative; }
.update-photo { position: absolute; width: 35px; height: 100%; left: 5px; top: 0; border-right: 2px solid $color-hv-brown; cursor: pointer; display: flex; align-items: center; justify-content: center; &:hover { color: darken($color-brown, 20%); } }
.text-area { font-family: myfont, japanese-font, serif; padding-left: 42px; width: 90%; height: 100%; font-size: 18px; color: $color-brown; margin: 2px; border-radius: 5px; border: 2px solid $color-hv-brown; }
.submit-btn { width: 11%; background-color: $color-brown; height: 100%; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; &:hover { background-color: darken($color-brown, 10%); } }
</style>
