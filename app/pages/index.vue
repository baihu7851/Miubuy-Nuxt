<script lang="ts" setup>
// =============================================
// index.vue — 首頁
// 顯示日台地圖與在線代購房間數
// =============================================

const config = useRuntimeConfig();

// ── 在線房間數 ────────────────────────────────
const japanCount = ref<number | string>('…');
const taiwanCount = ref<number | string>('…');
const isLoading = ref(true);

interface CountryWithCount {
  Id: number;
  Name: string;
  Count: number;
}

onMounted(async () => {
  // 延遲 1.5 秒後隱藏 Loading（同原本邏輯）
  setTimeout(() => {
    isLoading.value = false;
  }, 1500);

  try {
    const data = await $fetch<CountryWithCount[]>(
      `${config.public.apiBase}/api/Countries`,
    );
    // Id=2 為日本，Id=3 為台灣（依原本 API 順序）
    const japan = data.find((c) => c.Id === 2);
    const taiwan = data.find((c) => c.Id === 3);
    japanCount.value = japan?.Count ?? 0;
    taiwanCount.value = taiwan?.Count ?? 0;
  } catch (err) {
    console.error('取得在線房間數失敗', err);
  }
});

// ☆.｡.:*・ﾟ 新增房間 Modal 由 default layout 的貓掌按鈕統一控制 ☆
// LayoutHeader emit('openCreateRoom') → default.vue 接收 → 開啟 Modal
// 此頁不需要自行宣告，避免產生兩個互不相通的 Modal 實例
</script>

<template>
  <!-- 首頁：日台地圖 + 在線代購房間數 -->
  <div class="body">
    <div class="home-container">
      <!-- Logo 區 -->
      <div class="logo-block">
        <img src="/image/logo.png" alt="miubuy" class="logo" />
        <h2 class="subtitle">♫ 台日即時代購平台 ♪</h2>
      </div>

      <!-- 地圖區 -->
      <div class="map">
        <!-- 日本地圖 -->
        <div class="ja-map">
          <NuxtLink to="/area/japan">
            <img
              src="/image/JAPAN_MAP/new_nekomap.png"
              alt="日本地圖"
              class="ja-map-img"
            />
          </NuxtLink>
          <h3 class="ja-online-status">
            <img src="/image/cat_hand_icon.png" alt="" class="icon" />
            now 日本在線代購 :
            <span class="ja-now-num">{{ japanCount }}</span> 間
          </h3>
        </div>

        <!-- 台灣地圖 -->
        <div class="tw-map">
          <NuxtLink to="/area/taiwan">
            <img
              src="/image/TW_MAP/new_taiwan_map.png"
              alt="台灣地圖"
              class="tw-map-img"
            />
          </NuxtLink>
          <h3 class="tw-online-status">
            <img src="/image/cat_hand_icon.png" alt="" class="icon" />
            now 台灣在線代購 :
            <span class="tw-now-num">{{ taiwanCount }}</span> 間
          </h3>
        </div>
      </div>
    </div>

    <!-- ☆.｡.:*・ﾟ Loading 動畫 ☆.｡.:*・ﾟ -->
    <CommonLoadingSpinner v-if="isLoading" />
  </div>
</template>

<style lang="scss">
/* 首頁 body 背景 */
body {
  background-color: $color-header;
}
</style>

<style lang="scss" scoped>
.body {
  position: relative;
}

.home-container {
  background-color: $bgc;
  padding: 15px;
  margin-bottom: 20px;
  margin-left: 50px;
  margin-right: 50px;
  border-radius: 10px;
}

// ── Logo ─────────────────────────────────────
.logo-block {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.logo {
  width: 240px;
}

.subtitle {
  font-family: myfont, serif;
  font-size: 24px;
  margin-left: 200px;
  color: darken($color-brown, 15%);
  font-weight: bold;
}

// ── 地圖 ─────────────────────────────────────
.map {
  display: flex;
  margin-top: 5px;
  margin-bottom: 10px;
  justify-content: center;
}

.ja-map-img,
.tw-map-img {
  max-width: 450px;
}

.ja-map {
  margin-right: 10px;
  cursor: pointer;
  &:hover {
    transform: translateY(2px);
    transition: all 0.5s;
  }
}

.tw-map {
  margin-left: 10px;
  cursor: pointer;
  &:hover {
    transform: translateY(2px);
    transition: all 0.5s;
  }
}

.ja-online-status,
.tw-online-status {
  font-family: myfont, serif;
  font-size: 22px;
  font-weight: lighter;
  margin-left: 180px;
  color: $color-brown;
}

.ja-now-num,
.tw-now-num {
  color: darken($color-header, 10%);
  font-weight: bold;
}

.icon {
  width: 20px;
  height: 20px;
}
</style>
