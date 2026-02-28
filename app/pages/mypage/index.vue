<script lang="ts" setup>
// =============================================
// mypage/index.vue — 預設重定向至賣家頁
// 訪問 /mypage 時自動跳到 /mypage/seller
// =============================================

definePageMeta({ middleware: 'auth' })

const router = useRouter()
onMounted(() => {
  router.replace('/mypage/seller')
})
</script>

<template>
  <!-- 重定向中，不顯示內容 -->
  <div />
</template>
