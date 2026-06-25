<template>
  <div
    :class="vmCss['item-view']"
    :style="view.style"
    :data-layout-stamp="view.styleStamp"
  >
    <slot
      :item="view.item"
      :index="view.raw.index"
      :active="view.raw.used"
    />
  </div>
</template>

<script>
import tariffVirtualizedCssModule from "../table/mixins/tariff-virtualized-css-module.js";

export default {
  name: "TariffPricesItemView",
  mixins: [tariffVirtualizedCssModule],
  props: {
    view: {
      type: Object,
      default: () => ({}),
    },
    disableTransform: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style module lang="scss">
.item-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  contain: layout style;
}
</style>
