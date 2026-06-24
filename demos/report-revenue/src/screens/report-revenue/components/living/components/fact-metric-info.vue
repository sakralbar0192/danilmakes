<template>
  <div class="d-inline-flex align-baseline">
    <span class="font-weight-bold hero-34" :data-test="dataTestSum">{{ numberPart }}</span>
    <span v-if="fractionPart" class="text-secondary text-body-1">{{ fractionPart }}</span>
    <span class="text-secondary ml-typo">{{ valueSign }}</span>
  </div>
</template>

<script>
import RevenueReportModel from "@/models/reports/revenue/revenue-report";

export default {
  name: "BnovoRevenueReportFactMetricInfo",
  props: {
    value: {
      type: Number,
      required: true,
    },
    format: {
      type: Function,
      required: true,
    },
    isPercent: {
      type: Boolean,
      default: false,
    },
    dataTestSum: {
      type: String,
      default: null,
    },
  },
  computed: {
    valueSign() {
      return this.isPercent ? "%" : this.hotel.currency_sign;
    },
    formattedValue() {
      return this.format(this.value);
    },
    splitValue() {
      return this.formattedValue.split(RevenueReportModel.NUMBER_SEPARATOR);
    },
    numberPart() {
      return this.splitValue[0];
    },
    fractionPart() {
      const value = this.splitValue[1];
      if (!value) {
        return null;
      }

      return `${RevenueReportModel.NUMBER_SEPARATOR}${value}`;
    },
  },
};
</script>
