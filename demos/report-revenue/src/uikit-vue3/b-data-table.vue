<template>
  <div
    class="b-data-table report-revenue__table-wrapper"
    :class="$attrs.class"
    :style="wrapperStyle"
  >
    <div class="b-data-table__scroll-area" :style="scrollStyle">
      <table class="b-data-table__table">
        <slot name="header" :props="{ headers }" />
        <template v-for="group in grouped" :key="group.name">
          <tbody :group-name="group.name">
            <tr v-if="$slots['group.header']" class="v-row-group__header">
              <slot name="group.header" :group="group.name" />
            </tr>
            <template v-for="item in group.items" :key="item[itemKey] || item.id || item.date">
              <slot name="item" :item="item" />
            </template>
            <tr v-if="$slots['group.summary']" class="v-row-group__summary">
              <slot name="group.summary" :group="group.name" />
            </tr>
          </tbody>
        </template>
        <slot name="body.append" />
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "BDataTable",
  inheritAttrs: false,
  props: {
    headers: { type: Array, default: () => [] },
    items: { type: Array, default: () => [] },
    itemKey: { type: String, default: "id" },
    groupBy: { type: [String, Array], default: null },
    height: { type: [String, Number], default: null },
    fixedHeader: { type: Boolean, default: false },
  },
  computed: {
    groupField() {
      if (Array.isArray(this.groupBy)) return this.groupBy[0];
      return this.groupBy;
    },
    grouped() {
      if (!this.groupField) {
        return [{ name: "", items: this.items }];
      }
      const map = new Map();
      for (const item of this.items) {
        const key = item[this.groupField];
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(item);
      }
      return [...map.entries()].map(([name, groupItems]) => ({ name, items: groupItems }));
    },
    wrapperStyle() {
      return this.height ? { "--table-height": typeof this.height === "number" ? `${this.height}px` : this.height } : {};
    },
    scrollStyle() {
      if (!this.height) return {};
      const h = typeof this.height === "number" ? `${this.height}px` : this.height;
      return { maxHeight: h, overflow: "auto" };
    },
  },
};
</script>

<style lang="scss" scoped>
.b-data-table__table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.b-data-table__scroll-area {
  position: relative;
}

:deep(tr.v-row-group__header td) {
  padding: 0;
  border: 0;
}

:deep(.report-revenue__sticky--default) {
  position: sticky;
  left: 0;
  z-index: 4;
  background-color: var(--demo-surface, #fff);
}
</style>
