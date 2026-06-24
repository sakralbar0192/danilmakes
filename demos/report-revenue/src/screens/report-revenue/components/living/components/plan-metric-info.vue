<template>
  <div class="d-flex flex-column">
    <small>
      {{ planText }}
    </small>

    <small class="mt-inner">
      <template v-if="factPlanDiff === 0 && !isCurrentOrFutureFullMonth">
        {{ $t('Выполнено') }}
        <v-icon class="icon-check" color="success" x-small/>
      </template>
      <template v-else>
        {{ planFactDiffMessage }}
        <span
          :class="{
            'font-weight-bold text--primary': isCurrentOrFutureFullMonth,
            'error--text': !isCurrentOrFutureFullMonth && factPlanDiff < 0,
            'success--text': !isCurrentOrFutureFullMonth && factPlanDiff > 0,
          }"
        >
          {{ factPlanDiffText }}
        </span>
        <span v-if="!isPercentType">
          ({{ factPlanPercentText }})
        </span>
      </template>
    </small>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import RevenueReportService from "@/services/reports/revenue-report";
import RevenueReportModel from "@/models/reports/revenue/revenue-report";

export default {
  name: "BnovoReportRevenuePlanMetricInfo",
  props: {
    metricType: {
      type: String,
      validator(value) {
        return Object.keys(RevenueReportService.metricsBlockTypes).indexOf(value) !== -1;
      },
      required: true,
    },
    metricValue: {
      type: Number,
      required: true,
    },
    isPercentType: {
      type: Boolean,
      required: true,
    },
    planValue: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapState("revenueReport", ["yearsRevenuePlan", "externalFilters"]),
    ...mapGetters("revenueReport", ["isCurrentOrFutureFullMonth"]),
    isItLoadMetric() {
      return this.metricType === RevenueReportService.metricsBlockTypes.load.key;
    },
    factPlanDiff() {
      const { diff } = RevenueReportModel.calculateFactPlanDiff(this.planValue, this.metricValue);
      return diff;
    },
    factPlanPercent() {
      const { percentage } = RevenueReportModel.calculateFactPlanDiff(this.planValue, this.metricValue);
      return percentage;
    },
    factPlanPercentText() {
      if (this.factPlanPercent === 0) {
        return "0,0%";
      }
      return this.factPlanPercent < 0.1
        ? "<0,1%"
        : `${RevenueReportModel.formattedPercent(this.factPlanPercent)}%`;
    },
    factPlanDiffText() {
      const sign = this.factPlanDiff > 0 ? "+" : "";
      const currencySign = this.isPercentType ? "%" : this.hotel.currency_sign;

      if (this.isCurrentOrFutureFullMonth) {
        return `${sign}${this.formattedDiff(Math.abs(this.factPlanDiff))}${currencySign}`;
      }

      return `${sign}${this.formattedDiff(this.factPlanDiff)}${currencySign}`;
    },
    planText() {
      return `${
        this.$t("План")
      }: ${
        this.formattedValue(this.planValue)
      }${
        this.isPercentType ? "%" : ` ${this.hotel.currency_sign}`
      }`;
    },
    planFactDiffMessage() {
      let message;
      if (this.isCurrentOrFutureFullMonth) {
        message = this.factPlanDiff <= 0
          ? this.$t("До плана")
          : this.$t("Выше плана");
      } else {
        message = this.factPlanDiff < 0
          ? this.$t("Не выполнено")
          : this.$t("Перевыполнено");
      }

      return this.$t(message);
    },
  },
  methods: {
    formattedValue(v) {
      v = Math.abs(v);

      if (this.metricType === RevenueReportService.metricsBlockTypes.revpar.key && !Number.isInteger(v)) {
        return RevenueReportModel.formattedValue(v, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      return RevenueReportModel.formattedValue(Math.trunc(v));
    },
    formattedDiff(v) {
      return this.isItLoadMetric
        ? RevenueReportModel.formattedPercent(v)
        : RevenueReportModel.formattedValue(v, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
  },
};
</script>
