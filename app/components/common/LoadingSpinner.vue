<script lang="ts" setup>
// =============================================
// LoadingSpinner — 全站通用載入動畫
// 使用方式：<CommonLoadingSpinner v-if="isLoading" />
// =============================================
</script>

<template>
  <!-- 半透明遮罩 + 條狀載入動畫 -->
  <div class="loader">
    <div id="loading">
      <div class="loading">
        <div v-for="i in 8" :key="i" class="obj" />
      </div>
    </div>
  </div>
</template>
