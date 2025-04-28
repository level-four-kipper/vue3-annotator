<template>
  <line :x1="_x1" :y1="y" :x2="_x2" :y2="y" :stroke="color" :stroke-width="height" stroke-linecap="round" />
</template>

<script setup>
const props = defineProps({
  x1: {
    type: Number,
  },
  x2: {
    type: Number,
  },
  y: {
    type: Number,
  },
  height: {
    type: Number,
    default: 5,
  },
  color: {
    type: String,
  },
})

// =======================computed==================
const _x1 = computed(() => {
  const x = props.x1 < props.x2 ? props.x1 : props.x2
  return x + props.height / 2
})
const _x2 = computed(() => {
  const x = props.x1 < props.x2 ? props.x2 : props.x1
  return x - props.height / 2
})
</script>

<style lang="scss" scoped>
svg {
  overflow-wrap: normal;
}
</style>
