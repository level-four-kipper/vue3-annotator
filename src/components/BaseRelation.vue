<template>
  <g
    style="cursor: pointer; userselect: none"
    @click="$emit('click:relation', $event)"
    @contextmenu="$emit('contextmenu:relation')"
    @mouseover="$emit('mouseover')"
    @mouseleave="$emit('mouseleave')"
  >
    <path
      :d="d"
      v-bind="markerObj"
      stroke="#74b8dc"
      :stroke-width="width"
      fill="none"
    />
    <g v-if="x1">
      <rect
        :x="rectX"
        :y="rectY"
        :width="labelWidth"
        :height="fontSize"
        :fill="fill"
      />
      <text
        :x="center"
        :y="textY"
        fill="currentColor"
        text-anchor="middle"
        v-text="label"
      />
    </g>
  </g>
</template>

<script lang="ts" setup>
const props = defineProps({
  fontSize: {
    type: Number,
    required: true,
  },
  x1: {
    type: Number,
  },
  x2: {
    type: Number,
  },
  dark: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    required: true,
  },
  labelWidth: {
    type: Number,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
  openLeft: {
    type: Boolean,
    default: false,
  },
  openRight: {
    type: Boolean,
    default: false,
  },
  rtl: {
    type: Boolean,
    default: false,
  },
  margin: {
    type: Number,
    default: 0,
  },
  marker: {
    type: String,
  },
  maxLevel: {
    type: Number,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

const r: number = ref(12);
const y: number = computed(() => {
  return 20 + props.fontSize * props.maxLevel + props.fontSize / 2;
});
const d: string = computed(() => {
  let { openLeft, openRight } = props;
  if (openLeft && openRight) {
    return `M ${props.x1} ${y.value - dy.value - r.value}
        H ${props.x2}
        `;
  } else if (openLeft) {
    return `M ${props.x1} ${y.value - dy.value - r.value}
        H ${props.x2 - r.value}
        A ${r.value} ${r.value} 0 0 1 ${props.x2} ${lineY.value + r.value}
        v ${dy.value - 3}
        `;
  } else if (openRight) {
    return `M ${props.x1} ${y.value}
        v -${dy.value}
        A ${r.value} ${r.value} 0 0 1 ${props.x1 + r.value} ${lineY.value}
        H ${props.x2}
        `;
  } else {
    return `M ${props.x1} ${y.value}
        v -${dy.value}
        A ${r.value} ${r.value} 0 0 1 ${props.x1 + r.value} ${lineY.value}
        H ${props.x2 - r.value}
        A ${r.value} ${r.value} 0 0 1 ${props.x2} ${lineY.value + r.value}
        v ${dy.value - 3}
        `;
  }
});

const dy: number = computed(() => {
  return 20 + props.fontSize * props.level;
});

const center: number = computed(() => {
  return props.x1 + (props.x2 - props.x1) / 2;
});

const rectX: number = computed(() => {
  return props.x1 + (props.x2 - props.x1) / 2;
});

const rectY: number = computed(() => {
  return lineY.value - props.fontSize / 2;
});

const lineY: number = computed(() => {
  return y.value - dy.value - r.value;
});

const textY: number = computed(() => {
  return lineY.value + props.fontSize / 2 - 3;
});

const _x1: number = computed(() => {
  return props.x1 - props.margin;
});

const _x2: number = computed(() => {
  return props.x2 - props.margin;
});

const width: number = computed(() => {
  return props.selected ? 3 : 1;
});

const markerObj: object = computed(() => {
  if (props.marker === "start") {
    return { "marker-start": "url(#v-annotator-arrow)" };
  } else if (props.marker === "end") {
    return { "marker-end": "url(#v-annotator-arrow)" };
  } else {
    return {};
  }
});

const fill: string = computed(() => {
  return props.dark ? "#1E1E1E" : "white";
});
</script>
