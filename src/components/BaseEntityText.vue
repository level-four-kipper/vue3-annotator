<template>
  <g style="cursor: pointer; user-select: none" @click="emit('click:entity', $event)" @contextmenu.prevent="emit('contextmenu:entity')">
    <circle :r="r" :fill="color" :cx="cx" :cy="y" />
    <text :x="x" :y="y" fill="currentColor" :dx="dx" dy="0.35em">
      {{ text }}
      <!-- 悬停时显示 -->
      <title>单击标签可进行修改</title>
    </text>
  </g>
</template>

<script setup>
const props = defineProps({
  r: {
    type: Number,
    required: true,
  },
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  dx: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  // 展示的文本
  text: {
    type: String,
    required: true,
  },
  rtl: {
    type: Boolean,
    default: false,
  },
  // 标签
  label: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['contextmenu:entity', 'click:entity'])
// =======================computed==================
const cx = computed(() => {
  return props.rtl ? props.x - props.r : props.x + props.r
})
</script>
