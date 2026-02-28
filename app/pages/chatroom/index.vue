<script lang="ts" setup>
import Swal from 'sweetalert2'
import type { County, City, RoomTag } from '~/types'

// =============================================
// chatroom/index.vue — 聊天室列表頁
// 讀取 sessionStorage 的地區篩選條件並顯示房間列表
// =============================================

// ── 型別定義 ──────────────────────────────────
interface RoomSeller {
  Id: number
  Nickname: string
  Picture: string
}

interface Room {
  Id: number
  Name: string
  Picture: string
  Rule: string
  roomStart: string
  Seller: RoomSeller[]
  TagName: string
  TagColor: string
  CountyName: string
  CityName:   string
  JoinRoom:   number
}

// ── 狀態 ─────────────────────────────────────
const config = useRuntimeConfig()
const { token, userId } = useAuth()
const router = useRouter()

const rooms      = ref<Room[]>([])
const tags       = ref<RoomTag[]>([])
const counties   = ref<County[]>([])
const cities     = ref<City[]>([])
const isLoading  = ref(true)

// sessionStorage 讀取的地區篩選
const countryId         = ref<number>(0)
const selectedCountyId  = ref<number | ''>('')
const selectedCityId    = ref<number | ''>('')

// 游標自訂（貓咪圖示）
const cursorX = ref(0)
const cursorY = ref(0)

// ── 初始化：從 sessionStorage 讀取地區 ─────────
onMounted(async () => {
  setTimeout(() => { isLoading.value = false }, 1500)

  countryId.value        = Number(sessionStorage.getItem('Countries') ?? 0)
  selectedCountyId.value = Number(sessionStorage.getItem('prefecture') ?? '') || ''
  selectedCityId.value   = Number(sessionStorage.getItem('city')       ?? '') || ''

  await Promise.all([
    fetchRooms(),
    fetchTags(),
    fetchCounties(),
  ])
})

// ── 游標追蹤 ──────────────────────────────────
onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
})
onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
})

const onMouseMove = (e: MouseEvent): void => {
  cursorX.value = e.pageX
  cursorY.value = e.pageY
}

// ── API ───────────────────────────────────────
/** 依地區篩選條件取得房間列表 */
const fetchRooms = async (tagId?: number): Promise<void> => {
  try {
    rooms.value = await $fetch<Room[]>(`${config.public.apiBase}/api/SelectRooms`, {
      method: 'POST',
      body: {
        CountryId: countryId.value || undefined,
        CountyId:  tagId ? undefined : (selectedCountyId.value || undefined),
        CityId:    tagId ? undefined : (selectedCityId.value   || undefined),
        TagId:     tagId ?? undefined,
      },
    })
  }
  catch (err) {
    console.error('取得房間列表失敗', err)
  }
}

const fetchTags = async (): Promise<void> => {
  try {
    tags.value = await $fetch<RoomTag[]>(`${config.public.apiBase}/api/Tags`)
  }
  catch (err) {
    console.error('取得標籤列表失敗', err)
  }
}

const fetchCounties = async (): Promise<void> => {
  if (!countryId.value) return
  try {
    counties.value = await $fetch<County[]>(`${config.public.apiBase}/api/Counties/${countryId.value}`)
  }
  catch (err) {
    console.error('取得縣市列表失敗', err)
  }
}

/** 切換縣市時更新城市選單 */
const onCountyChange = async (): Promise<void> => {
  selectedCityId.value = ''
  if (!selectedCountyId.value) return
  try {
    cities.value = await $fetch<City[]>(`${config.public.apiBase}/api/Cities/${selectedCountyId.value}`)
  }
  catch (err) {
    console.error('取得城市列表失敗', err)
  }
}

/** 重新依地區篩選 */
const searchArea = async (): Promise<void> => {
  sessionStorage.setItem('prefecture', String(selectedCountyId.value))
  sessionStorage.setItem('city', String(selectedCityId.value))
  await fetchRooms()
}

/** 依 Tag 篩選 */
const tagSearch = async (tagId: number): Promise<void> => {
  await fetchRooms(tagId)
}

/** 進入聊天室（先呼叫加入房間 API） */
const enterRoom = async (roomId: number): Promise<void> => {
  try {
    await $fetch(`${config.public.apiBase}/api/RoomUsers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { Id: roomId, Name: '訪客' },
    })
    router.push(`/chatroom/${roomId}`)
  }
  catch {
    Swal.fire({
      position: 'center',
      icon: 'error',
      title: '目前房間滿員 or 你還沒登入 (´・ω・｀)',
      showConfirmButton: false,
      timer: 2500,
    })
  }
}
</script>

<template>
  <!-- 聊天室列表頁 -->
  <div>
    <div class="max-width">

      <!-- 頂部地區重選列 -->
      <div class="select-group">
        <select v-model="selectedCountyId" class="select-country" @change="onCountyChange">
          <option value="">{{ counties.find(c => c.Id === selectedCountyId)?.Name ?? '縣市' }}</option>
          <option v-for="county in counties" :key="county.Id" :value="county.Id">{{ county.Name }}</option>
        </select>
        <select v-model="selectedCityId" class="select-area">
          <option value="">{{ cities.find(c => c.Id === selectedCityId)?.Name ?? '城市' }}</option>
          <option v-for="city in cities" :key="city.Id" :value="city.Id">{{ city.Name }}</option>
        </select>
        <input type="button" value="GO★" class="re-select-btn" @click="searchArea" />
      </div>

      <div class="chatroomlist-container">

        <!-- Logo -->
        <div class="room-logo-group">
          <h1 class="miubuy">
            <NuxtLink to="/">miubuy</NuxtLink>
          </h1>
          <h2 class="room-subtitle">台日即時代購平台★</h2>
        </div>

        <!-- 搜尋列（UI 保留，功能待後端支援） -->
        <div class="search-bar-group">
          <input type="text" class="search-bar" placeholder="にじさんじ、魔法使いの約束 ..." />
          <div class="search-btn">
            <Icon name="mdi:magnify" />
          </div>
        </div>

        <!-- Tag 快速搜尋 -->
        <div class="tag-group">
          <h3 class="tags-title">
            <img src="/image/cat_hand_icon.png" alt="" width="30px" />
            快速找房間 ( ^ω^ )
          </h3>
          <ul class="tags">
            <li
              v-for="tag in tags"
              :key="tag.Id"
              class="tag"
              :style="{ backgroundColor: tag.Color }"
              @click="tagSearch(tag.Id)"
            >
              {{ tag.Name }}
            </li>
          </ul>
        </div>

        <!-- 地圖重選捷徑 -->
        <div class="map-selector">
          <NuxtLink to="/area/japan"><div class="map-select-jp" /></NuxtLink>
          <NuxtLink to="/area/taiwan"><div class="map-select-tw" /></NuxtLink>
        </div>

        <!-- 房間列表 -->
        <div class="chatroom-list-group">
          <h3 class="chatroom-status">
            <img src="/image/ribon_pink.png" alt="" class="ribon-pink" />
            &nbsp;目前房間數&nbsp;<span>{{ rooms.length }}</span>&nbsp;
            <img src="/image/stars.png" alt="" class="room-star" />
          </h3>

          <ul class="chatroom-list">
            <li v-for="room in rooms" :key="room.Id" class="chatroom">
              <!-- 封面圖 -->
              <div class="room-cover" :style="{ backgroundImage: `url(${room.Picture})` }" />

              <!-- 賣家資訊 -->
              <div class="user-group">
                <div class="profile-img" :style="{ backgroundImage: `url(${room.Seller[0]?.Picture})` }" />
                <div class="user">
                  <h3 class="user-name">{{ room.Seller[0]?.Nickname }}</h3>
                </div>
              </div>

              <!-- 房間資訊 -->
              <div class="room-info">
                <h3 class="rooms-name">{{ room.Name }}</h3>
                <h3 class="room-open">
                  ☆ 開房時間：<span class="open-time">{{ room.roomStart }}</span>
                </h3>
                <div class="hr" />
                <h3 class="room-rule">
                  ☆ 賣家規約：
                  <p>{{ room.Rule }}</p>
                </h3>
                <ul class="roomtag-group">
                  <li v-if="room.CountyName !== '不選☆彡'" class="roomtag">
                    <a>#{{ room.CountyName }}</a>
                  </li>
                  <li v-if="room.CityName !== '不選★彡'" class="roomtag">
                    <a>#{{ room.CityName }}</a>
                  </li>
                  <li v-if="room.CityName === '不選★彡'" class="roomtag">
                    <a>#全國</a>
                  </li>
                  <li class="roomtag"><a>#{{ room.TagName }}</a></li>
                </ul>

                <!-- 進入按鈕 -->
                <div class="room-enter-btn" @click="enterRoom(room.Id)" />
                <!-- 滿員標示 -->
                <div v-if="room.JoinRoom === 0" class="fullmember" />
              </div>
            </li>
          </ul>

          <!-- 分頁（UI 保留，功能待後端支援） -->
          <div class="pagination">
            <div class="pagination-img">
              <div class="page-num-group">
                <button class="prep">&nbsp;</button>
                <button class="page-1st">1</button>
                <button class="page-2nd">2</button>
                <button class="page-3rd">3</button>
                <button class="page-4th">4</button>
                <button class="next">&nbsp;</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 自訂游標（貓咪圖示） -->
      <div
        class="mouse-symbol"
        :style="{ left: `${cursorX}px`, top: `${cursorY}px` }"
      />
    </div>

    <LoadingSpinner v-if="isLoading" />
  </div>
</template>

<style lang="scss">
body { background-color: $color-header; }
</style>

<style lang="scss" scoped>
$color-ribon: rgb(204, 104, 116);

* { box-sizing: border-box; }

.max-width { max-width: 1080px; margin: 0 auto; }

// ── 頂部地區選單 ──────────────────────────────
.select-group {
  position: absolute;
  top: 13px;
  left: 25%;
  display: flex;
  align-items: center;
  width: 40%;
  margin-left: 100px;
}
.select-country,
.select-area {
  font-family: japanese-font, serif;
  height: 28px;
  width: 25%;
  padding-left: 6px;
  border: none;
  border-radius: 8px;
  margin-right: 10px;
  color: $color-brown;
}
.re-select-btn {
  font-family: japanese-font, serif;
  height: 28px;
  width: 12%;
  border-radius: 8px;
  border: none;
  color: #fff;
  background-color: $color-brown;
  cursor: pointer;
}

// ── 白色容器 ──────────────────────────────────
.chatroomlist-container {
  background-color: #fff;
  width: 94%;
  border-radius: 5px;
  margin: 0 auto;
  padding-top: 10px;
  margin-bottom: 40px;
}

// ── Logo ─────────────────────────────────────
.miubuy {
  background-image: url('/image/logo.png');
  background-size: cover;
  width: 210px;
  height: 75px;
  margin: 0 auto;

  a { width: 200px; height: 75px; text-indent: 101%; overflow: hidden; white-space: nowrap; float: left; }
}
.room-logo-group { position: relative; height: 100px; width: 400px; margin: 0 auto; }
.room-subtitle { font-family: myfont, serif; font-size: 24px; margin-left: 180px; color: darken($color-brown, 5%); font-weight: bold; position: absolute; transform: translateY(-10px); }

// ── 搜尋欄 ────────────────────────────────────
.search-bar-group { padding-top: 12px; display: flex; justify-content: center; }
.search-bar { font-family: myfont, japanese-font, serif; padding-left: 10px; height: 40px; width: 30%; border-radius: 8px; border: 2px solid $color-hv-brown; color: darken($color-brown, 10%); font-size: 20px; &::placeholder { color: $color-brown; font-size: 18px; } }
.search-btn { width: 50px; background-color: $color-brown; border-radius: 0 8px 8px 0; transform: translateX(-10px); display: flex; justify-content: center; align-items: center; color: #fff; font-size: 22px; cursor: pointer; }

// ── Tag ───────────────────────────────────────
.tag-group { z-index: 1000; font-family: myfont, japanese-font, serif; background-color: $color-brown; width: 48%; margin: 20px auto; padding: 12px 12px 20px; border-radius: 5px; font-size: 22px; color: #fff; }
.tags { display: flex; flex-wrap: wrap; justify-content: space-between; margin: 5px auto 0; width: 90%; li { display: flex; align-items: center; justify-content: center; border-radius: 5px; min-width: 90px; height: 36px; padding: 5px; margin-top: 14px; color: #fff; cursor: pointer; } }
.tags-title { display: flex; align-items: center; font-size: 24px; }

// ── 地圖捷徑 ─────────────────────────────────
.map-selector { position: relative; height: 10px; display: flex; justify-content: space-between; z-index: 0; }
.map-select-jp { transition: all 0.5s; position: absolute; top: -280px; background-image: url('/image/cat_map_img.png'); background-size: cover; width: 140px; height: 110px; margin-left: 50px; transform: translateY(-10px); &:hover { transform: rotate(10deg); cursor: pointer; } }
.map-select-tw { transition: all 0.5s; position: absolute; top: -280px; right: 50px; background-image: url('/image/cat_map_img_tw.png'); background-size: cover; width: 140px; height: 110px; transform: translateY(-10px); &:hover { transform: rotate(-10deg); cursor: pointer; } }

// ── 房間列表 ─────────────────────────────────
.chatroom-status { display: flex; align-items: center; justify-content: flex-end; font-family: japanese-font, serif; font-size: 22px; color: $color-brown; margin-right: 50px; span { margin: 0 10px; } &:hover { color: $color-header; } }
.ribon-pink { width: 46px; margin-right: 8px; }
.room-star  { width: 35px; }

.chatroom-list { padding: 20px 1% 0; display: flex; justify-content: space-evenly; flex-wrap: wrap; }

.chatroom {
  position: relative;
  width: 30%;
  border: 2px solid $color-brown;
  border-radius: 5px;
  font-family: myfont, japanese-font, serif;
  font-size: 22px;
  color: darken($color-brown, 15%);
  margin-bottom: 50px;
}
.room-cover { background-image: url('/image/main_visual.jpg'); background-size: cover; background-position: center center; height: 150px; background-color: #eee; }
.profile-img { background-color: $color-header; background-size: cover; width: 50px; height: 50px; margin-right: 5px; border-radius: 100%; }
.user-group { padding: 8px 0 0 8px; display: flex; align-items: center; }
.user { display: flex; flex-direction: column; justify-content: center; margin-left: 5px; }
.user-name { font-size: 24px; }
.room-info {
  padding: 10px;
  h3 { margin-bottom: 15px; }
  span { color: $color-brown; }
  p { margin-left: 20px; line-height: 1.5; color: $color-brown; }
  .hr { width: 100%; background-color: lighten($color-brown, 30%); height: 1px; margin-bottom: 15px; }
}
.rooms-name { font-size: 24px; color: $color-ribon; width: 100%; }
.room-rule { min-height: 50px; p { max-height: 100px; overflow-y: scroll; } }
.roomtag-group { margin: 20px 0 18px; display: flex; flex-wrap: wrap; li { margin-bottom: 20px; } a { background-color: $color-deep-pink; color: #fff; padding: 6px; margin-right: 8px; border-radius: 5px; &:hover { background-color: $color-pink; } } }
.room-enter-btn { background-image: url('/image/enter_btn.png'); background-size: cover; position: absolute; width: 100px; height: 60px; bottom: 0; right: 0; cursor: pointer; }
.fullmember { background-image: url('/image/full.png'); background-size: cover; position: absolute; width: 60px; height: 60px; left: 0; bottom: 0; }

::-webkit-scrollbar { display: none; }

// ── 分頁 ─────────────────────────────────────
.pagination { position: relative; width: 100%; display: flex; justify-content: flex-end; padding: 0 20px 20px; }
.pagination-img { width: 215px; height: 80px; background-image: url('/image/pagination.png'); background-size: cover; }
.page-num-group { position: relative; height: 100%; }
button:focus { outline: none; }

.prep { position: absolute; left: 20px; bottom: 20px; width: 30px; height: 30px; background-color: transparent; cursor: pointer; border: none; }
.next { position: absolute; right: 0; bottom: 10px; width: 25px; height: 25px; background-color: transparent; cursor: pointer; border: none; }

@mixin page-btn($left, $bottom, $rotate) {
  font-family: myfont, japanese-font, serif;
  position: absolute;
  left: $left;
  bottom: $bottom;
  width: 24px;
  color: #fff;
  border: none;
  transform: rotate($rotate);
  background-color: transparent;
  font-size: 20px;
  cursor: pointer;
  font-weight: bold;
  &:hover { color: $color-brown; }
}

.page-1st { @include page-btn(66px,  0px, -5deg); }
.page-2nd { @include page-btn(95px,  1px,  5deg); }
.page-3rd { @include page-btn(127px,-2px, -3deg); }
.page-4th { @include page-btn(157px, 8px,  5deg); }

// ── 自訂游標 ─────────────────────────────────
.mouse-symbol {
  transition: none;
  pointer-events: none;
  z-index: 10;
  position: absolute;

  &::before {
    content: '';
    display: block;
    background-image: url('/image/cat_icon.png');
    width: 40px;
    height: 40px;
    background-size: cover;
  }
}
</style>
