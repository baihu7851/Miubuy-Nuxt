<script lang="ts" setup>
import Swal from 'sweetalert2';

// =============================================
// mypage/info.vue — 個人資料編輯
// 取代 vue-core-image-upload + window.location.reload()
// =============================================
definePageMeta({ middleware: 'auth' });

const config = useRuntimeConfig();
const { token, userId, fetchUserInfo } = useAuth();
const { uploadImage, isUploading } = useUpload();

const account = ref('');
const form = reactive({
  Nickname: '',
  Email: '',
  Phone: '',
  Password: '',
  RePass: '',
  Picture: '' as string,
});

onMounted(async () => {
  if (!userId.value) return;
  try {
    const data = await $fetch<{
      Account: string;
      Nickname: string;
      Email: string;
      Phone: string;
      Picture: string;
    }>(`${config.public.apiBase}/api/Users/${userId.value}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    account.value = data.Account;
    form.Nickname = data.Nickname;
    form.Email = data.Email;
    form.Phone = data.Phone;
    form.Picture = data.Picture ?? '';
  } catch (err) {
    console.error('取得個人資料失敗', err);
  }
});

const fileInputRef = ref<HTMLInputElement | null>(null);
const triggerFileInput = () => fileInputRef.value?.click();

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    form.Picture = await uploadImage(file);
  } catch {
    console.error('頭像上傳失敗');
  }
};

const isSubmitting = ref(false);

/** PUT 更新個人資料，成功後刷新全域 auth 而非 reload */
const submitInfo = async () => {
  isSubmitting.value = true;
  try {
    await $fetch(`${config.public.apiBase}/api/Users/${userId.value}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        Id: userId.value,
        Account: account.value,
        Password: form.Password,
        Email: form.Email,
        Nickname: form.Nickname,
        Phone: form.Phone,
        Picture: form.Picture,
      },
    });
    await fetchUserInfo();
    await Swal.fire({
      position: 'center',
      icon: 'success',
      title: '個人資料更改成功★',
      showConfirmButton: false,
      timer: 2000,
    });
  } catch (err) {
    console.error('更新個人資料失敗', err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="mypage-content">
    <div class="deco01">
      <img src="/image/deco_cat-ribon.png" alt="" class="deco-cat-ribon" />
    </div>
    <div class="deco02">
      <img src="/image/deco_cat.png" alt="" width="40px" />
    </div>
    <div class="deco03">
      <img src="/image/user_info.png" alt="" class="user-info-icon" />
    </div>

    <div class="myinfo-content">
      <!-- 右欄表單 -->
      <div class="myinfo-right-content">
        <div class="myinfo-form">
          <!-- 頭像 -->
          <div class="my-photo" @click="triggerFileInput">
            <img
              v-if="form.Picture"
              :src="form.Picture"
              class="myphoto"
              alt="頭像"
            />
            <h3>{{ isUploading ? '上傳中…' : '上傳(jpg)' }}</h3>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden-file-input"
              @change="handleFileChange"
            />
          </div>

          <div class="info-group">
            <label>修改密碼</label>
            <input
              v-model="form.Password"
              type="password"
              autocomplete="new-password"
              placeholder="要打密碼唷☆"
            />
          </div>
          <div class="info-group">
            <label>確認密碼</label>
            <input
              v-model="form.RePass"
              type="password"
              autocomplete="new-password"
            />
          </div>
          <div class="myinfo-hr" />
          <div class="info-group">
            <label>匿稱</label>
            <input v-model="form.Nickname" type="text" />
          </div>
          <div class="info-group">
            <label>信箱</label>
            <input v-model="form.Email" type="email" />
          </div>
          <div class="info-group">
            <label>手機</label>
            <input v-model="form.Phone" type="text" />
          </div>

          <h3
            class="form-submit"
            :class="{ disabled: isSubmitting }"
            @click="submitInfo"
          >
            {{ isSubmitting ? '…' : '送出' }}
          </h3>
        </div>
      </div>

      <!--☆=== 左欄：我的評價 ===☆-->
      <!--
        TODO ☆ 我的評價列表
        Vue2 原版此區塊同樣為空殼（只有標題裝飾）
        待確認評價 API（GET /api/Ratings/me 或類似）後實作：
        - 顯示其他使用者給我的星等與留言
        - 可使用 StarRating component 呈現
      -->
      <div class="myinfo-left-content">
        <img
          src="/image/line-style2.png"
          alt=""
          width="25px"
          class="line-style2"
        />
        <img
          src="/image/star-wing-icon.png"
          alt=""
          width="45px"
          class="star-wing-icon"
        />
        <h3 class="myreview-title">( °ω°) 我的評價 ♪</h3>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}
.mypage-content {
  font-family: myfont, japanese-font, serif;
  color: darken($color-brown, 10%);
  position: relative;
  background-color: $color-brown;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid darken($color-brown, 10%);
  margin: 20px;
  margin-top: 10px;
}
.deco01 {
  position: absolute;
  top: -40px;
  left: -30px;
  z-index: 99;
}
.deco02 {
  position: absolute;
  bottom: -10px;
  right: -15px;
  z-index: 99;
}
.deco03 {
  position: absolute;
  top: -84px;
  left: 80px;
  z-index: 99;
}
.deco-cat-ribon {
  width: 100px;
}
.user-info-icon {
  width: 250px;
}
.myinfo-content {
  display: flex;
}
.myinfo-right-content {
  padding: 20px;
  flex: 1;
}
.myinfo-form {
  margin-top: 5px;
  position: relative;
  label {
    font-size: 22px;
    color: #fff;
  }
}
.myinfo-hr {
  background-image: url('/image/heart-line.png');
  background-size: cover;
  height: 16px;
  width: 60%;
  margin-bottom: 16px;
  transform: translateY(-3px);
}
.info-group {
  display: flex;
  margin-bottom: 16px;
  input {
    margin-left: 10px;
    height: 28px;
    width: 40%;
    border: none;
    border-radius: 5px;
    padding-left: 7px;
    font-family: myfont, japanese-font, serif;
    font-size: 22px;
    color: $color-brown;
    &::placeholder {
      color: $color-brown;
      font-size: 20px;
    }
  }
}
.my-photo {
  position: absolute;
  width: 100px;
  height: 100px;
  background-color: rgba($color-header, 0.6);
  border-radius: 100%;
  right: 30px;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  h3 {
    color: #fff;
    font-size: 16px;
  }
  .myphoto {
    width: 100px;
    height: 100px;
    border: 1px solid $color-brown;
    border-radius: 100%;
    position: absolute;
    z-index: 1;
    object-fit: cover;
  }
  &:hover {
    background-color: rgba($color-header, 1);
  }
}
.hidden-file-input {
  display: none;
}
.form-submit {
  background-color: $color-cat;
  height: 32px;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  position: absolute;
  right: 40px;
  bottom: -20px;
  font-size: 24px;
  cursor: pointer;
  &:hover {
    background-color: $color-header;
    color: #fff;
  }
  &.disabled {
    opacity: 0.6;
    pointer-events: none;
  }
}
.myinfo-left-content {
  position: relative;
  background-color: $color-cat;
  flex: 1;
  border-radius: 8px;
  z-index: 2;
  padding: 10px;
}
.star-wing-icon {
  position: absolute;
  top: -12px;
  left: -20px;
}
.line-style2 {
  position: absolute;
  top: 40px;
  left: -35px;
}
.myreview-title {
  font-size: 24px;
  display: flex;
  justify-content: center;
  color: lighten($color-brown, 2%);
  margin-top: 5px;
}
</style>
