<template>
  <div
    :id="`container-${uid}`"
    class="v-annotator-container"
    @click="open"
    @touchend="open"
  >
    <!-- <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="0" height="0">
      <defs>
        <marker id="v-annotator-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" stroke="#74b8dc" fill="#74b8dc" />
        </marker>
      </defs>
    </svg> -->
    <RecycleScroller page-mode class="scroller" :items="items">
      <template #default="{ item, index }">
        <VLine
          :key="`${index}:${rtl}`"
          :annotator-uuid="uid"
          :dark="dark"
          :entities="
            entityList?.filterByRange(
              item.textLine.startOffset,
              item.textLine.endOffset
            )
          "
          :entity-labels="entityLabelList"
          :relations="
            relationList?.filterByRange(
              item.textLine.startOffset,
              item.textLine.endOffset
            )
          "
          :max-label-length="maxLabelLength"
          :relation-labels="relationLabelList"
          :font="font"
          :rtl="rtl"
          :selected-entities="highlightedEntities"
          :selected-relation="selectedRelation"
          :text="text"
          :text-line="item.textLine"
          :base-x="baseX"
          :left="left"
          :right="right"
          @select:text="selecText"
          @click:entity="clicked"
          @click:relation="onRelationClicked"
          @contextmenu:entity="emit('contextmenu:entity', $event)"
          @contextmenu:relation="emit('contextmenu:relation', $event)"
          @update:height="updateHeight"
          @setSelectedEntity="selectedEntity = $event"
          @setSelectedRelation="selectedRelation = $event"
        />
      </template>
    </RecycleScroller>

    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="0" height="0">
      <text :id="`text-${uid}`" style="white-space: pre" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { debounce } from "lodash-es";
import { uuid } from "@/utils/uuid.js";
import VLine from "@/components/VLine.vue";
import { RecycleScroller } from "vue-virtual-scroller";
import { Text } from "@/models/Label/Text";
import { widthOf } from "@/models/Line/Utils";
import { Font } from "@/models/Line/Font";
import { LineWidthManager } from "@/models/Line/WidthManager";
import { TextLine } from "@/models/Line/LineText";
import { TextLineSplitter } from "@/models/Line/LineSplitter";
import { TextSelector } from "@/models/EventHandler/TextSelectionHandler";
import { Relation, RelationList } from "@/models/Label/Relation";
import { Entities, Entity } from "@/models/Label/Entity";
import {
  Label,
  LabelList,
  EntityLabelListItem,
  RelationLabelListItem,
} from "@/models/Label/Label";

const props = defineProps({
  maxLabelLength: {
    type: Number,
    default: 12,
  },
  text: {
    type: String,
    default: "",
  },
  entities: {
    type: Array,
    default: () => [],
  },
  entityLabels: {
    type: Array,
    default: () => [],
  },
  relations: {
    type: Array,
    default: () => [],
  },
  relationLabels: {
    type: Array,
    default: () => [],
  },
  allowOverlapping: {
    type: Boolean,
    default: false,
  },
  rtl: {
    type: Boolean,
    default: false,
  },
  graphemeMode: {
    type: Boolean,
    default: true,
  },
  dark: {
    type: Boolean,
    default: false,
  },
  selectedEntities: {
    type: Array,
    default: () => [],
  },
  // 是否允许标签重复
  isAllowRepeat: {
    type: Boolean,
    default: true,
  },
});

let uid = uuid();
let font = ref(null);
let heights = ref({});
let maxWidth = ref(-1);
let baseX = ref(0);
let left = ref(0);
let right = ref(0);
let textElement = ref(null);
let selectedRelation = ref(null);
let selectedEntity = ref(null);
const emit = defineEmits([
  "click:entity",
  "click:relation",
  "add:entity",
  "contextmenu:entity",
  "contextmenu:relation",
  "select:text",
]);

// =======================computed=====================
const _text = computed(() => {
  return new Text(props.text);
});

const entityLabelList = computed(() => {
  if (textElement.value) {
    const widths = props.entityLabels.map((label) =>
      widthOf(label.text, textElement.value)
    );
    return LabelList.valueOf(
      props.maxLabelLength,
      props.entityLabels,
      widths,
      EntityLabelListItem
    );
  } else {
    return null;
  }
});

const relationLabelList = computed(() => {
  if (textElement.value) {
    const widths = props.relationLabels.map((label) =>
      widthOf(label.text, textElement.value)
    );
    return LabelList.valueOf(
      props.maxLabelLength,
      props.relationLabels,
      widths,
      RelationLabelListItem
    );
  } else {
    return null;
  }
});

const items = computed(() => {
  if (!textLines.value) {
    return [];
  }
  const viewLines = [];
  for (let i = 0; i < textLines.value.length; i++) {
    const id = `${textLines.value[i].startOffset}:${textLines.value[i].endOffset}`;
    viewLines.push({
      id,
      textLine: textLines.value[i],
      size: heights.value[id] || 64,
    });
  }
  return viewLines;
});

const entityList = computed(() => {
  resetSelection();
  if (props.graphemeMode) {
    return Entities.valueOf(props.entities, _text.value);
  } else {
    return Entities.valueOf(props.entities);
  }
});

const relationList = computed(() => {
  resetSelection();
  return new RelationList(props.relations, entityList.value);
});

const textLines = computed(() => {
  if (!font.value || !entityLabelList.value || maxWidth.value === -1) {
    return [];
  } else {
    const maxLabelWidth = entityLabelList.value.maxLabelWidth;
    const calculator = new LineWidthManager(maxWidth.value, maxLabelWidth);
    const splitter = new TextLineSplitter(calculator, font.value);
    return splitter.split(_text.value);
  }
});

const highlightedEntities = computed(() => {
  if (selectedEntity.value) {
    return props.selectedEntities.concat(selectedEntity.value);
  } else {
    return props.selectedEntities;
  }
});

// =======================watch=====================
watch(
  () => props.text,
  () => {
    heights.value = {};
    nextTick(() => {
      if (textElement.value) {
        font.value = Font.create(props.text, textElement.value);
      }
    });
  },
  { immediate: true }
);

watch(
  () => props.rtl,
  () => {
    setMaxWidth();
  }
);

// =======================function=====================
function selecText(event, entity) {
  emit("select:text", event, entity.id);
}

function clicked(event, entity) {
  emit("click:entity", event, entity.id);
}

function onRelationClicked(event, relation) {
  emit("click:relation", event, relation);
}

function setMaxWidth() {
  nextTick(
    debounce(() => {
      const containerElement = document.getElementById(`container-${uid}`);
      if (!containerElement) return;
      maxWidth.value = containerElement.clientWidth;
      const rect = containerElement.getBoundingClientRect();
      left.value = rect.left;
      right.value = rect.right - rect.left;
      baseX.value = !props.rtl ? 0 : right.value;
    }, 500)
  );
}

function updateHeight(id, height) {
  heights.value[id] = height;
}
function resetSelection() {
  selectedRelation.value = null;
  selectedEntity.value = null;
}

function open(event) {
  try {
    const selector = new TextSelector(
      props.allowOverlapping,
      props.graphemeMode
    );
    const [startOffset, endOffset, isValid] = selector.getOffsets(
      entityList.value,
      _text.value
    );
    if (startOffset === endOffset) return;
    if (props.isAllowRepeat || isValid) {
      if (!isNaN(startOffset) && !isNaN(endOffset)) {
        emit("add:entity", event, startOffset, endOffset);
      }
    }
  } catch (e) {
    return;
  }
}

onMounted(() => {
  textElement.value = document.getElementById(`text-${uid}`);
  window.addEventListener("resize", setMaxWidth);
  setMaxWidth();
  nextTick(() => {});
});

onUnmounted(() => window.removeEventListener("resize", setMaxWidth));

// defineExpose({ getSelectionRange })
</script>

<style lang="scss" scoped>
.v-annotator-container {
  height: 100%;
  width: 100%;
}
.scroller >>> .vue-recycle-scroller__item-wrapper {
  height: 100vh;
}
</style>
