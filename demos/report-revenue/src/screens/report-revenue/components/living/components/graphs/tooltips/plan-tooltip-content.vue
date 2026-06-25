<template>
  <div v-if="data.value > 0" class="d-flex align-start justify-space-between">
    <div class="d-flex flex-column justify-space-between">
      <div class="d-flex align-center">
        <div
          class="report-revenue__square"
          :style="{
            backgroundColor: data.color,
            borderColor: data.color,
          }"
        />
        {{ data.title }}
      </div>
      <small v-if="todayOrFuture" class="report-revenue__text--dark mt-n1">
        {{ subTitle }}
      </small>
    </div>
    <div class="d-flex flex-column align-end">
      <span class="font-weight-bold" :style="{ marginRight: data.graphema === 'percent' ? '-2px' : null }">
        {{ format(data.value, data.graphema === "percent", fractions) }}
      </span>
      <div v-if="todayOrFuture" class="d-inline-flex">
        <small v-if="canShowPercentageDiff" class="text-secondary font-size-small mr-typo">
          ({{ planFactPercent }}%)
        </small>
        <small class="font-weight-bold font-size-small">
          {{ format(absDiff, data.graphema === "percent", fractions) }}
        </small>
      </div>
    </div>
  </div>
</template>

<script>
import RevenueReportModel from "@/models/reports/revenue/revenue-report";

export default {
  name: "ReportRevenuePlanTooltipContent",
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
    types: {
      type: Object,
      default: () => ({}),
    },
    format: {
      type: Function,
      default: (v) => v,
    },
    fractions: {
      type: Number,
      default: 2,
    },
    canShowPercentageDiff: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    planFactDiff() {
      const { diff } = RevenueReportModel.calculateFactPlanDiff(
        this.data.externalData.planValue,
        this.data.externalData.factValue,
      );
      return diff;
    },
    planFactPercent() {
      const { percentage } = RevenueReportModel.calculateFactPlanDiff(
        this.data.externalData.planValue,
        this.data.externalData.factValue,
      );
      if (percentage === 0) {
        return "0,0";
      }
      return percentage < 0.1
        ? `<0${RevenueReportModel.NUMBER_SEPARATOR}1`
        : RevenueReportModel.formattedPercent(percentage, this.fractions, this.fractions);
    },
    absDiff() {
      return Math.abs(this.planFactDiff);
    },
    subTitle() {
      return this.planFactDiff <= 0 ? this.$t("До плана") : this.$t("Выше плана");
    },
    todayOrFuture() {
      return this.data.phase === this.types.today || this.data.phase === this.types.future;
    },
  },
};
</script>
