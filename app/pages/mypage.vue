<script lang="ts" setup>
// =============================================
// mypage.vue — 我的頁面 Nested Route Parent
// 提供 Logo、三個切換按鈕，渲染子頁（seller / buyer / info）
// Nuxt 4 nested routes：此檔 + app/pages/mypage/ 子目錄組成
// =============================================

definePageMeta({ middleware: 'auth' });

const isLoading = ref(true);
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 1000);
});
</script>

<template>
  <div>
    <div class="mypage-max-width">
      <!-- Logo -->
      <NuxtLink to="/"><div class="miubuy-logo" /></NuxtLink>

      <div class="mypage-container">
        <!-- 切換列 -->
        <div class="mypage-switch">
          <NuxtLink to="/mypage/seller">
            <img
              src="/image/selling_list_btn.png"
              alt="賣家訂單"
              class="switch-btn"
            />
          </NuxtLink>
          <NuxtLink to="/mypage/buyer">
            <img
              src="/image/buying_list_btn.png"
              alt="買家訂單"
              class="switch-btn"
            />
          </NuxtLink>
          <NuxtLink to="/mypage/info">
            <img
              src="/image/user_edit_btn.png"
              alt="個人資料"
              class="switch-btn"
            />
          </NuxtLink>
        </div>

        <!-- 子頁渲染區 -->
        <NuxtPage />
      </div>
    </div>

    <CommonLoadingSpinner v-if="isLoading" />
  </div>
</template>

<style lang="scss">
body {
  background-color: $color-header;
}
a {
  text-decoration: none;
}
</style>

<style lang="scss" scoped>
.mypage-max-width {
  max-width: 1080px;
  margin: 0 auto;
}

.miubuy-logo {
  position: absolute;
  width: 150px;
  height: 50px;
  left: 42%;
  top: 3px;
  background-image: url('/image/logo.png');
  background-size: cover;
  transition: all 0.5s;
  &:hover {
    transform: rotate(5deg);
  }
}

.mypage-container {
  background-color: $bgc;
  padding: 15px;
  margin: 0 50px 20px;
  border-radius: 10px;
}

.mypage-switch {
  display: flex;
  justify-content: flex-end;
}

.switch-btn {
  transition: all 0.5s;
  width: 100px;
  margin-right: 10px;
  cursor: pointer;
  &:hover {
    transform: rotate(10deg);
  }
}
</style>
