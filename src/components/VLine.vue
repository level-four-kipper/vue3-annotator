<template>
  <svg
    :id="svgId"
    ref="svgRef"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    :direction="direction"
    width="100%"
  >
    <g :transform="translate">
      <BaseRelation
        v-for="relation in lineRelations"
        :key="relation.relation.id"
        :dark="dark"
        :font-size="font.fontSize"
        :x1="relation.x1"
        :x2="relation.x2"
        :level="relation.level"
        :label="relation.label"
        :label-width="relation.labelWidth"
        :marker="relation.marker"
        :max-level="maxRelationLevel"
        :openLeft="relation.openLeft"
        :openRight="relation.openRight"
        :rtl="rtl"
        :margin="left"
        :selected="isSelectedRelation(relation.relation)"
        @click:relation="$emit('click:relation', $event, relation.relation)"
        @contextmenu:relation="$emit('contextmenu:relation', relation.relation)"
        @mouseover="$emit('setSelectedRelation', relation.relation)"
        @mouseleave="$emit('setSelectedRelation', null)"
      />
      <g :transform="translateEntity">
        <BaseText
          :id="basetextId"
          :text-line="textLine"
          :text="text"
          :x="baseX"
        />
        <BaseEntity
          v-for="gEntity in geometricEntities"
          :key="gEntity.entity.id"
          :ranges="gEntity.ranges"
          :color="color(gEntity.entity)"
          :label="labelText(gEntity.entity)"
          :label-entity="getLabelEntity(gEntity.entity)"
          :no-text="noText(gEntity.entity)"
          :rtl="rtl"
          :margin="left"
          :type="gEntity.entity.type"
          :level="gEntity.level"
          :font-size="font.fontSize"
          :selected="isSelectedEntity(gEntity.entity)"
          @click:entity="emit('click:entity', $event, gEntity.entity)"
          @contextmenu:entity="emit('contextmenu:entity', gEntity.entity)"
          @mouseover="emit('setSelectedEntity', gEntity.entity)"
          @mouseleave="emit('setSelectedEntity', null)"
        />
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
import BaseEntity from "./BaseEntity.vue";
import BaseRelation from "./BaseRelation.vue";
import BaseText from "./BaseText.vue";
import { Entity } from "@/models/Label/Entity";
import { RelationListItem } from "@/models/Label/Relation";
import { Font } from "@/models/Line/Font";
import { LabelList } from "@/models/Label/Label";
import { TextLine } from "@/models/Line/LineText";
import { EntityLine, GeometricEntity } from "@/models/Line/LineEntity";
import { RelationLine, LineRelation } from "@/models/Line/LineRelation";

const props = defineProps({
  annotatorUuid: {
    type: String,
    default: "",
  },
  entities: {
    type: Array,
    default: () => [],
  },
  relations: {
    type: Array,
    default: () => [],
  },
  textLine: {
    type: Object,
    required: true,
  },
  dark: {
    type: Boolean,
    default: false,
  },
  font: {
    type: Object,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  entityLabels: {
    type: Object,
    required: true,
  },
  relationLabels: {
    type: Object,
  },
  rtl: {
    type: Boolean,
    default: false,
  },
  baseX: {
    type: Number,
    default: 0,
  },
  left: {
    type: Number,
    default: 0,
  },
  right: {
    type: Number,
    default: 0,
  },
  selectedEntities: {
    type: Array,
    default: () => [],
  },
  selectedRelation: {
    type: Object,
    default: () => {},
  },
});

const emit = defineEmits([
  "click:entity",
  "contextmenu:entity",
  "setSelectedEntity",
  "select:text",
  "update:height",
]);

let element = ref(null);
let svgRef = ref(null);
const height = ref(0);
// =======================watch==================
watch(
  () => props.entities,
  () => {
    nextTick(() => {
      const svg = svgRef.value || document.getElementById(svgId.value);
      let newHight = svg.getBBox().height + 30;
      if (height.value !== newHight) {
        svg.setAttribute("style", `height: ${newHight}px`);
        emit("update:height", id.value, newHight);
      }
    });
  },
  { deep: true, immediate: true }
);

watch(
  () => props.textLine,
  () => {
    setElement();
  },
  { deep: true, immediate: true }
);

// =======================computed==================
const translate = computed(() => {
  return `translate(0, ${props.font.lineHeight})`;
});
const geometricEntities = computed(() => {
  if (element.value) {
    const view = new EntityLine(props.textLine, props.rtl);
    let lineEntitys = props.entities.filter((i) => i.type !== "background");
    let backgroundEntitys = props.entities.filter(
      (i) => i.type === "background"
    );
    let lineGeometricEntities = view.render(
      element.value,
      lineEntitys,
      props.entityLabels
    );
    let backgroundGeometricEntities = view.render(
      element.value,
      backgroundEntitys,
      props.entityLabels
    );
    return [...lineGeometricEntities, ...backgroundGeometricEntities];
  } else {
    return [];
  }
});

const lineRelations = computed(() => {
  const view = new RelationLine(
    props.relations,
    props.relationLabels,
    props.textLine,
    props.left,
    props.right
  );
  return view.render(geometricEntities.value, props.rtl);
});

const maxRelationLevel = computed(() => {
  return Math.max(...lineRelations.value.map((r) => r.level), 0);
});

const y = computed(() => {
  const level = Math.max(...lineRelations.value.map((item) => item.level));
  if (level < 0) {
    return 0;
  } else {
    return 20 + props.font.fontSize * (level + 1.5);
  }
});

const translateEntity = computed(() => {
  return `translate(0, ${y.value})`;
});

const direction = computed(() => {
  return props.rtl ? "rtl" : "ltr";
});

const id = computed(() => {
  return `${props.textLine.startOffset}:${props.textLine.endOffset}`;
});

const basetextId = computed(() => {
  return `basetext-${props.annotatorUuid}-${id.value}`;
});

const svgId = computed(() => {
  return `svg-${props.annotatorUuid}-${id.value}`;
});

function noText(entity) {
  // Do not show a label text if the entity continues from the previous line.
  return entity.startOffset < props.textLine.startOffset;
}

function setElement() {
  nextTick(() => {
    element.value = document.getElementById(basetextId.value);
    // console.log(basetextId.value, element.value, 'basetextId.value')
  });
}
function color(entity) {
  return props.entityLabels.getColor(entity.label) || entity.color;
}
function labelText(entity) {
  return props.entityLabels.getText(entity.label);
}

function getLabelEntity(entity) {
  return props.entityLabels.getById(entity.label) || {};
}
function isSelectedRelation(relation) {
  return props.selectedRelation === relation;
}

function isSelectedEntity(entity) {
  if (props.selectedRelation) {
    return props.selectedRelation.consistOf(entity);
  } else {
    return props.selectedEntities.filter((e) => e.id === entity.id).length > 0;
  }
}

/**获取选择区域的范围 */
function getSelectionRange(entity) {
  // const view = new EntityLine(props.textLine, props.rtl)
  // return view.createRanges(element.value, entity)
}

onMounted(() => {
  setElement();
});

defineExpose({ getSelectionRange });
</script>

<style lang="scss" scoped>
svg {
  overflow-wrap: normal;
}
</style>
