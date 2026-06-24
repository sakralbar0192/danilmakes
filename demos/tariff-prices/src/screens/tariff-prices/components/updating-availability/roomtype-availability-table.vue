<template>
  <v-card
    outlined
    class="px-groups py-ingroup"
    :style="{ maxWidth: `calc(${maxWidth} + 32px)` }"
    :data-test="`tariff-mass-availability-row-${roomtype.id}`"
  >
    <v-card-title
      :class="['text-h5', $style['sticky-header']]"
      :style="[nameCellStyles, { maxWidth }]"
    >
      <p class="mb-0 text-truncate">
        {{ roomtype.name }}
      </p>
    </v-card-title>
    <v-card-text class="pa-0" :style="{ maxWidth }">
      <div :style="gridStyles">
        <div
          class="px-groups d-flex align-center justify-space-between"
          :style="nameCellStyles"
        >
          <people-count
            :without-beds-children="withoutBedsChildren"
            :adults="roomtype.adults"
            :children="roomtype.children"
            class="pr-outer"
          />
          <subroom-people-tooltip
            :subroom="roomtype"
            :category-name="roomtype.name"
            always-show-icon
            :without-beds-children="withoutBedsChildren"
          />
        </div>
        <availability-table-cell
          v-for="day in weekdays"
          :key="day"
          :roomtype="roomtype"
          :weekday="String(day)"
          :grid="grid"
        />
        <availability-table-cell
          :roomtype="roomtype"
          :weekday="$options.allWeekdayItem.value"
          :grid="grid"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { allWeekdayItem,
  massiveUpdatingPricesNameCellStyles,
  massiveUpdatingPricesRoomtypeNameCellWidth } from "../../config/screen-config.js";
import AvailabilityTableCell from "./availability-table-cell.vue";
import PeopleCount from "../table/shared/people-count.vue";
import SubroomPeopleTooltip from "../table/shared/subroom-people-tooltip.vue";

/** @see RoomtypeModel.WITHOUT_PLACE_TYPE_INDEX */
const WITHOUT_PLACE_TYPE_INDEX = 2;

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingAvailabilityRoomtypeTable",
  components: {
    AvailabilityTableCell,
    PeopleCount,
    SubroomPeopleTooltip,
  },
  props: {
    roomtype: {
      type: Object,
      required: true,
    },
    weekdays: {
      type: Array,
      required: true,
    },
    gridStyles: {
      type: Object,
      required: true,
    },
    maxWidth: {
      type: String,
      required: true,
    },
    grid: {
      type: Object,
      default: () => ({}),
    },
  },
  withoutPlaceTypeIndex: WITHOUT_PLACE_TYPE_INDEX,
  allWeekdayItem,
  roomtypeNameCellWidth: massiveUpdatingPricesRoomtypeNameCellWidth,
  computed: {
    withoutBedsChildren() {
      return this.roomtype.extra?.beds?.[this.$options.withoutPlaceTypeIndex];
    },
    nameCellStyles() {
      return {
        ...massiveUpdatingPricesNameCellStyles,
        maxWidth: `${this.$options.roomtypeNameCellWidth}px`,
      };
    },
  },
};
</script>

<style lang="scss" module>
.sticky-header {
  box-sizing: border-box;
  position: sticky;
  top: var(--mass-prices-primary-header-height, 0px);
  z-index: 2;
  background: $white;
}
</style>
