<template>
  <v-card
    :class="['rounded-0', $style['price-cell'], {
      [$style['price-cell-error']]: isUnacceptable,
      [$style['price-text-field-is-main']]: isMain
    }]"
  >
    <span v-if="textMode" :class="[$style['price-text'], {'primary--text': weekdayInfo.weekend}]">
      {{ weekdayInfo.title }}
    </span>
    <div
      v-else
      :class="$style['price-input-wrap']"
    >
      <div :class="$style['price-input-zoom-inner']">
        <input
          type="text"
          inputmode="decimal"
          enterkeyhint="done"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :value="internalValue"
          :placeholder="placeholder"
          :class="[
            $style['price-text-field'],
            $style['price-text-field--ios-guard'],
            { [$style['price-text-field-is-main']]: isMain },
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
import { mapState, mapGetters } from "vuex";
import AutomationService from "@/services/automation";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { formatAmount } from "../../config/format-amount.js";
import { allWeekdayItem } from "../../config/screen-config.js";
import { resolveCategoryWritesToDynamicLayer } from "../../lib/tariff/price-save-layer.js";
import { resolveExtraChargeCategoryDefault } from "../../lib/tariff/resolve-extra-charge-category-default.js";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingPricesPriceCell",
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
    childrenAgeId: {
      type: String,
      default: "",
    },
    bedTypeId: {
      type: String,
      default: "",
    },
    referenceDay: {
      type: Object,
      default: null,
    },
  },
  daysOfWeekList: AutomationService.daysOfWeekList,
  allWeekdayItem,
  computed: {
    ...mapState("tariffPricesAndRestrictions", ["currentTariff", "pricesCalendarModel", "massiveUpdatingPricesDrawerShowDefaultPrices", "massiveUpdatingPrices", "massiveUpdatingPricesWeekdays", "unacceptableMassivePricesRestricted"]),
    ...mapState("hotelRoom", ["roomtypes"]),
    ...mapGetters("tariffPricesAndRestrictions", ["isDynamicPricesModeEnabled", "isRmsPricingEnabled", "parentPriceModification", "parentUsesRmsPricing"]),
    categoryWritesToDynamicLayer() {
      if (!this.roomtype?.id || this.childrenAgeId) {
        return false;
      }
      return resolveCategoryWritesToDynamicLayer({
        planId: this.currentTariff?.id,
        roomtypeId: this.roomtype.id,
        roomtypes: this.roomtypes,
        model: this.pricesCalendarModel,
        rmsPricesRuleSource: this.pricesCalendarModel?.rmsPricesRuleSource,
        isRmsPricingEnabled: this.isRmsPricingEnabled,
        isDynamicPricesModeEnabled: this.isDynamicPricesModeEnabled,
      });
    },
    placeholderDay() {
      if (this.isAllWeekdaysColumn || !this.referenceDay?.date) {
        return null;
      }
      const weekdayNum = parseInt(this.weekday, 10);
      const fromCalendar = (this.pricesCalendarModel?.calendar || []).find(
        (d) => Number(d.weekday) === weekdayNum,
      );
      if (fromCalendar) {
        return { date: fromCalendar.date, weekday: fromCalendar.weekday };
      }
      return { date: this.referenceDay.date, weekday: this.weekday };
    },
    isAllWeekdaysColumn() {
      return this.weekday === this.$options.allWeekdayItem.value;
    },
    dataId() {
      if (this.roomtype.id) {
        if (this.childrenAgeId && this.bedTypeId) {
          return `${this.roomtype.id}_${this.childrenAgeId}_${this.bedTypeId}`;
        }
        return this.roomtype.id;
      }
      return "";
    },
    weekdayInfo() {
      return this.weekday === this.$options.allWeekdayItem.value
        ? this.$options.allWeekdayItem
        : this.$options.daysOfWeekList?.[this.weekday - 1];
    },
    placeholder() {
      if (this.isAllWeekdaysColumn) return "0";
      if (this.massiveUpdatingPricesDrawerShowDefaultPrices && this.roomtype?.id) {
        if (this.childrenAgeId && this.bedTypeId) {
          return resolveExtraChargeCategoryDefault(this.roomtype, this.childrenAgeId, this.bedTypeId) ?? 0;
        }
        if (this.categoryWritesToDynamicLayer && this.placeholderDay) {
          const price = this.pricesCalendarModel.getPrice({
            id: this.roomtype.id,
            tariffId: this.currentTariff.id,
            day: this.placeholderDay,
            isDynamicPricesModeEnabled: true,
            parentInfo: {
              id: Number(this.currentTariff?.parent_id),
              modification: this.parentPriceModification,
              parentUsesRmsPricing: this.parentUsesRmsPricing,
            },
          });
          return price?.value ?? 0;
        }
        return this.pricesCalendarModel.getDefaultPrice(
          this.currentTariff.id,
          this.roomtype.id,
          this.weekday,
        );
      }
      return 0;
    },
    internalValue() {
      let price = "";
      if (this.roomtype?.id) {
        price = this.childrenAgeId && this.bedTypeId
          ? this.massiveUpdatingPrices?.[this.roomtype?.id]?.[PriceAndRestrictionsService.updatingExtraChargesPricesFieldName]?.[this.childrenAgeId]?.[this.bedTypeId]?.[this.weekday] || ""
          : this.massiveUpdatingPrices?.[this.roomtype?.id]?.[this.weekday] || "";
      } else price = this.massiveUpdatingPricesWeekdays[this.weekday] || "";
      return formatAmount(price);
    },
    isUnacceptable() {
      return (this.unacceptableMassivePricesRestricted?.[this.dataId] || []).includes(this.weekday);
    },
  },
};
</script>

<style lang="scss" module>
@import '../../styles/variables.scss';
@import '../../styles/ios-input-zoom-guard.scss';

.price-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: $updating-price-cell-height;
  width: $updating-price-cell-width;

  &-error {
    .price-text-field {
      outline: 1px solid $error !important;
      z-index: 2;
    }
  }
}

.price-input-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: $updating-price-cell-width;
  height: $updating-price-cell-height;
  overflow: hidden;
}

.price-input-zoom-inner {
  @include tariff-ios-input-zoom-inner;
  transform-origin: right center;
  justify-content: flex-end;
}

.price-text {
  justify-self: end;
  font-weight: 600;
  padding: map-get($gaps, ingroup) map-get($gaps, typo);
}

.price-text-field {
  padding-top: 0;
  padding-bottom: 2px;
  width: $updating-price-cell-width;
  height: $updating-price-cell-height;
  text-align: right;
  padding: map-get($gaps, ingroup) map-get($gaps, typo);

  &[type=number] {
    appearance: none;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

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
