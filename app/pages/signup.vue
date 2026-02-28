<script lang="ts" setup>
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';

// =============================================
// signup.vue — 會員註冊頁
// 使用 auth layout（無 Header/Footer）
// 表單驗證：vee-validate + zod
// =============================================

definePageMeta({
  layout: 'auth',
});

// ☆ 讓 body 套用註冊頁專屬背景色（對齊 Vue2 beforeCreate body.className = 'signup'）
useHead({
  bodyAttrs: { class: 'signup' },
});

// ── 表單驗證 Schema ──────────────────────────
const schema = toTypedSchema(
  z
    .object({
      account: z.string().min(1, '請輸入帳號'),
      password: z.string().min(6, '密碼至少 6 個字元'),
      rePassword: z.string().min(1, '請再次輸入密碼'),
      name: z.string().min(1, '請輸入姓名'),
      alias: z.string().min(1, '請輸入匿稱'),
      email: z.string().email('請輸入正確的信箱格式'),
      phone: z.string().min(1, '請輸入電話'),
      bdYear: z.string().regex(/^\d{4}$/, '請輸入 4 位數年份'),
      bdMonth: z.string().regex(/^(0?[1-9]|1[0-2])$/, '月份 1–12'),
      bdDay: z.string().regex(/^(0?[1-9]|[12]\d|3[01])$/, '日期 1–31'),
      agree: z.boolean().refine((v) => v === true, '請同意利用規約'),
    })
    .refine((data) => data.password === data.rePassword, {
      message: '兩次密碼不一致',
      path: ['rePassword'],
    }),
);

const { handleSubmit, isSubmitting } = useForm({ validationSchema: schema });

const { value: account, errorMessage: accountError } =
  useField<string>('account');
const { value: password, errorMessage: passwordError } =
  useField<string>('password');
const { value: rePassword, errorMessage: rePasswordError } =
  useField<string>('rePassword');
const { value: name, errorMessage: nameError } = useField<string>('name');
const { value: alias, errorMessage: aliasError } = useField<string>('alias');
const { value: email, errorMessage: emailError } = useField<string>('email');
const { value: phone, errorMessage: phoneError } = useField<string>('phone');
const { value: bdYear, errorMessage: bdYearError } = useField<string>('bdYear');
const { value: bdMonth, errorMessage: bdMonthError } =
  useField<string>('bdMonth');
const { value: bdDay, errorMessage: bdDayError } = useField<string>('bdDay');
const { value: agree, errorMessage: agreeError } = useField<boolean>('agree');

// ── 圖片上傳 ─────────────────────────────────
const { uploadImage, isUploading } = useUpload();
const photoUrl = ref<string>('');
const fileInputRef = ref<HTMLInputElement | null>(null);

/** 觸發隱藏的 file input */
const triggerFileInput = (): void => {
  fileInputRef.value?.click();
};

/** 使用者選取圖片後上傳 */
const handleFileChange = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    photoUrl.value = await uploadImage(file);
  } catch {
    Swal.fire('(´・ω・｀)', '圖片上傳失敗，請重試', 'error');
  }
};

// ── 認證 ─────────────────────────────────────
const { signup } = useAuth();
const router = useRouter();

/** 送出註冊表單 */
const onSubmit = handleSubmit(async (values) => {
  try {
    await signup({
      Account: values.account,
      Password: values.password,
      RePassword: values.rePassword,
      Email: values.email,
      Name: values.name,
      Nickname: values.alias,
      Phone: values.phone,
      Picture: photoUrl.value,
      Birthday: `${values.bdYear}-${values.bdMonth}-${values.bdDay}`,
    } as Parameters<typeof signup>[0]);

    await Swal.fire({
      position: 'center',
      icon: 'success',
      title: '註冊成功💌 請重新登入',
      showConfirmButton: false,
      timer: 2500,
    });
    router.push('/login');
  } catch {
    Swal.fire('(´・ω・｀)', '註冊失敗，請稍後再試', 'error');
  }
});
</script>

<template>
  <!-- 註冊頁：使用 auth layout，背景為深綠色 -->
  <div class="signup-container">
    <!-- 頁首裝飾圖 -->
    <div class="signup-header">
      <img src="/image/signup_header.png" alt="" class="header-img" />
    </div>

    <!-- Logo -->
    <h1 class="miu-buy-title">
      <NuxtLink to="/">
        Miubuy喵敗
        <img src="/image/logo_white.png" alt="miubuy" class="logo-white-img" />
      </NuxtLink>
    </h1>

    <!-- 註冊表單 -->
    <div class="sign-form-content">
      <form class="sign-form" @submit.prevent="onSubmit">
        <h2 class="signup-title">
          <img src="/image/signup_ribon2.png" alt="" class="sign-icon01" />
          會員註冊
        </h2>

        <!-- 帳密 + 頭像 -->
        <div class="form-top-group">
          <div class="form-account-and-pass">
            <!-- 帳號 -->
            <div class="account-group">
              <label class="sign-account">帳號</label>
              <input
                v-model="account"
                type="text"
                class="account-input"
                :class="{ 'input-error': accountError }"
              />
              <span v-if="accountError" class="error-msg">{{
                accountError
              }}</span>
            </div>

            <!-- 密碼 -->
            <div class="pass-group">
              <label class="sign-pass">密碼</label>
              <input
                v-model="password"
                type="password"
                class="password-input"
                :class="{ 'input-error': passwordError }"
              />
              <span v-if="passwordError" class="error-msg">{{
                passwordError
              }}</span>
            </div>

            <!-- 確認密碼 -->
            <div class="confirm-pass-group">
              <label class="sign-confirm-pass">確認密碼</label>
              <input
                v-model="rePassword"
                type="password"
                class="confirm-password-input"
                :class="{ 'input-error': rePasswordError }"
              />
              <span v-if="rePasswordError" class="error-msg">{{
                rePasswordError
              }}</span>
            </div>
          </div>

          <!-- 頭像上傳 -->
          <div class="signup-photo-group" @click="triggerFileInput">
            <img
              v-if="photoUrl"
              :src="photoUrl"
              class="signup-photo"
              alt="頭像預覽"
            />
            <h3 v-if="isUploading">上傳中…</h3>
            <h3 v-else>上傳</h3>
            <!-- 隱藏的 file input -->
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden-file-input"
              @change="handleFileChange"
            />
          </div>
        </div>

        <div class="hr" />

        <!-- 姓名、匿稱 -->
        <div class="name-group">
          <label>姓名</label>
          <input
            v-model="name"
            type="text"
            class="sign-name"
            :class="{ 'input-error': nameError }"
          />
          <span v-if="nameError" class="error-msg">{{ nameError }}</span>
          <label>匿稱</label>
          <input
            v-model="alias"
            type="text"
            class="sign-alias"
            :class="{ 'input-error': aliasError }"
          />
          <span v-if="aliasError" class="error-msg">{{ aliasError }}</span>
        </div>

        <!-- 信箱 -->
        <div class="email-group">
          <label class="sign-email">信箱</label>
          <input
            v-model="email"
            type="email"
            class="email-input"
            :class="{ 'input-error': emailError }"
          />
          <span v-if="emailError" class="error-msg">{{ emailError }}</span>
        </div>

        <!-- 電話 -->
        <div class="phone-group">
          <label class="sign-phone">電話</label>
          <input
            v-model="phone"
            type="text"
            class="phone-input"
            :class="{ 'input-error': phoneError }"
          />
          <span v-if="phoneError" class="error-msg">{{ phoneError }}</span>
        </div>

        <!-- 生日 -->
        <div class="birthday-group">
          <label class="signup-bd">生日</label>
          <input
            v-model="bdYear"
            type="text"
            class="bd-year"
            placeholder="年"
            :class="{ 'input-error': bdYearError }"
          />
          /
          <input
            v-model="bdMonth"
            type="text"
            class="bd-mon"
            placeholder="月"
            :class="{ 'input-error': bdMonthError }"
          />
          /
          <input
            v-model="bdDay"
            type="text"
            class="bd-day"
            placeholder="日"
            :class="{ 'input-error': bdDayError }"
          />
          <span
            v-if="bdYearError || bdMonthError || bdDayError"
            class="error-msg"
          >
            {{ bdYearError || bdMonthError || bdDayError }}
          </span>
        </div>

        <!-- 利用規約 -->
        <div class="terms-group">
          <label>利用規約</label>
          <p>☆請詳細閱讀 miubuy <a href="#">利用規約</a>後勾選同意 ( ^ω^ )</p>
          <h3 class="agree-check">
            <input v-model="agree" type="checkbox" />
            <span>我同意</span>
          </h3>
          <span v-if="agreeError" class="error-msg">{{ agreeError }}</span>
        </div>

        <!-- 送出按鈕 -->
        <div class="signup-btn">
          <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? '處理中…' : '註冊' }}
          </button>
        </div>
      </form>

      <!-- 跳轉至登入 -->
      <div class="already-signup">
        <h4>
          ☆已經是會員惹？ 快<NuxtLink to="/login">登入</NuxtLink>吧 ( ^ω^ )
        </h4>
      </div>
    </div>

    <!-- 裝飾元素 -->
    <div class="signup-deco">
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

    <!-- 頁尾 -->
    <footer>
      <h5 class="sign-copyright"><span>© </span>baihu &amp; sonyko</h5>
      <div class="signup-footer">
        <img src="/image/signup_footer.png" alt="" class="footer-img" />
        <div class="cyo-ku">
          <img src="/image/signup_chooku.png" alt="" class="cyo-ku-img" />
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="scss">
/* 註冊頁 body 背景 */
//☆=========== 註冊頁 body 背景（全域，配合 useHead bodyAttrs） ===========☆
body.signup {
  background-color: #4a604e;
  background-size: cover;
  background-repeat: no-repeat;
  width: 100%;
  max-width: 100%;
  height: auto;
}
</style>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
  transition: all 0.5s;
}

.signup-container {
  max-width: 100%;
}

// ── Header & Footer ──────────────────────────
.signup-header,
.header-img {
  max-width: 100%;
}

.signup-footer {
  position: fixed;
  max-width: 100%;
  bottom: -1px;
  left: 0;
}

.footer-img {
  max-width: 100%;
}

.sign-copyright {
  position: fixed;
  left: 10px;
  bottom: 5px;
  z-index: 99;
  color: #fff;
  font-family: myfont, japanese-font, serif;
  span {
    font-size: 12px;
  }
}

// ── 裝飾元素 ─────────────────────────────────
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
  .cats-illust-img {
    width: 100%;
  }
}

.cats-illust2 {
  width: 280px;
  position: absolute;
  bottom: 20px;
  right: 2%;
  z-index: 1;
  .cats-illust-img2 {
    width: 100%;
  }
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

// ── Logo ─────────────────────────────────────
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

// ── 表單 ─────────────────────────────────────
.sign-form-content {
  font-family: myfont, japanese-font, serif;
  font-weight: lighter;
  position: absolute;
  padding: 20px;
  right: 40px;
  top: 10%;
  width: 60%;
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
  }

  .hr {
    height: 1px;
    width: 480px;
    background-color: rgba(#fff, 0.2);
    margin-bottom: 15px;
  }

  input[type='text'],
  input[type='password'],
  input[type='email'] {
    font-family: myfont, japanese-font, serif;
    height: 28px;
    border: none;
    border-radius: 4px;
    padding-left: 10px;
    color: #ebffef;
    font-size: 20px;
    background-color: rgba(#fff, 0.3);
    letter-spacing: 2px;

    &::placeholder {
      color: #fff;
      font-size: 12px;
    }
  }
}

.signup-title {
  display: flex;
  align-items: center;
}

.sign-icon01 {
  width: 60px;
}

.form-top-group {
  position: relative;
  display: flex;
}

// 頭像上傳
.signup-photo-group {
  height: 120px;
  width: 120px;
  border-radius: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  margin-left: 60px;
  margin-top: -10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  h3 {
    color: #fff;
    font-size: 20px;
  }

  .signup-photo {
    height: 120px;
    width: 120px;
    border-radius: 100%;
    position: absolute;
    z-index: 1;
    object-fit: cover;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.516);
  }
}

.hidden-file-input {
  display: none;
}

.account-group,
.pass-group,
.confirm-pass-group,
.name-group,
.email-group,
.phone-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.sign-name,
.sign-alias {
  width: 18%;
  margin-right: 15px;
}

.email-input {
  width: 40%;
}

.birthday-group {
  display: flex;
  align-items: center;
  color: #fff;
  flex-wrap: wrap;
  margin-bottom: 15px;

  label {
    margin-right: 10px;
  }

  input {
    height: 28px;
    border: none;
    border-radius: 4px;
    padding-left: 10px;
    color: #ebffef;
    font-size: 18px;
    background-color: rgba(#fff, 0.3);
    width: 10%;
  }
}

.bd-year {
  margin-right: 5px;
}
.bd-mon {
  margin: 0 5px;
}
.bd-day {
  margin-left: 5px;
}

// 驗證錯誤提示
.error-msg {
  width: 100%;
  color: #ffe0a0;
  font-size: 14px;
  margin-top: -3px;
  margin-bottom: 4px;
}

.input-error {
  border: 1px solid #ffb3b3 !important;
}

// 利用規約
.terms-group {
  margin-top: 30px;
  margin-bottom: 10px;
  color: rgb(255, 255, 255);

  p {
    margin-top: 10px;
  }

  a {
    color: rgb(255, 255, 118);
    &:hover {
      color: rgb(153, 255, 223);
    }
  }
}

.agree-check {
  display: flex;
  margin-top: 15px;
  align-items: center;

  span {
    color: #fff;
    font-size: 18px;
    margin-left: 6px;
  }
}

// 送出按鈕
.signup-btn {
  display: flex;
  margin-top: 10px;

  button {
    font-family: myfont, serif;
    font-size: 22px;
    height: 34px;
    width: 80px;
    background-color: rgba(255, 255, 255, 0.447);
    border: none;
    border-radius: 5px;
    color: #fff;
    cursor: pointer;
    margin-left: 250px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.694);
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

// 跳轉至登入
.already-signup {
  margin-top: 25px;
  color: #fff;

  a {
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

.cyo-ku {
  position: absolute;
  bottom: 5px;
  left: 250px;
  z-index: 10;
  .cyo-ku-img {
    width: 350px;
  }
}
</style>
