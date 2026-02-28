<script lang="ts" setup>
// =============================================
// AppHeader — 全站頁首
// 顯示導覽列、登入/登出狀態、使用者頭像
// =============================================

/** 控制新增房間 Modal 的顯示狀態（傳遞給父層） */
const emit = defineEmits<{
  openCreateRoom: []
}>()

const { isLoggedIn, userInfo, logout } = useAuth()
const router = useRouter()

/** 登出並跳轉至首頁 */
const handleLogout = (): void => {
  logout()
  router.push('/')
}
</script>

<template>
  <header class="all-header">
    <!-- 開啟新增房間 Modal 的貓掌按鈕 -->
    <div class="sell-btn">
      <img
        src="/image/cats-handv2.png"
        alt="開啟新增房間"
        class="cats-hand"
        @click="emit('openCreateRoom')"
      />
    </div>

    <!-- 導覽列 -->
    <ul class="navbar">
      <!-- 已登入：顯示頭像與暱稱 -->
      <template v-if="isLoggedIn">
        <li class="login">
          <NuxtLink to="/mypage/info" class="myname">
            <img
              :src="userInfo?.picture ?? '/image/default-avatar.png'"
              class="header-photo"
              alt="頭像"
            />
            {{ userInfo?.nickname }}
          </NuxtLink>
        </li>
        <li class="login" @click="handleLogout">
          <NuxtLink to="/">登出</NuxtLink>
        </li>
      </template>

      <!-- 未登入：顯示登入連結 -->
      <template v-else>
        <li class="logout">
          <NuxtLink to="/login">登入</NuxtLink>
        </li>
        <li class="signup">
          <NuxtLink to="/signup">註冊</NuxtLink>
        </li>
      </template>
    </ul>
  </header>
</template>

<style lang="scss" scoped>
.all-header {
  position: relative;
  max-width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;

  .sell-btn {
    .cats-hand {
      width: 110px;
      position: absolute;
      top: 0;
      cursor: pointer;
      left: 3%;

      &:hover {
        transform: translateX(2px);
      }
    }
  }

  .navbar {
    display: flex;
    margin-right: 50px;
    align-items: center;

    li {
      margin-left: 20px;
      padding: 0 5px;
      border-radius: 5px;
      font-size: 26px;

      &:hover {
        background-color: darken($color-header, 5%);
        height: 100%;
      }
    }

    a {
      font-family: myfont, japanese-font, serif;
      font-size: 24px;
      text-decoration: none;
      color: #fff;
      font-weight: lighter;
      display: flex;
      align-items: center;
    }
  }
}

.header-photo {
  width: 40px;
  height: 40px;
  display: block;
  border-radius: 100%;
  margin-right: 5px;
  object-fit: cover;
}

.myname {
  cursor: pointer;
}
</style>
