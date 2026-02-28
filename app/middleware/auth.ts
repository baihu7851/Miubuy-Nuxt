// =============================================
// auth middleware
// 套用方式：在頁面的 definePageMeta 加上 middleware: 'auth'
// =============================================

export default defineNuxtRouteMiddleware(() => {
  // SSR 關閉，直接在 client 端檢查
  if (import.meta.server) return

  const { isLoggedIn } = useAuth()

  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }
})
