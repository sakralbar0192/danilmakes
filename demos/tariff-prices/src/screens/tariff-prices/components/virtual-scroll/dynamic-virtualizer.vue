<template>
  <virtualizer
    ref="scroller"
    :items="itemsWithSizes"
    :min-item-size="minItemSize"
    :update-delay="0"
    :get-scroll-container="getScrollContainer"
    :disable-transform="disableTransform"
    :content-width="contentWidth"
    :buffer="buffer"
    key-field="id"
    v-bind="$attrs"
  >
    <template #default="{ item: itemWithSize, index, active }">
      <slot
        v-bind="{
          item: itemWithSize.item,
          index,
          active,
          itemWithSize,
        }"
      />
    </template>
    <template
      v-if="$slots.before"
      #before
    >
      <slot name="before"/>
    </template>
    <template
      v-if="$slots.after"
      #after
    >
      <slot name="after"/>
    </template>
  </virtualizer>
</template>

<script>
import virtualizer from "./virtualizer.vue";

export default {
  name: "BnovoPricesAndRestrictionsDynamicVirtualizer",
  components: { virtualizer },
  provide() {
    this._initializeResizeObserver();

    return {
      $resizeObserver: this.$_resizeObserver,
      markUnknownSize: this.markUnknownSize,
      markMeasuredSize: this.markMeasuredSize,
      hasUnknownSize: this.hasUnknownSize,
      updateItemSize: this.onUpdateItemSize,
      getKeyField: this.getKeyField,
      getSize: this.getSize,
    };
  },
  props: {
    ...virtualizer.props,
    minItemSize: {
      type: [Number, String],
      required: true,
    },
  },
  data() {
    return {
      options: { sizes: {} },
      unknownSizeMap: Object.create(null),
    };
  },
  computed: {
    itemsWithSizes() {
      return this.items.map((item) => {
        const id = item[this.keyField];
        let size = this.options.sizes[id];
        if (typeof size === "undefined" && !this.unknownSizeMap[id]) {
          size = 0;
        }

        return {
          item,
          id,
          size,
          type: item[this.typeField],
        };
      });
    },
  },
  watch: {
    itemsWithSizes(next, prev) {
      const scrollTop = this.$refs.scroller.getScroll().start;

      let prevActiveTop = 0;
      let currActiveTop = 0;

      const length = Math.min(next.length, prev.length);

      for (let i = 0; i < length; i++) {
        if (prevActiveTop >= scrollTop) {
          break;
        }

        prevActiveTop += prev[i].size || this.minItemSize;
        currActiveTop += next[i].size || this.minItemSize;
      }

      const offset = currActiveTop - prevActiveTop;

      if (offset === 0) {
        return;
      }

      this.$refs.scroller.addScrollTop(offset);
    },
  },
  beforeUnmount() {
    if (this.$_resizeObserver) {
      this.$_resizeObserver.disconnect();
      this.$_resizeObserver = null;
    }
  },
  methods: {
    _initializeResizeObserver() {
      if (this.$_resizeObserver || typeof ResizeObserver === "undefined") {
        return;
      }

      this.$_resizeObserver = new ResizeObserver((entries) => {
        requestAnimationFrame(() => {
          if (!Array.isArray(entries) || entries.length === 0) {
            return;
          }

          for (const entry of entries) {
            const target = entry.target;
            if (!target || !target.$_id || !target.$_onResize) {
              continue;
            }


            const rect = target.getBoundingClientRect();
            const height = rect.height;
            const width = rect.width;
            target.$_onResize(target.$_id, width, height);
          }
        });
      });
    },
    hasUnknownSize(itemId) {
      return !!this.unknownSizeMap[itemId];
    },
    markUnknownSize(itemId) {
      this.$set(this.unknownSizeMap, itemId, true);
    },
    markMeasuredSize(itemId) {
      this.$set(this.unknownSizeMap, itemId, false);
    },
    onUpdateItemSize({ id, size }) {
      if (this.hasUnknownSize(id)) {
        this.$delete(this.unknownSizeMap, id);
      }

      this.$set(this.options.sizes, id, size);
    },
    getKeyField() {
      return this.keyField;
    },
    getSize(id) {
      return this.options.sizes[id];
    },
  },
};
</script>
