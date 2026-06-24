<template>
  <v-card
    :class="['rounded-0', $style['availability-cell'], {
      [$style['availability-text-field-is-main']]: isMain
    }]"
  >
    <span v-if="textMode" :class="[$style['availability-text'], {'primary--text': weekdayInfo.weekend}]">
      {{ weekdayInfo.title }}
    </span>
    <div
      v-else
      :class="$style['availability-input-wrap']"
    >
      <div :class="$style['availability-input-zoom-inner']">
        <input
          type="text"
          inputmode="numeric"
          enterkeyhint="done"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :value="internalValue"
          placeholder="0"
          :class="[
            $style['availability-text-field'],
            $style['availability-text-field--ios-guard'],
            { [$style['availability-text-field-is-main']]: isMain },
          ]"
          :data-weekday="weekday"
          :data-id="dataId"
          :style="internalValue ? 'font-weight: bold;' : ''"
        >
      </div>
    </div>
  </v-card>
</template>

<script>
import AutomationService from "@/services/automation";
import { allWeekdayItem } from "../../config/screen-config.js";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingAvailabilityTableCell",
  props: {
    weekday: {
      type: String,
      required: true,
    },
    textMode: {
      type: Boolean,
      default: false,
    },
    isMain: {
      type: Boolean,
      default: false,
    },
    roomtype: {
      type: Object,
      default: () => ({ id: "" }),
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
  daysOfWeekList: AutomationService.daysOfWeekList,
  allWeekdayItem,
  computed: {
    isAllWeekdaysColumn() {
      return this.weekday === this.$options.allWeekdayItem.value;
    },
    dataId() {
      return this.roomtype?.id ? String(this.roomtype.id) : "";
    },
    weekdayInfo() {
      return this.weekday === this.$options.allWeekdayItem.value
        ? this.$options.allWeekdayItem
        : this.$options.daysOfWeekList?.[this.weekday - 1];
    },
    internalValue() {
      if (this.roomtype?.id) {
        return this.grid?.[String(this.roomtype.id)]?.[this.weekday] ?? "";
      }
      return this.allCategoriesWeekdays?.[this.weekday] ?? "";
    },
  },
};
</script>

<style lang="scss" module>
@import '../../styles/variables.scss';
@import '../../styles/ios-input-zoom-guard.scss';

.availability-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: $updating-price-cell-height;
  width: $updating-price-cell-width;
}

.availability-input-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: $updating-price-cell-width;
  height: $updating-price-cell-height;
  overflow: hidden;
}

.availability-input-zoom-inner {
  @include tariff-ios-input-zoom-inner;
  transform-origin: right center;
  justify-content: flex-end;
}

.availability-text {
  justify-self: end;
  font-weight: 600;
  padding: map-get($gaps, ingroup) map-get($gaps, typo);
}

.availability-text-field {
  padding-top: 0;
  padding-bottom: 2px;
  width: $updating-price-cell-width;
  height: $updating-price-cell-height;
  text-align: right;
  padding: map-get($gaps, ingroup) map-get($gaps, typo);

  &:hover {
    background-color: $sub-cell-hover-bg-color;
  }

  &:focus {
    outline: 1px solid $primary;
    z-index: 2;
    background-color: $white;
  }

  &-is-main {
    background-color: $main-cell-bg-color;

    &:hover {
      background: $main-cell-hover-bg-color;
    }

    &:focus {
      background: $main-cell-bg-color;
    }
  }

  &--ios-guard {
    @include tariff-ios-input-zoom-field;
    padding: map-get($gaps, ingroup) map-get($gaps, typo);
    text-align: right;
  }
}
</style>
