<template>
  <v-card outlined class="px-groups py-ingroup" :style="{maxWidth : `calc(${maxWidth} + 32px)`}">
    <v-card-title
      :class="['text-h5', $style['sticky-header']]"
      :style="[nameCellStyles, { maxWidth }]"
    >
      <p class="mb-0 text-truncate">
        {{ roomtype.name }}
      </p>
    </v-card-title>
    <v-card-text class="pa-0" :style="{maxWidth}">
      <template v-if="canShowRoomtype(roomtype.id)">
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
              :without-beds-children="roomtype.extra?.beds?.[$options.withoutPlaceTypeIndex]"
            />
          </div>

          <price-table-cell
            v-for="day in weekdays"
            :key="day"
            :roomtype="roomtype"
            :weekday="day"
            :reference-day="referenceDay"
          />
          <price-table-cell
            :roomtype="roomtype"
            :weekday="$options.allWeekdayItem.value"
            :reference-day="referenceDay"
          />
        </div>
      </template>

      <template v-for="subroom in roomtype.subrooms">
        <template v-if="canShowRoomtype(subroom.id)">
          <v-divider :key="`${roomtype.id}_${subroom.id}_divider`"/>
          <div
            :key="`${roomtype.id}_${subroom.id}`"
            :style="gridStyles"
          >
            <div
              class="px-groups d-flex align-center justify-space-between"
              :style="nameCellStyles"
            >
              <people-count
                :adults="subroom.adults"
                :children="subroom.children"
                :without-beds-children="withoutBedsChildren"
                class="pr-outer"
              />
              <subroom-people-tooltip
                :subroom="subroom"
                :category-name="subroom.name"
                always-show-icon
                :without-beds-children="withoutBedsChildren"
              />
            </div>
            <price-table-cell
              v-for="day in weekdays"
              :key="day"
              :roomtype="subroom"
              :weekday="day"
              :reference-day="referenceDay"
            />
            <price-table-cell
              :roomtype="subroom"
              :weekday="$options.allWeekdayItem.value"
              :reference-day="referenceDay"
            />
          </div>
        </template>
      </template>
      <template v-if="Object.keys(roomtype?.extra?.people || {})?.length">
        <template v-for="(bedTypeObj, childrenAgeId) in roomtype?.extra?.children_ages || {}">
          <template v-for="(_, bedTypeId) in bedTypeObj || {}">
            <template v-if="canShowExtraCharge(roomtype.id, childrenAgeId, bedTypeId)">
              <v-divider :key="`${roomtype.id}_${childrenAgeId}_${bedTypeId}_divider`"/>
              <div
                :key="`${roomtype.id}_${childrenAgeId}_${bedTypeId}`"
                :style="gridStyles"
              >
                <div class="pl-groups d-flex align-center" :style="nameCellStyles">
                  <span>{{ getExtraChargeName(childrenAgeId) }}</span>
                  &nbsp;|&nbsp;
                  <span :style="{color: $vuetify.theme.current.colors.secondary}">
                    {{ getBedTypeString(bedTypeId) }}
                  </span>
                </div>
                <price-table-cell
                  v-for="day in weekdays"
                  :key="day"
                  :roomtype="roomtype"
                  :weekday="day"
                  :children-age-id="String(childrenAgeId)"
                  :bed-type-id="String(bedTypeId)"
                />
                <price-table-cell
                  :roomtype="roomtype"
                  :children-age-id="String(childrenAgeId)"
                  :bed-type-id="String(bedTypeId)"
                  :weekday="$options.allWeekdayItem.value"
                />
              </div>
            </template>
          </template>
        </template>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState } from "vuex";
import RoomtypeModel from "@/models/roomtype";
import { allWeekdayItem,
  getExtraChargeName as getExtraChargeNameFn,
  bedTypes,
  massiveUpdatingPricesNameCellStyles,
  massiveUpdatingPricesRoomtypeNameCellWidth } from "../../config/screen-config.js";
import PriceTableCell from "./price-table-cell.vue";
import PeopleCount from "../table/shared/people-count.vue";
import SubroomPeopleTooltip from "../table/shared/subroom-people-tooltip.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingPricesRoomtypePricesTable",
  components: {
    PriceTableCell,
    PeopleCount,
    SubroomPeopleTooltip,
  },
  props: {
    roomtype: {
      type: Object,
      required: true,
    },
    roomtypesIds: {
      type: Array,
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
    referenceDay: {
      type: Object,
      default: null,
    },
  },
  withoutPlaceTypeIndex: RoomtypeModel.WITHOUT_PLACE_TYPE_INDEX,
  allWeekdayItem,
  roomtypeNameCellWidth: massiveUpdatingPricesRoomtypeNameCellWidth,
  computed: {
    ...mapState("tariffPricesAndRestrictions", ["pricesCalendarModel", "currentTariff"]),
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
  methods: {
    canShowRoomtype(roomtypeId) {
      return this.roomtypesIds.includes(String(roomtypeId));
    },
    canShowExtraCharge(roomtypeId, childrenAgeId, bedTypeId) {
      return this.roomtypesIds.includes(`${roomtypeId}_${childrenAgeId}_${bedTypeId}`);
    },
    getExtraChargeName(childrenAgeId) {
      return getExtraChargeNameFn(
        childrenAgeId,
        this.pricesCalendarModel?.hotelChildrenAges?.[childrenAgeId]?.minAge,
        this.pricesCalendarModel?.hotelChildrenAges?.[childrenAgeId]?.maxAge,
      );
    },
    getBedTypeString(bedTypeId) {
      return bedTypes[bedTypeId] || "";
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
