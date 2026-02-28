<script lang="ts" setup>
import type { RoomInfo, Country, County, City, RoomTag } from '~/types';

// =============================================
// EditRoomModal — 編輯代購房間 Modal
// 接收目前房間資料作為初始值，送出 PUT 更新
// =============================================

const props = defineProps<{
  visible: boolean;
  /** 目前房間資料（用於預填欄位） */
  roomData: RoomInfo;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  /** 更新成功後通知父層刷新房間資料 */
  updated: [];
}>();

const config = useRuntimeConfig();
const { token } = useAuth();
const { uploadImage, isUploading } = useUpload();

// ── 表單資料（從 props 初始化） ───────────────
const form = reactive({
  Name: props.roomData.Name,
  Picture: props.roomData.Picture,
  CountryId: props.roomData.CountryId as number | '',
  CountyId: props.roomData.CountyId as number | '',
  CityId: props.roomData.CityId as number | '',
  TagId: props.roomData.TagId as number | '',
  MaxUsers: props.roomData.MaxUsers,
  Rule: props.roomData.Rule,
  R18: false,
});

// ── 地區選單資料 ──────────────────────────────
const countries = ref<Country[]>([]);
const counties = ref<County[]>([]);
const cities = ref<City[]>([]);
const tags = ref<RoomTag[]>([]);

// ── 圖片上傳 ─────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null);

const triggerFileInput = (): void => {
  fileInputRef.value?.click();
};

const handleFileChange = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    form.Picture = await uploadImage(file);
  } catch {
    console.error('招牌圖片上傳失敗');
  }
};

// ── 串聯選單 ─────────────────────────────────
const onCountryChange = async (): Promise<void> => {
  if (!form.CountryId) return;
  try {
    counties.value = await $fetch<County[]>(
      `${config.public.apiBase}/api/Counties/${form.CountryId}`,
    );
    cities.value = [];
    form.CountyId = '';
    form.CityId = '';
  } catch (err) {
    console.error('取得縣市列表失敗', err);
  }
};

const onCountyChange = async (): Promise<void> => {
  if (!form.CountyId) return;
  try {
    cities.value = await $fetch<City[]>(
      `${config.public.apiBase}/api/Cities/${form.CountyId}`,
    );
    form.CityId = '';
  } catch (err) {
    console.error('取得城市列表失敗', err);
  }
};

// ── 送出更新 ─────────────────────────────────
const isSubmitting = ref(false);

/** PUT 更新房間資料 */
const saveRoom = async (): Promise<void> => {
  isSubmitting.value = true;
  try {
    await $fetch(`${config.public.apiBase}/api/Rooms/${props.roomData.Id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        MaxUsers: form.MaxUsers,
        Name: form.Name,
        Picture: form.Picture,
        CountryId: Number(form.CountryId),
        CountyId: Number(form.CountyId),
        CityId: Number(form.CityId),
        TagId: Number(form.TagId),
        Rule: form.Rule,
        R18: form.R18,
      },
    });
    emit('updated');
    closeModal();
  } catch (err) {
    console.error('更新房間資料失敗', err);
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = (): void => {
  emit('update:visible', false);
};

// ── 初始化下拉資料 ────────────────────────────
onMounted(async () => {
  try {
    const [countryRes, tagRes, countyRes] = await Promise.all([
      $fetch<Country[]>(`${config.public.apiBase}/api/Countries`),
      $fetch<RoomTag[]>(`${config.public.apiBase}/api/Tags`),
      form.CountryId
        ? $fetch<County[]>(
            `${config.public.apiBase}/api/Counties/${form.CountryId}`,
          )
        : Promise.resolve([] as County[]),
    ]);
    countries.value = countryRes;
    tags.value = tagRes;
    counties.value = countyRes;

    if (form.CountyId) {
      cities.value = await $fetch<City[]>(
        `${config.public.apiBase}/api/Cities/${form.CountyId}`,
      );
    }
  } catch (err) {
    console.error('初始化編輯表單資料失敗', err);
  }
});
</script>

<template>
  <Teleport to="body">
    <div class="modale" :class="{ opened: visible }">
      <div class="modal-dialog">
        <div class="modal-header">
          <img src="/image/deco_cat-ribon.png" alt="" class="ribon001" />
          <h2 class="creatroom-title">
            <img src="/image/deco_cat.png" alt="" class="star001" />
            編輯房間
            <img src="/image/deco_cat.png" alt="" class="star001" />
          </h2>
        </div>

        <div class="modal-body">
          <div class="modal-body-l">
            <div class="room-name-group group-flex mb">
              <label>房名</label>
              <input v-model="form.Name" type="text" class="room-name" />
            </div>

            <div class="room-photo-group group-flex mb">
              <label>招牌圖片</label>
              <div class="room-img-wrapper" @click="triggerFileInput">
                <img
                  v-if="form.Picture"
                  :src="form.Picture"
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

            <div class="room-location-group group-flex mb">
              <label>所在地區</label>
              <div class="location-selects">
                <select v-model="form.CountryId" @change="onCountryChange">
                  <option
                    v-for="country in countries"
                    :key="country.Id"
                    :value="country.Id"
                  >
                    {{ country.Name }}
                  </option>
                </select>
                <select v-model="form.CountyId" @change="onCountyChange">
                  <option value="">不選 ☆彡</option>
                  <option
                    v-for="county in counties"
                    :key="county.Id"
                    :value="county.Id"
                  >
                    {{ county.Name }}
                  </option>
                </select>
                <select v-model="form.CityId">
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

            <div class="category-group group-flex mb">
              <label>代購種類</label>
              <select v-model="form.TagId">
                <option v-for="tag in tags" :key="tag.Id" :value="tag.Id">
                  {{ tag.Name }}
                </option>
              </select>
            </div>

            <div class="max-member group-flex mb">
              <label>最大人數</label>
              <select v-model="form.MaxUsers">
                <option :value="1">1</option>
                <option :value="2">2</option>
              </select>
            </div>

            <!--
              TODO ☆ 最低評價要求
              Vue2 原版的 select 無綁定（v-model 缺失）且後端 API 目前無此欄位
              確認 API 支援後補上 v-model="form.MinRating" 及選項值
            -->

            <ul class="access-checkgroup">
              <li class="r18-request">
                <input v-model="form.R18" type="checkbox" />
                <span>是否接受 R18 委託代購</span>
              </li>
            </ul>
          </div>

          <div class="modal-body-r">
            <label class="rule-title">房間規約</label>
            <textarea v-model="form.Rule" cols="30" rows="10" />
          </div>
        </div>

        <div class="modal-footer group-flex">
          <button class="btn-action" @click="closeModal">取消</button>
          <button
            class="btn-action btn-action--primary"
            :disabled="isSubmitting"
            @click="saveRoom"
          >
            {{ isSubmitting ? '儲存中…' : '確定' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
// 與 CreateRoomModal 共用同一套 Modal 視覺，保持一致
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
  input[type='text'] {
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
