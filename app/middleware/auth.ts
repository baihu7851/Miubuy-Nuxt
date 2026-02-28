//☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆
// auth middleware
// 使用方式：definePageMeta({ middleware: 'auth' })
// 未登入的話就乖乖去登入頁 (´・ω・｀)
//☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return  // ☆ SSR 關閉，只在 client 端跑

  const { isLoggedIn } = useAuth()

  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }
})