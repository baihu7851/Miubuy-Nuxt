<script lang="ts" setup>
import Swal from 'sweetalert2';

// =============================================
// login.vue — 會員登入頁
// 使用 auth layout（無 Header/Footer）
// ☆.｡.:*・ﾟ 對齊 Vue2 Login.vue 的版面與功能 ☆
// =============================================

definePageMeta({
  layout: 'auth',
});

// ☆ 讓 body 套用登入頁專屬背景色（對齊 Vue2 beforeCreate body.className = 'login'）
useHead({
  bodyAttrs: { class: 'login' },
});

// ── 表單資料 ──────────────────────────────────
const account = ref('');
const password = ref('');
const rememberMe = ref(false); // ☆ 記住我（Vue2 原版功能）

// ── 認證 ─────────────────────────────────────
const { login } = useAuth();
const router = useRouter();

/** ☆ 送出登入表單 */
const onSubmit = async (): Promise<void> => {
  if (!account.value || !password.value) {
    Swal.fire({
      position: 'center',
      icon: 'error',
      title: '請輸入帳號與密碼 (´・ω・｀)',
      showConfirmButton: false,
      timer: 2000,
    });
    return;
  }

  try {
    await login({
      Account: account.value,
      Password: password.value,
    });
    router.push('/');
  } catch {
    Swal.fire({
      position: 'center',
      icon: 'error',
      title: '帳號密碼錯誤 (´・ω・｀)',
      showConfirmButton: false,
      timer: 2500,
    });
  }
};
</script>

<template>
  <!-- 登入頁：使用 auth layout，背景為深綠色 -->
  <!--☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆-->
  <div class="container">
    <!--☆=== 頁首裝飾圖 ===☆-->
    <div class="login-header">
      <img src="/image/signup_header.png" alt="" class="header-img" />
    </div>

    <!--☆=== Logo ===☆-->
    <h1 class="miu-buy-title">
      <NuxtLink to="/">
        Miubuy喵敗
        <img src="/image/logo_white.png" alt="miubuy" class="logo-white-img" />
      </NuxtLink>
    </h1>

    <!--☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆-->

    <!--☆=== 登入表單 ===☆-->
    <div class="login-form-content">
      <form class="login-form" @submit.prevent="onSubmit">
        <h2 class="login-title">
          <img src="/image/signup_ribon2.png" alt="" class="icon-ribon-01" />
          會員登入
        </h2>

        <div class="form-account-and-pass">
          <!--☆ 帳號 ☆-->
          <div class="login-account-group">
            <label class="login-account">帳號</label>
            <input
              v-model="account"
              type="text"
              class="login-input"
              @keyup.enter="onSubmit"
            />
          </div>

          <!--☆ 密碼 ☆-->
          <div class="login-pass-group">
            <label class="login-pass">密碼</label>
            <input
              v-model="password"
              type="password"
              class="login-input"
              @keyup.enter="onSubmit"
            />
          </div>
        </div>

        <!--☆ 記住我（Vue2 原版功能） ☆-->
        <h3 class="remember-me">
          <input v-model="rememberMe" type="checkbox" />
          <span>記住我</span>
        </h3>

        <!--☆ 登入按鈕 ☆-->
        <h5 class="login-btn">
          <a @click.prevent="onSubmit">登入</a>
        </h5>
      </form>

      <!--☆ 跳轉至註冊 ☆-->
      <div class="already-member">
        <h4>
          ☆還不是會員？ 快<NuxtLink to="/signup">註冊</NuxtLink>吧 ( ^ω^ )
        </h4>
      </div>
    </div>

    <!--☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆-->

    <!--☆=== 裝飾元素 ===☆-->
    <div class="login-deco">
      <div class="ribon1">
        <img src="/image/signup_ribon1.png" alt="" class="ribon-01" />
      </div>
      <div class="cats-illust">
        <img src="/image/signup_nekos.png" alt="" class="cats-illust-img" />
      </div>
      <div class="cats-illust2">
        <img src="/image/signup_cats.png" alt="" class="cats-illust-img2" />
      </div>
      <div class="stars">
        <img src="/image/star.png" alt="" class="star-img" />
      </div>
      <div class="stars2">
        <img src="/image/star.png" alt="" class="star-img2" />
      </div>
      <div class="stars3">
        <img src="/image/star.png" alt="" class="star-img3" />
      </div>
    </div>

    <!--☆=== 頁尾 ===☆-->
    <footer>
      <h5 class="login-copyright"><span>© </span>baihu &amp; sonyko</h5>
      <div class="login-footer">
        <img src="/image/signup_footer.png" alt="" class="footer-img" />
        <div class="cyo-ku">
          <img src="/image/signup_chooku.png" alt="" class="cyo-ku-img" />
        </div>
      </div>
    </footer>
  </div>
</template>

<!--☆…☆…☆…☆…☆…☆…☆…☆…☆…☆ SCSS ☆…☆…☆…☆…☆…☆…☆…☆…☆…☆-->

<style lang="scss">
//☆=========== 登入頁 body 背景（全域，配合 useHead bodyAttrs） ===========☆
body.login {
  background-color: #4a604e;
  background-size: cover;
  background-repeat: no-repeat;
  width: 100%;
  max-width: 100%;
  height: auto;
}
</style>

<style lang="scss" scoped>
//☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆
* {
  box-sizing: border-box;
  transition: all 0.5s;
}

.container {
  max-width: 100%;
}

//☆=========== Header & Footer ===========☆
.login-header,
.header-img {
  max-width: 100%;
}

.login-footer {
  position: fixed;
  max-width: 100%;
  bottom: -1px;
  left: 0;
}

.footer-img {
  max-width: 100%;
}

.login-copyright {
  position: fixed;
  left: 10px;
  bottom: 5px;
  z-index: 99;
  color: #fff;
  font-family: myfont, serif;

  span {
    font-size: 12px;
  }
}

//☆=========== Decoration ===========☆
.ribon1 {
  position: fixed;
  right: 20px;
  top: 70px;
  width: 80px;
  height: 80px;

  .ribon-01 {
    width: 100%;
  }
}

.cats-illust {
  width: 320px;
  position: absolute;
  bottom: 50px;
  left: 3%;
}

.cats-illust-img {
  width: 100%;
}

.cyo-ku {
  position: absolute;
  bottom: 0;
  left: 250px;
  z-index: 10;

  .cyo-ku-img {
    width: 350px;
  }
}

.cats-illust2 {
  width: 280px;
  position: absolute;
  bottom: 20px;
  right: 2%;
  z-index: 1;
}

.cats-illust-img2 {
  width: 100%;
}

.stars {
  position: absolute;
  top: 40%;
  left: 25%;
  animation: star-anime 2.5s infinite;
}
.stars2 {
  position: absolute;
  top: 10%;
  right: 26%;
  animation: star-anime 3s infinite;
}
.stars3 {
  position: absolute;
  bottom: 20%;
  right: 10%;
}

.star-img {
  width: 10px;
  transform: rotate(-25deg);
}
.star-img2 {
  width: 8px;
}
.star-img3 {
  width: 12px;
  animation: star-anime 4s infinite;
  transform: rotate(25deg);
}

@keyframes star-anime {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

//☆=========== h1 & Logo ===========☆
.miu-buy-title {
  text-indent: 101%;
  overflow: hidden;
  white-space: nowrap;
  float: left;
}

.logo-white-img {
  left: 10px;
  width: 30%;
  position: absolute;
  top: 50px;

  &:hover {
    transform: translateY(-2px);
  }
}

//☆=========== Form Content ===========☆
.login-form-content {
  font-family: myfont, serif;
  font-weight: lighter;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 20px;
  height: 100%;
  margin-left: 25px;
  margin-top: 50px;
  border-radius: 5px;

  h2 {
    font-size: 24px;
    color: #fff;
    font-weight: lighter;
    margin-bottom: 15px;
  }

  label {
    font-size: 20px;
    color: #fff;
    margin-right: 10px;
    margin-bottom: 3px;
  }
}

//☆ input 寬度對齊 Vue2（.login--acount / .login--password 同為 68%）
.login-input {
  font-family: myfont, serif;
  height: 30px;
  border: none;
  border-radius: 4px;
  padding-left: 10px;
  color: #ebffef;
  font-size: 20px;
  background-color: rgba(#fff, 0.3);
  letter-spacing: 2px;
  margin-bottom: 5px;
  width: 68%;

  &::placeholder {
    color: #fff;
    font-size: 16px;
  }
}

.login-title {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-ribon-01 {
  width: 60px;
}

//☆ 對齊 Vue2 帳號/密碼群組（無 flex-wrap，確保寬度正確）
.login-account-group,
.login-pass-group {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

//☆=========== 記住我 ===========☆
.remember-me {
  display: flex;
  align-items: center;
  margin-left: 25px;

  span {
    color: #fff;
    font-size: 18px;
    margin-bottom: 2px;
  }
}

//☆=========== 登入 BTN ===========☆
.login-btn {
  a {
    margin-left: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    height: 30px;
    width: 70px;
    background-color: rgba(255, 255, 255, 0.447);
    border-radius: 5px;
    color: #fff;
    text-decoration: none;
    cursor: pointer;
    z-index: 100;

    &:hover {
      background-color: rgba(255, 255, 255, 0.694);
    }
  }
}

//☆=========== 已是會員 ===========☆
.already-member {
  margin-top: 45px;
  color: #fff;

  a {
    text-decoration: none;
    color: rgb(255, 252, 179);
    &:hover {
      color: rgb(153, 255, 223);
    }
  }
}

footer {
  position: absolute;
  bottom: 0;
}
</style>
