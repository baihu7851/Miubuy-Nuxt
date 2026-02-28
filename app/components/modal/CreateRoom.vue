<script lang="ts" setup>
import type { Country, County, City, RoomTag } from '~/types';

//☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆
// CreateRoomModal — 新增代購房間 Modal ★
// v-model:visible で表示 / 非表示を制御
// jQuery の class 切換えから脱却！(´ω｀)
//☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆.｡.:*・ﾟ ☆

const props = defineProps<{
  /** 控制 Modal 是否顯示 */
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  /** 建立成功後傳回新房間 ID */
  created: [roomId: number];
}>();

const config = useRuntimeConfig();
const { token } = useAuth();
const { uploadImage, isUploading } = useUpload();
const router = useRouter();

//☆=========== 表單資料 ===========☆
const roomInfo = reactive({
  MaxUsers: 1,
  Name: '',
  Picture: '' as string,
  CountryId: '' as number | '',
  CountyId: '' as number | '',
  CityId: '' as number | '',
  TagId: '' as number | '',
  Rule: '',
  R18: false,
});

//☆=========== 地區選單資料 ===========☆
const countries = ref<Country[]>([]);
const counties = ref<County[]>([]);
const cities = ref<City[]>([]);
const tags = ref<RoomTag[]>([]);

//☆=========== 圖片上傳 ===========☆
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
    roomInfo.Picture = await uploadImage(file);
  } catch {
    console.error('招牌圖片上傳失敗');
  }
};

//☆=========== 串聯選單 ===========☆
/** 選擇國家後載入縣市 */
const onCountryChange = async (): Promise<void> => {
  if (!roomInfo.CountryId) return;
  try {
    counties.value = await $fetch<County[]>(
      `${config.public.apiBase}/api/Counties/${roomInfo.CountryId}`,
    );
    cities.value = [];
    roomInfo.CountyId = '';
    roomInfo.CityId = '';
  } catch (err) {
    console.error('取得縣市列表失敗', err);
  }
};

/** 選擇縣市後載入城市 */
const onCountyChange = async (): Promise<void> => {
  if (!roomInfo.CountyId) return;
  try {
    cities.value = await $fetch<City[]>(
      `${config.public.apiBase}/api/Cities/${roomInfo.CountyId}`,
    );
    roomInfo.CityId = '';
  } catch (err) {
    console.error('取得城市列表失敗', err);
  }
};

//☆=========== 提交 ===========☆
const isSubmitting = ref(false);

/** 送出建立房間請求 */
const createRoom = async (): Promise<void> => {
  if (!roomInfo.Name || !roomInfo.CountryId || !roomInfo.TagId) {
    console.warn('房名、地區、種類為必填');
    return;
  }

  isSubmitting.value = true;
  try {
    const roomId = await $fetch<number>(`${config.public.apiBase}/api/Rooms`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        MaxUsers: roomInfo.MaxUsers,
        Name: roomInfo.Name,
        Picture: roomInfo.Picture,
        CountryId: Number(roomInfo.CountryId),
        CountyId: Number(roomInfo.CountyId),
        CityId: Number(roomInfo.CityId),
        TagId: Number(roomInfo.TagId),
        Rule: roomInfo.Rule,
        R18: roomInfo.R18,
      },
    });
    emit('created', roomId);
    closeModal();
    router.push(`/chatroom/${roomId}`);
  } catch (err) {
    console.error('建立房間失敗', err);
  } finally {
    isSubmitting.value = false;
  }
};

/** 關閉 Modal */
const closeModal = (): void => {
  emit('update:visible', false);
};

//☆=========== 初始化資料 ===========☆
onMounted(async () => {
  try {
    const [countryRes, tagRes] = await Promise.all([
      $fetch<Country[]>(`${config.public.apiBase}/api/Countries`),
      $fetch<RoomTag[]>(`${config.public.apiBase}/api/Tags`),
    ]);
    countries.value = countryRes;
    tags.value = tagRes;
  } catch (err) {
    console.error('初始化房間表單資料失敗', err);
  }
});
</script>

<template>
  <!--☆.｡.:*・ﾟ 新增代購房間 Modal ☆.｡.:*・ﾟ-->
  <Teleport to="body">
    <div class="modale" :class="{ opened: visible }" aria-hidden="true">
      <div class="modal-dialog">
        <!--☆=== Modal Header ===☆-->
        <div class="modal-header">
          <img src="/image/deco_cat-ribon.png" alt="" class="ribon001" />
          <h2 class="creatroom-title">
            <img src="/image/deco_cat.png" alt="" class="star001" />
            新增房間
            <img src="/image/deco_cat.png" alt="" class="star001" />
          </h2>
        </div>

        <!--☆=== Modal Body ===☆-->
        <div class="modal-body">
          <div class="modal-body-l">
            <!--☆ 房名 ☆-->
            <div class="room-name-group group-flex mb">
              <label>房名</label>
              <input v-model="roomInfo.Name" type="text" class="room-name" />
            </div>

            <!--☆ 招牌圖片 ☆-->
            <div class="room-photo-group group-flex mb">
              <label>招牌圖片</label>
              <div class="room-img-wrapper" @click="triggerFileInput">
                <img
                  v-if="roomInfo.Picture"
                  :src="roomInfo.Picture"
                  class="room-img"
                  alt="招牌圖片"
                />
                <div v-else class="room-img room-img--empty">
                  <span>{{ isUploading ? '上傳中…' : '點擊上傳' }}</span>
                </div>
              </div>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden-file-input"
                @change="handleFileChange"
              />
            </div>

            <!--☆ 所在地區（三層串聯）☆-->
            <div class="room-location-group group-flex mb">
              <label>所在地區</label>
              <div class="location-selects">
                <select v-model="roomInfo.CountryId" @change="onCountryChange">
                  <option value="" disabled>( ^ω^ )</option>
                  <option
                    v-for="country in countries"
                    :key="country.Id"
                    :value="country.Id"
                  >
                    {{ country.Name }}
                  </option>
                </select>
                <select v-model="roomInfo.CountyId" @change="onCountyChange">
                  <option value="">不選 ☆彡</option>
                  <option
                    v-for="county in counties"
                    :key="county.Id"
                    :value="county.Id"
                  >
                    {{ county.Name }}
                  </option>
                </select>
                <select v-model="roomInfo.CityId">
                  <option value="">不選 ☆彡</option>
                  <option
                    v-for="city in cities"
                    :key="city.Id"
                    :value="city.Id"
                  >
                    {{ city.Name }}
                  </option>
                </select>
              </div>
            </div>

            <!--☆ 代購種類 ☆-->
            <div class="category-group group-flex mb">
              <label>代購種類</label>
              <select v-model="roomInfo.TagId">
                <option value="" disabled>選擇 Tag</option>
                <option v-for="tag in tags" :key="tag.Id" :value="tag.Id">
                  {{ tag.Name }}
                </option>
              </select>
            </div>

            <!--☆ 最大人數 ☆-->
            <div class="max-member group-flex mb">
              <label>最大人數</label>
              <select v-model="roomInfo.MaxUsers">
                <option :value="1">1</option>
              </select>
            </div>

            <!--
              TODO ☆ 最低評價要求
              Vue2 原版的 select 無綁定（v-model 缺失）且後端 API 目前無此欄位
              確認 API 支援後補上 v-model="roomInfo.MinRating" 及選項值
            -->

            <!-- R18 -->
            <ul class="access-checkgroup">
              <li class="r18-request">
                <input v-model="roomInfo.R18" type="checkbox" />
                <span>是否接受 R18 委託代購</span>
              </li>
            </ul>
          </div>

          <!--☆=== 房間規約 ===☆-->
          <div class="modal-body-r">
            <label class="rule-title">房間規約</label>
            <textarea v-model="roomInfo.Rule" cols="30" rows="10" />
          </div>
        </div>

        <!--☆=== Modal Footer ===☆-->
        <div class="modal-footer group-flex">
          <button class="btn-action" @click="closeModal">取消</button>
          <button
            class="btn-action btn-action--primary"
            :disabled="isSubmitting"
            @click="createRoom"
          >
            {{ isSubmitting ? '建立中…' : '建立' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
//☆=========== Modal 遮罩 ===========☆
.modale::before {
  content: '';
  display: none;
  background: rgba(0, 0, 0, 0.6);
  position: fixed;
  inset: 0;
  z-index: 10;
}

.opened::before {
  display: block;
}

.opened .modal-dialog {
  transform: translateX(-20%);
  top: 15%;
}

//☆=========== Modal 對話框 ===========☆
.modal-dialog {
  background: $color-header;
  border: #4e4b4b solid 2px;
  border-radius: 8px;
  margin-left: -200px;
  position: fixed;
  left: 50%;
  top: -100%;
  z-index: 11;
  width: 680px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  transform: translate(0, -500%);
  transition: transform 0.3s ease-out;
  overflow: initial;
}

//☆=========== Header ===========☆
.modal-header {
  position: relative;
}

.ribon001 {
  position: absolute;
  width: 90px;
  top: -40px;
  left: 0;
}

.creatroom-title {
  font-family: myfont, japanese-font, serif;
  font-size: 24px;
  margin: 15px 0;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;

  .star001 {
    margin-left: 8px;
    width: 30px;
  }
}

//☆=========== Body ===========☆
.modal-body {
  display: flex;
  justify-content: center;
  background-color: #fff;
  padding: 25px;
  height: 400px;
  overflow-y: auto;

  label {
    color: $color-brown;
    margin-right: 15px;
    font-size: 20px;
    font-family: myfont, japanese-font, serif;
  }

  input[type='text'],
  input[type='checkbox'] {
    height: 28px;
    border: none;
    border-bottom: 2px solid lighten($color-brown, 10%);
    font-size: 20px;
    padding-left: 8px;
    font-family: myfont, japanese-font, serif;
    color: $color-brown;
  }

  select {
    height: 28px;
    font-family: japanese-font, myfont, serif;
    color: $color-brown;
    border: none;
    margin-right: 8px;
    font-size: 18px;
    border-bottom: 2px solid $color-brown;
  }
}

.modal-body-l {
  margin-right: 25px;
}

.modal-body-r {
  margin-left: 25px;

  textarea {
    resize: none;
    white-space: pre-wrap;
    padding: 10px;
    font-family: myfont, japanese-font, serif;
    color: $color-brown;
    font-size: 18px;

    &:focus {
      outline: none;
    }
  }

  .rule-title {
    margin-bottom: 15px;
  }
}

.group-flex {
  display: flex;
  align-items: center;
}

.mb {
  margin-bottom: 14px;
}

//☆=========== 圖片上傳 ===========☆
.room-img-wrapper {
  cursor: pointer;
}

.room-img {
  width: 200px;
  height: 100px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  object-fit: cover;

  &--empty {
    background-image: url('/image/addPicture.png');
    background-size: cover;

    span {
      color: $color-brown;
      font-size: 16px;
    }
  }
}

.room-name {
  width: 70%;
}

.location-selects {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.hidden-file-input {
  display: none;
}

//☆=========== R18 ===========☆
.r18-request {
  display: flex;
  align-items: center;

  span {
    margin-left: 10px;
    font-size: 20px;
    font-family: myfont, japanese-font, serif;
    color: $color-brown;
  }
}

//☆=========== Footer ===========☆
.modal-footer {
  margin: 10px 10px 10px 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.btn-action {
  height: 38px;
  margin-left: 10px;
  width: 80px;
  font-family: myfont, japanese-font, serif;
  font-size: 20px;
  color: #fff;
  background-color: $color-brown;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: lighten($color-brown, 10%);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--primary {
    background-color: darken($color-header, 10%);
    &:hover {
      background-color: darken($color-header, 15%);
    }
  }
}
</style>
