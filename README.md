# ☆.｡.:*・ﾟ miubuy 喵敗 ☆.｡.:*・ﾟ

> 台日即時代購平台 ★  
> 日本賣家 × 台灣買家，在喵敗上面即時交流，安心代購 (´ω｀)

---

## ✦ 專案簡介

miubuy 是一個台日即時代購平台，賣家可以開設代購房間、即時與買家聊天確認商品，買家則可以瀏覽房間、加入委託清單、完成結帳。

本專案為 **Vue 2 SPA → Nuxt 4 SPA** 重構版本，保留完整功能與原版視覺風格。

---

## ✦ 技術架構

```
☆ Frontend  ── Nuxt 4 (SPA mode, ssr: false)
☆ Language  ── TypeScript
☆ Style     ── SCSS (scoped + global variables)
☆ Realtime  ── SignalR (@microsoft/signalr)
☆ Auth      ── Cookie + localStorage
☆ UI        ── SweetAlert2、@nuxt/icon
```

---

## ✦ 頁面結構

```
/                  首頁（日台地圖 + 在線代購數）
/area/japan        日本地區選擇
/area/taiwan       台灣地區選擇
/chatroom          聊天室列表
/chatroom/:id      聊天室（即時通訊 + 訂單流程）
/checkout/:id      結帳頁
/mypage            我的頁面
  /mypage/seller   賣家訂單
  /mypage/buyer    買家訂單
  /mypage/info     個人資料編輯
/login             登入
/signup            註冊
```

---

## ✦ 開始使用

### 1. 複製專案

```bash
git clone https://github.com/<your-username>/Miubuy-Nuxt.git
cd Miubuy-Nuxt
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 設定環境變數

```bash
cp .env.example .env
```

`.env` 內容（預設值已指向正式 API，可直接使用）：

```env
NUXT_PUBLIC_API_BASE=https://miubuy.rocket-coding.com
NUXT_PUBLIC_SIGNALR_HUB=https://miubuy.rocket-coding.com/signalr
NUXT_PUBLIC_UPLOAD_URL=https://miubuy.rocket-coding.com/api/UpLoadFile
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000) 即可看到畫面 ☆

---

## ✦ 指令一覽

| 指令               | 說明                         |
| ------------------ | ---------------------------- |
| `npm run dev`      | 啟動開發伺服器（含 HMR）     |
| `npm run build`    | SSR 建置（Node.js 伺服器用） |
| `npm run generate` | 靜態建置（GitHub Pages 用）  |
| `npm run preview`  | 預覽建置結果                 |
| `npm run lint`     | ESLint 檢查                  |
| `npm run lint:fix` | ESLint 自動修正              |

---

## ✦ 部署至 GitHub Pages

本專案已設定好自動部署，**只要 push 到 `main` branch 就會自動上線** ★

> 第一次使用請先完成以下設定：

### Step 1 — 建立 GitHub Repository

將本專案推上 GitHub（建議 repository 名稱為 `Miubuy-Nuxt`）：

```bash
git init
git add .
git commit -m "☆ initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/Miubuy-Nuxt.git
git push -u origin main
```

### Step 2 — 開啟 GitHub Pages

1. 進入 repository → **Settings**
2. 左側選單找 **Pages**
3. **Source** 選擇 **`GitHub Actions`**
4. 儲存

### Step 3 — 觸發部署

任何 push 到 `main` 都會自動觸發部署，也可以到：

**Actions** → **☆ 部署至 GitHub Pages** → **Run workflow**

手動觸發。

### Step 4 — 確認網址

部署完成後，網址格式為：

```
https://<your-username>.github.io/Miubuy-Nuxt/
```

> ☆ `NUXT_APP_BASE_URL` 會由 Actions 自動根據 repo 名稱填入，不需要手動設定。

---

## ✦ 目錄結構

```
Miubuy-Nuxt/
├── .github/
│   └── workflows/
│       └── deploy.yml       # ☆ 自動部署設定
├── app/
│   ├── assets/
│   │   └── scss/            # 全域 SCSS 變數
│   ├── components/
│   │   ├── common/          # 共用元件（Loading、StarRating）
│   │   ├── layout/          # AppHeader、AppFooter
│   │   └── modal/           # 各種 Modal 元件
│   ├── composables/         # useAuth、useArea、useSignalR、useUpload
│   ├── layouts/             # default（含 Header/Footer）、auth（登入/註冊用）
│   ├── middleware/          # auth 路由守衛
│   ├── pages/               # 各頁面
│   └── types/               # TypeScript 型別定義
├── public/                  # 靜態資源（圖片、字型）
├── .env.example
├── nuxt.config.ts
└── package.json
```

---

## ✦ 開發注意事項

- **SignalR** 連線需搭配後端 Hub，本機開發時請確認 API 可正常連線
- **圖片上傳** 使用後端 `/api/UpLoadFile`，本機無法使用 mock
- 所有需要登入的頁面已設定 `middleware: 'auth'`，未登入會自動導向 `/login`

---

## ✦ 授權

© baihu & sonyko  
本專案為個人學習作品，僅供展示用途 ♪