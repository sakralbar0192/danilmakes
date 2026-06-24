<template>
  <div class="d-flex align-center">
    <b-btn
      data-test="tariff-toolbar-today"
      outlined
      color="tertiary"
      class="mr-groups"
      :aria-disabled="calendarLoading"
      :class="{ 'tariff-toolbar-btn--locked': calendarLoading }"
      @click="handleTodayClick"
    >
      {{ $t("Сегодня") }}
    </b-btn>
    <b-dropdown-datepicker
      v-slot="{ on, attrs }"
      v-model="internalDateFrom"
      value-format="DD-M-YYYY"
      :min="$options.minDate"
      :max="$options.maxDate"
    >
      <b-btn
        v-bind="attrs"
        data-test="tariff-toolbar-datepicker"
        squared
        outlined
        color="tertiary"
        :aria-disabled="calendarLoading"
        :class="{ 'tariff-toolbar-btn--locked': calendarLoading }"
        v-on="calendarLoading ? {} : on"
      >
        <v-icon>icon-calendar</v-icon>
      </b-btn>
    </b-dropdown-datepicker>

    <b-btn-group
      class="d-inline-flex planning-header-toolbar__arrows ml-groups"
      :mandatory="false"
      :borderless="false"
    >
      <b-btn
        data-test="tariff-toolbar-prev-month"
        outlined
        squared
        :aria-disabled="calendarLoading"
        :class="{ 'tariff-toolbar-btn--locked': calendarLoading }"
        @click="handlePrevMonthClick"
      >
        <v-icon>icon-arrow-left</v-icon>
      </b-btn>
      <b-btn
        data-test="tariff-toolbar-next-month"
        outlined
        squared
        :aria-disabled="calendarLoading"
        :class="{ 'tariff-toolbar-btn--locked': calendarLoading }"
        @click="handleNextMonthClick"
      >
        <v-icon>icon-arrow-right</v-icon>
      </b-btn>
    </b-btn-group>
  </div>
</template>

<script>
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import moment from "moment";

export default {
  name: "TariffToolbarDateNav",
  props: {
    dateFrom: {
      type: String,
      required: true,
    },
    calendarLoading: {
      type: Boolean,
      default: false,
    },
  },
  minDate: moment()
    .subtract(10, "y")
    .format("YYYY-MM-DD"),
  maxDate: moment()
    .add(10, "y")
    .format("YYYY-MM-DD"),
  computed: {
    internalDateFrom: {
      get() {
        return this.dateFrom;
      },
      set(v) {
        if (this.calendarLoading) {
          return;
        }
        this.$emit("change-date", v);
      },
    },
  },
  methods: {
    handleTodayClick() {
      if (this.calendarLoading) {
        return;
      }
      this.clickTodayBtn();
    },
    handlePrevMonthClick() {
      if (this.calendarLoading) {
        return;
      }
      this.clickPrevMonth();
    },
    handleNextMonthClick() {
      if (this.calendarLoading) {
        return;
      }
      this.clickNextMonth();
    },
    clickTodayBtn() {
      this.$emit("change-date", moment().format(PriceAndRestrictionsService.sendingDateFormat));
    },
    /**
     * @param {number} delta - сдвиг в месяцах
     */
    shiftMonth(delta) {
      const format = PriceAndRestrictionsService.sendingDateFormat;
      if (!this.dateFrom) return;
      const original = moment(this.dateFrom, format);
      if (!original.isValid()) return;

      let shifted = original.clone().add(delta, "months");
      if (shifted.date() !== original.date()) {
        shifted = shifted.add(1, "month").startOf("month");
      }

      this.$emit("change-date", shifted.format(format));
    },
    clickNextMonth() {
      this.shiftMonth(1);
    },
    clickPrevMonth() {
      this.shiftMonth(-1);
    },
  },
};
</script>

<style lang="scss" scoped>
:global(.tariff-toolbar-btn--locked) {
  pointer-events: none;
  cursor: default;
}
</style>
