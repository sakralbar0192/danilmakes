<template>
  <dynamic-virtualizer
    ref="virtualizer"
    key-field="id"
    :items="displayedRoomtypes"
    :min-item-size="120"
    :get-scroll-container="getScrollContainer"
    :class="['set', $style.container]"
    disable-transform
    :style="containerStyle"
    data-test="tariff-mass-availability-grid"
    @input.native.capture="forwardCellInput"
    @change.native.capture="forwardCellChange"
  >
    <template #before>
      <availability-table-header
        ref="tableHeader"
        :weekdays="internalWeekdays"
        :grid-styles="gridStyles"
        :show-all-categories-row="showAllCategoriesRow"
        :grid="grid"
        :all-categories-weekdays="allCategoriesWeekdays"
      />
    </template>
    <template #default="{ item, active, index }">
      <dynamic-virtualizer-item
        :active="active"
        :item="item"
        :style="{ paddingBottom: index < displayedRoomtypes.length - 1 ? '16px' : null, maxWidth }"
        class="d-flex align-center justify-start"
      >
        <roomtype-availability-table
          :roomtype="item"
          :weekdays="internalWeekdays"
          :grid-styles="gridStyles"
          :max-width="maxWidth"
          :grid="grid"
        />
      </dynamic-virtualizer-item>
    </template>
  </dynamic-virtualizer>
</template>

<script>
import { mapState } from "vuex";
import { massiveUpdatingPricesRoomtypeNameCellWidth,
  massiveUpdatingPricesCellWidth } from "../../config/screen-config.js";
import { resolveAllCategoriesRowCollapseScrollTop,
  resolveMassPricesHeaderOffsetTop,
  resolveShouldCollapseAllCategoriesRow } from "../updating-prices/lib/scroll/resolve-mass-prices-header-stuck.js";
import AvailabilityTableHeader from "./availability-table-header.vue";
import RoomtypeAvailabilityTable from "./roomtype-availability-table.vue";
import DynamicVirtualizer from "../virtual-scroll/dynamic-virtualizer.vue";
import DynamicVirtualizerItem from "../virtual-scroll/dynamic-virtualizer-item.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingAvailabilityTable",
  components: {
    AvailabilityTableHeader,
    RoomtypeAvailabilityTable,
    DynamicVirtualizer,
    DynamicVirtualizerItem,
  },
  props: {
    roomtypesIds: {
      type: Array,
      required: true,
    },
    weekdays: {
      type: Array,
      required: true,
    },
    grid: {
      type: Object,
      default: () => ({}),
    },
    allCategoriesWeekdays: {
      type: Object,
      default: () => ({}),
    },
    getScrollContainer: {
      type: Function,
      default: null,
    },
  },
  roomtypeNameCellWidth: massiveUpdatingPricesRoomtypeNameCellWidth,
  cellWidth: massiveUpdatingPricesCellWidth,
  data() {
    return {
      isAllCategoriesRowCollapsed: false,
      primaryHeaderHeightPx: 0,
      collapseScrollTop: null,
    };
  },
  computed: {
    ...mapState("hotelRoom", ["roomtypes"]),
    showAllCategoriesRow() {
      return !this.isAllCategoriesRowCollapsed;
    },
    containerStyle() {
      return {
        "--prices-table-max-width": this.maxWidth,
        "--mass-prices-primary-header-height": `${this.primaryHeaderHeightPx}px`,
      };
    },
    internalWeekdays() {
      return [...this.weekdays].sort((a, b) => Number(a) - Number(b));
    },
    displayedRoomtypes() {
      const ids = new Set((this.roomtypesIds || []).map((id) => Number(id)));
      return (this.roomtypes || []).filter((roomtype) => ids.has(Number(roomtype.id)));
    },
    gridStyles() {
      return {
        display: "grid",
        gridTemplateColumns: `${this.$options.roomtypeNameCellWidth}px repeat(${this.weekdays.length + 1}, ${this.$options.cellWidth}px)`,
      };
    },
    maxWidth() {
      return `${this.$options.roomtypeNameCellWidth + (this.weekdays.length + 1) * this.$options.cellWidth}px`;
    },
  },
  watch: {
    internalWeekdays() {
      this.scheduleCollapseMetricsRefresh();
    },
    displayedRoomtypes() {
      this.scheduleCollapseMetricsRefresh();
    },
  },
  mounted() {
    this.bindScrollListener();
    this.scheduleCollapseMetricsRefresh();
  },
  beforeUnmount() {
    this.unbindScrollListener();
    if (this.$_collapseMetricsRaf) {
      cancelAnimationFrame(this.$_collapseMetricsRaf);
    }
  },
  methods: {
    forwardCellInput(event) {
      if (event?.target?.nodeName === "INPUT" && event.target.dataset?.weekday) {
        this.$emit("input", event);
      }
    },
    forwardCellChange(event) {
      if (event?.target?.nodeName === "INPUT" && event.target.dataset?.weekday) {
        this.$emit("change", event);
      }
    },
    bindScrollListener() {
      const scrollContainer = this.resolveScrollContainer();
      if (!scrollContainer) {
        return;
      }

      this.$_scrollContainer = scrollContainer;
      this.$_onScroll = () => {
        if (this.$_scrollRaf) {
          return;
        }

        this.$_scrollRaf = requestAnimationFrame(() => {
          this.$_scrollRaf = null;
          this.updateMassPricesHeaderState();
        });
      };

      scrollContainer.addEventListener("scroll", this.$_onScroll, { passive: true });
    },
    unbindScrollListener() {
      if (this.$_scrollContainer && this.$_onScroll) {
        this.$_scrollContainer.removeEventListener("scroll", this.$_onScroll);
      }

      if (this.$_scrollRaf) {
        cancelAnimationFrame(this.$_scrollRaf);
        this.$_scrollRaf = null;
      }
    },
    scheduleCollapseMetricsRefresh() {
      if (this.$_collapseMetricsRaf) {
        cancelAnimationFrame(this.$_collapseMetricsRaf);
      }

      this.$_collapseMetricsRaf = requestAnimationFrame(() => {
        this.$_collapseMetricsRaf = null;
        this.$nextTick(() => {
          this.refreshCollapseMetrics();
          this.updateMassPricesHeaderState();
        });
      });
    },
    resolveScrollContainer() {
      return typeof this.getScrollContainer === "function"
        ? this.getScrollContainer()
        : null;
    },
    resolveTableHeaderElement() {
      return this.$refs.virtualizer?.$refs?.scroller?.$refs?.before ?? null;
    },
    refreshCollapseMetrics() {
      if (this.isAllCategoriesRowCollapsed) {
        return;
      }

      const scrollContainer = this.resolveScrollContainer();
      const headerEl = this.resolveTableHeaderElement();
      if (!scrollContainer || !headerEl) {
        return;
      }

      this.$refs.tableHeader?.measureAllCategoriesRow?.();

      const headerOffsetTop = resolveMassPricesHeaderOffsetTop({
        headerEl,
        scrollContainerEl: scrollContainer,
      });
      const allCategoriesRowHeight = this.$refs.tableHeader?.getAllCategoriesRowHeight?.() ?? 0;
      const collapseScrollTop = resolveAllCategoriesRowCollapseScrollTop({
        headerOffsetTop,
        allCategoriesRowHeight,
      });

      if (collapseScrollTop != null) {
        this.collapseScrollTop = collapseScrollTop;
      }

      const primaryHeight = this.$refs.tableHeader?.getPrimaryRowHeight?.() ?? 0;
      if (primaryHeight !== this.primaryHeaderHeightPx) {
        this.primaryHeaderHeightPx = primaryHeight;
      }
    },
    updateMassPricesHeaderState() {
      const scrollContainer = this.resolveScrollContainer();
      if (!scrollContainer || this.collapseScrollTop == null) {
        return;
      }

      const shouldCollapse = resolveShouldCollapseAllCategoriesRow({
        scrollTop: scrollContainer.scrollTop,
        collapseScrollTop: this.collapseScrollTop,
        isCollapsed: this.isAllCategoriesRowCollapsed,
      });

      if (shouldCollapse !== this.isAllCategoriesRowCollapsed) {
        this.isAllCategoriesRowCollapsed = shouldCollapse;
      }

      if (!this.isAllCategoriesRowCollapsed) {
        const primaryHeight = this.$refs.tableHeader?.getPrimaryRowHeight?.() ?? 0;
        if (primaryHeight !== this.primaryHeaderHeightPx) {
          this.primaryHeaderHeightPx = primaryHeight;
        }
      }
    },
  },
};
</script>

<style lang="scss" module>
.container {
  justify-items: start;
  padding-right: 45px;

  :global(.item-wrapper) {
    min-width: calc(var(--prices-table-max-width) + 32px);
  }

  :global(.before) {
    position: sticky;
    top: 0;
    z-index: 3;
  }
}
</style>
