<template>
  <text v-if="snippet" ref="textRef" fill="currentColor" style="white-space: pre">{{ snippet }} </text>
  <text v-else ref="textRef" style="font-size: 6px" fill="currentColor">⮐</text>
</template>

<script setup>
const props = defineProps({
  text: {
    type: String,
    default: '',
    required: true,
  },
  textLine: {
    type: Object,
    required: true,
  },
})

const textRef = ref('')
const snippet = computed(() => {
  return props.text.substring(props.textLine.startOffset, props.textLine.endOffset)
})

watch(
  props.textLine,
  () => {
    nextTick(() => {
      textRef.value.setAttribute('annotatorElement', JSON.stringify(props.textLine))
    })
  },
  {
    immediate: true,
  },
)

function x(x) {
  return x - props.margin
}
</script>

<style lang="scss" scoped>
text {
  white-space: pre;
}
</style>
