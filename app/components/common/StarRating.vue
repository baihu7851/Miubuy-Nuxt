<script lang="ts" setup>
// =============================================
// StarRating — 星評元件
// 支援唯讀顯示與互動評分兩種模式
// =============================================

const props = withDefaults(defineProps<{
  /** 目前分數（0–5） */
  modelValue: number
  /** 是否為唯讀（僅顯示，不可互動） */
  readonly?: boolean
  /** 星星數量 */
  count?: number
}>(), {
  readonly: false,
  count: 5,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

/** 懸停中的分數（互動模式用） */
const hoverValue = ref(0)

/**
 * 判斷第 index 顆星是否應填滿
 * @param index 星星索引（1 起）
 */
const isFilled = (index: number): boolean => {
  const current = props.readonly ? props.modelValue : (hoverValue.value || props.modelValue)
  return index <= current
}

/**
 * 點擊星星時發出新分數
 * @param value 點擊的星星分數
 */
const handleClick = (value: number): void => {
  if (props.readonly) return
  emit('update:modelValue', value)
}
</script>

<template>
  <!-- 星評元件：唯讀或互動 -->
  <div class="star-rating" :class="{ 'star-rating--readonly': readonly }">
    <span
      v-for="i in count"
      :key="i"
      class="star"
      :class="{ 'star--filled': isFilled(i) }"
      @mouseenter="!readonly && (hoverValue = i)"
      @mouseleave="!readonly && (hoverValue = 0)"
      @click="handleClick(i)"
    >★</span>
  </div>
</template>

<style lang="scss" scoped>
.star-rating {
  display: inline-flex;
  gap: 2px;
}

.star {
  font-size: 24px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.15s;

  &--filled {
    color: $color-yellow;
  }
}

.star-rating--readonly .star {
  cursor: default;
}
</style>
