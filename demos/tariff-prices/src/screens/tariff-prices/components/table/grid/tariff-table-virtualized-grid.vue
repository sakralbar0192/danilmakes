<template>
  <virtualizer
    ref="tableVirtualizer"
    size-field="height"
    key-field="id"
    type-field="type"
    :class="tableContainerClass"
    :items="items"
    :content-width="contentWidth"
    :buffer="buffer"
    :update-delay="updateDelay"
    :use-placeholder-layer="false"
    :max-rendered-rows="maxRenderedRows"
    :min-item-size="minItemSize"
    :scroll-position-skip-threshold-px="scrollPositionSkipThresholdPx"
    :get-scroll-container="getScrollContainer"
    @scroll="$emit('scroll', $event)"
  >
    <template #before>
      <slot name="before"/>
    </template>
    <template #default="slotProps">
      <slot v-bind="slotProps"/>
    </template>
    <template #after>
      <slot name="after"/>
    </template>
  </virtualizer>
</template>

<script>
/**
 * Обёртка над общим virtualizer: фиксированный контракт пропсов и слотов таблицы тарифов,
 * чтобы не раздувать `table/index.vue`.
 */
import Virtualizer from "../../virtual-scroll/virtualizer.vue";

export default {
  name: "TariffTableVirtualizedGrid",
  components: { Virtualizer },
  props: {
    tableContainerClass: {
      type: [Array, Object, String],
      default: () => [],
    },
    items: {
      type: Array,
      required: true,
    },
    contentWidth: {
      type: String,
      required: true,
    },
    buffer: {
      type: Number,
      required: true,
    },
    updateDelay: {
      type: Number,
      required: true,
    },
    maxRenderedRows: {
      type: Number,
      required: true,
    },
    minItemSize: {
      type: Number,
      required: true,
    },
    scrollPositionSkipThresholdPx: {
      type: Number,
      required: true,
    },
    getScrollContainer: {
      type: Function,
      required: true,
    },
  },
};
</script>
