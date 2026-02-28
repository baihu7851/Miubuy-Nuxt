// =============================================
// nuxt.config.ts — miubuy 完整整合版設定
// =============================================

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  // ── 關閉 SSR（與原 Vue 2 SPA 行為一致） ──────
  ssr: false,

  // ── Nuxt 4 目錄結構（app/ 慣例） ─────────────
  future: {
    compatibilityVersion: 4,
  },

  // ── 全域 CSS ─────────────────────────────────
  css: [
    '~/assets/scss/reset.scss',
  ],

  // ── Vite SCSS 設定 ────────────────────────────
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // 自動注入色彩變數，所有 <style lang="scss"> 可直接使用
          additionalData: '@use "~/assets/scss/variables" as *;',
          // 關閉 SCSS 相關警告
          silenceDeprecations: ['color-functions', 'global-builtin', 'import'],
        },
      },
    },
  },

  // ── 執行期環境變數 ────────────────────────────
  runtimeConfig: {
    public: {
      /** REST API 基礎網址，例如 https://miubuy.rocket-coding.com */
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'https://miubuy.rocket-coding.com',
      /** SignalR Hub 完整 URL，例如 https://miubuy.rocket-coding.com/signalr */
      signalrHub: process.env.NUXT_PUBLIC_SIGNALR_HUB ?? 'https://miubuy.rocket-coding.com/signalr',
      /** 圖片上傳 API URL */
      uploadUrl: process.env.NUXT_PUBLIC_UPLOAD_URL ?? 'https://miubuy.rocket-coding.com/api/UpLoadFile',
    },
  },

  // ── 模組 ─────────────────────────────────────
  modules: [
    '@nuxt/eslint',   // ESLint 整合
    '@nuxt/icon',     // <Icon> 元件（取代 FontAwesome）
  ],

  // ── ESLint 設定 ───────────────────────────────
  eslint: {
    config: {
      stylistic: false,
    },
  },

  // ── App head ─────────────────────────────────
  // ☆ baseURL：本機開發為 /，GitHub Pages 部署時由 Actions 注入 repo 名稱
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL ?? '/',
    head: {
      title: 'miubuy — 台日即時代購平台',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
})
