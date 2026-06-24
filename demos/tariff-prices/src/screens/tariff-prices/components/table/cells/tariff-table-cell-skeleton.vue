<template>
  <div
    :class="$style.root"
    :style="rootStyle"
    aria-busy="true"
    aria-hidden="true"
    tabindex="-1"
  >
    <v-skeleton-loader type="text" :class="$style.loader"/>
  </div>
</template>

<script>
import { cellWidth, cellHeight } from "../config/table-grid-metrics.js";

export default {
  name: "TariffTableCellSkeleton",
  props: {
    cellHeight: {
      type: Number,
      default: cellHeight,
    },
  },
  computed: {
    rootStyle() {
      return {
        width: `${cellWidth}px`,
        height: `${this.cellHeight}px`,
      };
    },
  },
};
</script>

<style lang="scss" module>
.root {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  pointer-events: none;
  background-color: #f0f1f5;
  border-right: 1px solid #dddde3;
  border-bottom: 1px solid #dddde3;
}

.loader {
  width: 70%;
  max-width: 56px;

  :global(.v-skeleton-loader__text) {
    margin: 0;
    height: 10px;
    border-radius: 4px;
  }
}
</style>
