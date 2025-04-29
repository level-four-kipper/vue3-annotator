<template>
  <div id="app" style="width: 1000px; background-color: #eee">
    <button @click="changeText">Change text</button>
    <button @click="resetEntity">Reset entity</button>
    <button @click="changeLabel">Change label</button>
    <button @click="rtl = !rtl">Change RTL{{ rtl }}</button>
    <button @click="allowOverlapping = !allowOverlapping">
      Allow overlapping({{ allowOverlapping }})
    </button>
    <button @click="addRelation">Add relation</button>

    <div style="width: 600px; display: inline-block">
      <v-annotator
        :allow-overlapping="allowOverlapping"
        :text="text"
        :entity-labels="entityLabels"
        :entities="entities"
        :relations="relations"
        :relation-labels="relationLabels"
        :rtl="rtl"
        :selected-entities="selectedEntities"
        @add:entity="addEntity"
        @click:entity="updateEntity"
        @click:relation="updateRelation"
        @contextmenu:entity="deleteEntity"
        @contextmenu:relation="deleteRelation"
      />
    </div>
    <div style="width: 400px; display: inline-block">
      <v-annotator
        :allow-overlapping="allowOverlapping"
        :text="text2"
        :entities="entities2"
        :entity-labels="entityLabels"
        :grapheme-mode="graphemeMode"
        :relations="relations2"
        :relation-labels="relationLabels"
        :rtl="rtl"
        @add:entity="addEntity2"
        @contextmenu:entity="deleteEntity2"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VAnnotator } from "vue3-annotator";
// import VAnnotator from "./components/VAnnotator.vue";
// import { Entity } from "./models/Label/Entity";
// import { Relation } from "./models/Label/Relation";

interface EntityI {
  id: number;
  user: number;
  label: number;
  startOffset: number;
  endOffset: number;
}

let allowOverlapping = false;
let graphemeMode = false;
let id = 100;
let rtl = false;

const entityLabels = ref([
  {
    id: 0,
    text: "VeryLongLabelWithManyCharacters",
    color: "#2196F3",
  },
  {
    id: 1,
    text: "Ipsum",
    color: "#F9A825",
  },
]);

const relationLabels = ref([
  {
    id: 0,
    text: "superLongRelationLabel",
    color: "#ffffff",
  },
  {
    id: 1,
    text: "isLivedIn",
    color: "#ffffff",
  },
]);

const text = ref(
  "we must respect the will of the individual.\nTake it easy I can assure you that everything will turn out to be fine.\nThe president Obama."
);

const relations = ref([
  {
    id: 0,
    fromId: 4,
    toId: 0,
    labelId: 0,
  },
  {
    id: 2,
    fromId: 5,
    toId: 4,
    labelId: 0,
  },
  {
    id: 3,
    fromId: 1,
    toId: 6,
    labelId: 1,
  },
  {
    id: 4,
    fromId: 1,
    toId: 7,
    labelId: 1,
  },
]);
const entities = ref([
  {
    id: 0,
    user: 0,
    label: 0,
    startOffset: 3,
    endOffset: 7,
  },
  {
    id: 4,
    user: 0,
    label: 0,
    startOffset: 35,
    endOffset: 46,
  },
  {
    id: 1,
    user: 0,
    label: 1,
    startOffset: 59,
    endOffset: 62,
  },
  {
    id: 6,
    user: 0,
    label: 1,
    startOffset: 63,
    endOffset: 69,
  },
  {
    id: 7,
    user: 0,
    label: 1,
    startOffset: 70,
    endOffset: 73,
  },
  {
    id: 2,
    user: 0,
    label: 0,
    startOffset: 79,
    endOffset: 89,
  },
  {
    id: 3,
    user: 0,
    label: 1,
    startOffset: 79,
    endOffset: 94,
  },
  {
    id: 5,
    user: 0,
    label: 1,
    startOffset: 130,
    endOffset: 135,
  },
]);

const text2 = ref(
  "👶🏻👦🏻👧🏻👨🏻👩🏻👱🏻‍♀️👱🏻👴🏻👵🏻👲🏻👳🏻‍♀️👳🏻👮🏻‍♀️👮🏻👷🏻‍♀️👷🏻💂🏻‍♀️💂🏻🕵🏻‍♀️👩🏻‍⚕️👨🏻‍⚕️👩🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾"
);
const relations2 = ref([]);
const entities2: EntityI[] = ref([]); // [] as EntityI[]

const selectedEntities = computed(() => {
  return [entities.value[0], entities.value[1]];
});

// ============================function=====================
function addEntity(event: Event, startOffset: number, endOffset: number) {
  entities.value.push({
    id: id,
    startOffset,
    endOffset,
    label: 0,
    user: 0,
  });
  id++;
}

function updateEntity(event: Event, id: number) {
  const entity = entities.value.find((e) => e.id === id);
  console.log(JSON.stringify(entity));
  console.log(event);
}

// function  deleteEntity(entity: Entity) {
//   data.value.entities = data.value.entities.filter((e) => e.id !== entity.id);
//   data.value.relations.forEach((r) => {
//     if (r.fromId === entity.id || r.toId === entity.id) {
//       deleteRelation(r);
//     }
//   });
// }
// function  changeText() {
//   text = "The president Obama came to Japan.";
//    resetEntity();
// }
// function   resetEntity() {
//   data.value.entities = [];
//   resetRelation();
// }
// function   changeLabel() {
//   entityLabels[0].color = "#FF5733";
//   entityLabels[0].text = "Misc";
// }
// function   addRelation() {
//   data.value.relations.push({
//     id: 1,
//     fromId: 1,
//     toId: 2,
//     labelId: 1,
//   });
// }
// function    updateRelation(event: Event, relation: Relation) {
//   console.log(relation);
//   console.log(event);
// }
// function   deleteRelation(relation: Relation) {
//   data.value.relations = data.value.relations.filter((r) => r.id !== relation.id);
// }
// function  resetRelation() {
//   data.value.relations = [];
// }

// function   addEntity2(event: Event, startOffset: number, endOffset: number) {
//   data.value.entities2.push({
//     id: id,
//     startOffset,
//     endOffset,
//     label: 0,
//     user: 0,
//   });
//   id++;
// }
// function   deleteEntity2(entity: Entity) {
//   data.value.entities2 = data.value.entities2.filter((e) => e.id !== entity.id);
// }
</script>
