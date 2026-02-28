<script lang="ts" setup>
// =============================================
// area/japan.vue — 日本地區選擇頁
// CountryId = 2（日本）
// =============================================

const JAPAN_COUNTRY_ID = 2

const {
  counties,
  cities,
  selectedCountyId,
  selectedCityId,
  onlineCount,
  fetchCounties,
  fetchCities,
  saveAndNavigate,
} = useArea()

onMounted(async () => {
  await fetchCounties(JAPAN_COUNTRY_ID)
})

/** 選擇都道府縣後載入市區 */
const onPrefectureChange = async (): Promise<void> => {
  if (!selectedCountyId.value) return
  await fetchCities(Number(selectedCountyId.value))
}

/** 前往聊天室列表 */
const goToChatroom = (): void => {
  saveAndNavigate(JAPAN_COUNTRY_ID)
}
</script>

<template>
  <!-- 日本地區選擇頁 -->
  <div>
    <div class="home-container">

      <!-- Logo -->
      <div class="logo-block">
        <NuxtLink to="/">
          <img src="/image/logo.png" alt="miubuy" class="logo" />
        </NuxtLink>
        <h2 class="subtitle">♫ 台日即時代購平台 ♪</h2>
      </div>

      <!-- 地區選擇內容 -->
      <div class="area-select-content">

        <!-- 日本地圖圖片 -->
        <div class="ja-map-select">
          <img src="/image/JAPAN_MAP/jap-map_border.png" alt="" class="ja-map-border" />
        </div>

        <!-- 文字選擇區 -->
        <div class="text-selector">
          <div class="text-selector-content">

            <!-- 地區選擇標題 -->
            <h2 class="text-selector-title">
              <img src="/image/ribon_icon.png" alt="" class="ribon-icon" />
              地區選擇
              <img src="/image/ribon_icon.png" alt="" class="ribon-icon" />
            </h2>

            <div class="ja-selector-form">
              <!-- 都道府縣 -->
              <div class="ja-prefectures">
                <label class="prefectures">
                  <img src="/image/cat_icon.png" alt="" class="cat-icon" />都道府縣
                </label>
                <select
                  v-model="selectedCountyId"
                  class="ja-form-prefectures"
                  @change="onPrefectureChange"
                >
                  <option value="">==請選擇都道府縣==</option>
                  <option v-for="prefecture in counties" :key="prefecture.Id" :value="prefecture.Id">
                    {{ prefecture.Name }}
                  </option>
                </select>
              </div>

              <!-- 市、區 -->
              <div class="ja-city">
                <label class="city">
                  <img src="/image/cat_icon.png" alt="" class="cat-icon" />市、區
                </label>
                <select v-model="selectedCityId" class="ja-form-city">
                  <option value="">==請選擇市區==</option>
                  <option v-for="city in cities" :key="city.Id" :value="city.Id">
                    {{ city.Name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- 聊天室狀態 -->
            <h2 class="text-selector-status">
              <img src="/image/ribon_icon.png" alt="" class="ribon-icon" />
              聊天室目前狀態
              <img src="/image/ribon_icon.png" alt="" class="ribon-icon" />
            </h2>

            <div class="now-status-group">
              <h3 class="now-status">
                <img src="/image/cat_icon.png" alt="" class="cat-icon" />
                目前有&nbsp;<span class="now-status-num">{{ onlineCount }}</span>&nbsp;間代購聊天室
              </h3>
              <img
                src="/image/GO_btn.png"
                class="go-btn"
                alt="前往聊天室列表"
                @click="goToChatroom"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 返回按鈕 -->
    <div class="return-btn">
      <NuxtLink to="/">
        <img src="/image/return_btn.png" class="return-cat" alt="返回首頁" />
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
select { overflow-y: auto; }

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

.logo { width: 240px; }

.subtitle {
  font-family: myfont, serif;
  font-size: 22px;
  margin-left: 200px;
  color: darken($color-brown, 15%);
  font-weight: bold;
}

// ── 地區選擇 ─────────────────────────────────
.ja-map-select { max-width: 450px; }
.ja-map-border { width: 100%; }

.area-select-content {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.text-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 550px;
  margin-right: 20px;
}

.text-selector-content {
  position: relative;
  width: 100%;
  border-radius: 8px;
  background-color: #fef9ea;
  padding: 30px 30px 30px 35px;
}

.text-selector-title,
.text-selector-status {
  font-family: myfont, serif;
  font-size: 28px;
  display: flex;
  color: $color-brown;
  margin-left: -10px;
}

.text-selector-status { margin-top: 30px; }

.ribon-icon,
.cat-icon {
  width: 30px;
  margin-right: 8px;
  margin-left: 8px;
}

label {
  font-family: myfont, serif;
  display: flex;
  align-items: center;
  font-size: 24px;
  color: darken($color-header, 10%);
}

.ja-selector-form {
  margin-top: 18px;
  display: flex;
}

.ja-prefectures { width: 300px; }
.ja-city        { width: 200px; }

.ja-form-prefectures,
.ja-form-city {
  width: 80%;
  margin-top: 10px;
  height: 40px;
  padding-left: 10px;
  border: 2px solid lighten($color-brown, 20%);
  border-radius: 10px;
  font-size: 20px;
  font-family: myfont, japanese-font, serif;
  color: $color-brown;
}

option { font-family: myfont, serif; }

// ── 狀態與 GO 按鈕 ────────────────────────────
.now-status-group {
  display: flex;
}

.now-status {
  font-family: myfont, serif;
  font-size: 26px;
  display: flex;
  color: darken($color-header, 10%);
  align-items: center;
  margin-top: 25px;
}

.now-status-num {
  color: rgb(171, 153, 132);
  margin: 0 3px;
}

.go-btn {
  width: 120px;
  position: absolute;
  right: 15px;
  bottom: -15px;
  cursor: pointer;

  &:hover { transform: translateY(-10px); }
}

// ── 返回按鈕 ─────────────────────────────────
.return-cat {
  width: 120px;
  position: fixed;
  z-index: 10;
  bottom: 0;
  right: 0;
  cursor: pointer;

  &:hover { transform: translateX(1px); }
}
</style>
