<script lang="ts" setup>
// =============================================
// default.vue — 預設版面
// 透過 provide 讓子頁面可以呼叫開啟 CreateRoomModal
// LayoutHeader 的貓掌按鈕 → emit openCreateRoom → layout 接收 → 開啟 Modal
// =============================================

const showCreateRoom = ref(false);

/** 提供開啟 Modal 的函式給所有子元件使用 */
provide('openCreateRoom', () => {
  showCreateRoom.value = true;
});
</script>

<template>
  <!-- 預設版面：含 Header 和 Footer，用於主要頁面 -->
  <div class="homepage-max-width">
    <LayoutHeader @open-create-room="showCreateRoom = true" />
    <slot />
    <LayoutFooter />
    <ModalCreateRoom v-model:visible="showCreateRoom" />
  </div>
</template>

<style lang="scss">
.homepage-max-width {
  max-width: 1080px;
  margin: 0 auto;
}
</style>
