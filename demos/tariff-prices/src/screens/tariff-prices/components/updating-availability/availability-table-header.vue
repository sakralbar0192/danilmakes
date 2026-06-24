<template>
  <div :class="['set', $style.header]">
    <v-card :class="['px-groups py-ingroup', $style['header-card']]">
      <div ref="primaryRow" :style="gridStyles">
        <div
          :class="['pl-groups', 'd-flex', 'align-center', $style['name-cell']]"
        >
          {{ $t('Категории номеров') }}
        </div>
        <availability-table-cell
          v-for="day in weekdays"
          :key="day"
          :weekday="String(day)"
          text-mode
          is-main
        />
        <availability-table-cell
          :weekday="$options.allWeekdayItem.value"
          text-mode
          is-main
        />
      </div>
      <div
        ref="allCategoriesBlock"
        :class="[$style['all-categories-block'], {
          [$style['all-categories-block--collapsed']]: !showAllCategoriesRow,
        }]"
        :style="allCategoriesBlockStyle"
        data-test="tariff-mass-availability-grid-all-categories-row"
      >
        <v-divider/>
        <div :style="gridStyles">
          <div
            :class="['pl-groups', 'd-flex', 'align-center', $style['name-cell']]"
          >
            {{ $t('Все категории') }}
          </div>
          <availability-table-cell
            v-for="day in weekdays"
            :key="day"
            is-main
            :weekday="String(day)"
            :grid="grid"
            :all-categories-weekdays="allCategoriesWeekdays"
          />
          <availability-table-cell
            is-main
            :weekday="$options.allWeekdayItem.value"
            :grid="grid"
            :all-categories-weekdays="allCategoriesWeekdays"
          />
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import { allWeekdayItem, massiveUpdatingPricesRoomtypeNameCellWidth } from "../../config/screen-config.js";
import AvailabilityTableCell from "./availability-table-cell.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingAvailabilityTableHeader",
  components: { AvailabilityTableCell },
  props: {
    weekdays: {
      type: Array,
      required: true,
    },
    gridStyles: {
      type: Object,
      required: true,
    },
    showAllCategoriesRow: {
      type: Boolean,
      default: true,
    },
    grid: {
      type: Object,
      default: () => ({}),
    },
    allCategoriesWeekdays: {
      type: Object,
      default: () => ({}),
    },
  },
  allWeekdayItem,
  roomtypeNameCellWidth: massiveUpdatingPricesRoomtypeNameCellWidth,
  data() {
    return { allCategoriesRowMaxHeight: null };
  },
  computed: {
    allCategoriesBlockStyle() {
      if (!this.allCategoriesRowMaxHeight) {
        return null;
      }

      return {
        maxHeight: this.showAllCategoriesRow
          ? `${this.allCategoriesRowMaxHeight}px`
          : "0px",
      };
    },
  },
  mounted() {
    this.measureAllCategoriesRow();
    this.$_allCategoriesResizeObserver = new ResizeObserver(() => {
      this.measureAllCategoriesRow();
    });

    if (this.$refs.allCategoriesBlock) {
      this.$_allCategoriesResizeObserver.observe(this.$refs.allCategoriesBlock);
    }
  },
  beforeUnmount() {
    this.$_allCategoriesResizeObserver?.disconnect();
  },
  methods: {
    getPrimaryRowHeight() {
      return this.$refs.primaryRow?.offsetHeight ?? 0;
    },
    getAllCategoriesRowHeight() {
      return this.allCategoriesRowMaxHeight ?? 0;
    },
    measureAllCategoriesRow() {
      const block = this.$refs.allCategoriesBlock;
      if (!block) {
        return;
      }

      const nextHeight = block.scrollHeight;
      if (nextHeight > 0 && nextHeight !== this.allCategoriesRowMaxHeight) {
        this.allCategoriesRowMaxHeight = nextHeight;
      }
    },
  },
};
</script>

<style lang="scss" module>
@import '../../styles/variables.scss';
.header {
  border-right: 2px solid transparent;
  background-color: $white;
}

.header-card {
  overflow: visible !important;
  background-color: $main-cell-bg-color !important;

  div {
    background-color: inherit !important;
  }

  .name-cell {
    position: sticky;
    left: -24px;
    z-index: 4;
    box-sizing: border-box;
    width: 200px;
    max-width: 200px;
    background-color: $main-cell-bg-color !important;
  }
}

.all-categories-block--collapsed {
  overflow: hidden;
  visibility: hidden;
}
</style>
