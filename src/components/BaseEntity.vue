<template>
  <g @mouseover="emit('mouseover')" @mouseleave="emit('mouseleave')">
    <template v-for="([x1, x2], index) in coordinates" :key="index">
      <BaseEntityLine
        v-if="type == 'line'"
        :x1="x1"
        :x2="x2"
        :y="lineY"
        :color="color"
        :height="height"
      />
      <BaseEntityBackground
        v-else
        :x1="x1"
        :x2="x2"
        :color="color"
        :opacity="opacity"
      />
    </template>
    <BaseEntityText
      v-if="!noText && type !== 'background'"
      :r="r"
      :x="textX"
      :y="textY"
      :dx="dx"
      :rtl="rtl"
      :text="label"
      :label="labelEntity?.text"
      :color="color"
      @click:entity="emit('click:entity', $event)"
      @contextmenu:entity="emit('contextmenu:entity')"
    />
  </g>
</template>

<script setup>
import BaseEntityText from "./BaseEntityText.vue";
import BaseEntityBackground from "./BaseEntityBackground.vue";
import BaseEntityLine from "./BaseEntityLine.vue";
import config from "@/models/Config/Config";

const props = defineProps({
  ranges: {
    type: Object,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  noText: {
    type: Boolean,
    required: false,
  },
  label: {
    type: String,
    required: true,
  },
  rtl: {
    type: Boolean,
    default: false,
  },
  margin: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 0,
  },
  fontSize: {
    type: Number,
    default: 17,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  // line | background
  type: {
    type: String,
    default: "line",
  },

  labelEntity: {
    type: Object,
    default: () => {},
  },
});
const emit = defineEmits(["click:entity", "contextmenu:entity", "mouseleave"]);

// =======================computed==================
const dx = computed(() => {
  return props.rtl ? -config.labelMargin : config.labelMargin;
});
const r = computed(() => {
  return config.radius;
});
const height = computed(() => {
  return props.selected ? config.lineWidth * 1.5 : config.lineWidth;
});
const opacity = computed(() => {
  return props.selected ? 0.7 : 0.3;
});
const textX = computed(() => {
  if (props.rtl) {
    return x(props.ranges.first.x2);
  } else {
    return x(props.ranges.first.x1);
  }
});
const textY = computed(() => {
  const marginTop = 5;
  return lineY.value + props.fontSize / 2 + marginTop;
});
const lineY = computed(() => {
  const marginBottom = 8;
  return (
    config.lineWidth +
    (config.lineWidth + props.fontSize + marginBottom) * props.level
  );
});

const coordinates = computed(() => {
  return props.ranges.items.map((range) => [x(range.x1), x(range.x2)]);
});
// =======================function==================

function x(x) {
  return x - props.margin;
}
</script>

<style lang="scss" scoped>
svg {
  overflow-wrap: normal;
}
</style>
