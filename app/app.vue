<script lang="ts" setup>
// =============================================
// app.vue — 根元件
// 負責在應用程式啟動時初始化認證狀態
// =============================================

const { initAuth } = useAuth()

// 頁面載入時從 cookie / localStorage 還原登入狀態
onMounted(async () => {
  await initAuth()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
