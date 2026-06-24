<template>
  <div class="b-input-group" :style="wrapperStyle">
    <template v-if="$slots.start">
      <label v-if="startLabel">{{ startLabel }}</label>
      <div class="slot-wrapper">
        <slot name="start" />
      </div>
    </template>
    <template v-if="$slots.middle">
      <label v-if="middleLabel">{{ middleLabel }}</label>
      <div class="slot-wrapper">
        <slot name="middle" />
      </div>
    </template>
    <template v-if="$slots.end">
      <label v-if="endLabel">{{ endLabel }}</label>
      <div class="slot-wrapper">
        <slot name="end" />
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: "BInputGroup",
  props: {
    wholeWidth: { type: [Number, String], default: 0 },
    startWidth: { type: [Number, String], default: 0 },
    endWidth: { type: [Number, String], default: 0 },
    startLabel: { type: String, default: "" },
    middleLabel: { type: String, default: "" },
    endLabel: { type: String, default: "" },
    endAutoWidth: { type: Boolean, default: false },
  },
  computed: {
    wrapperStyle() {
      const slots = ["start", "middle", "end"].filter((name) => this.$slots[name]);
      const columns = Array(slots.length).fill("1fr");
      let style = "";

      if (this.endAutoWidth && columns.length) {
        columns[columns.length - 1] = "auto";
      }
      if (this.startWidth && columns.length) {
        columns[0] = `${this.startWidth}px`;
      }
      if (this.endWidth && columns.length) {
        columns[columns.length - 1] = `${this.endWidth}px`;
      }

      style += `grid-template-columns: ${columns.join(" ")};`;

      if (this.wholeWidth) {
        style += `max-width: ${this.wholeWidth}px;`;
      }
      if (this.startLabel || this.middleLabel || this.endLabel) {
        style += "grid-template-rows: repeat(2, auto); row-gap: 4px;";
      } else {
        style += "grid-template-rows: auto;";
      }
      return style;
    },
  },
};
</script>
