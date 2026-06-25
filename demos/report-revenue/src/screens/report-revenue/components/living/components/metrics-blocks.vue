<template>
  <v-row
    dense
    :class="[
      'set set_ingroup report-revenue-metrics-block--total',
      {
        'report-revenue-metrics-block--separated': isSagComponent,
        'report-revenue-metrics-block--row': shouldUseRowLayout,
      },
    ]"
  >
    <b-col
      v-for="metric in displayedMetrics"
      :key="metric.type"
      cols="auto"
      class="py-0"
    >
      <metric-block :context="context">
        <template #title>
          {{ getMetricName(metric.type) }}
        </template>
        <template #hint>
          <component :is="metric.hintComponent" class="ml-2"/>
        </template>
        <template #text>
          <small :data-test="$options.metricTestAttributes?.[metric.type]?.period" class="mb-2"> {{ period }} </small>
          <div>
            <fact-metric-info
              :format="metric.format"
              :value="metric.value"
              :data-test-sum="$options.metricTestAttributes?.[metric.type]?.sum"
              :is-percent="metric.isPercentType"
            />
            <div v-if="shouldShowPartialFuturePeriodHint">
              <small>
                {{ partialFuturePeriodHint }}
              </small>
            </div>
            <plan-metric-info
              v-else-if="canShowPlanData && metric.planValue"
              :metric-type="metric.type"
              :metric-value="metric.value"
              :plan-value="metric.planValue"
              :is-percent-type="metric.isPercentType"
            />
          </div>
        </template>
        <template v-if="isFullCurrentMonthChosen" #tooltip-content>
          <div class="set set_typo pa-groups">
            <div class="d-flex justify-space-between font-weight-bold">
              <span>{{ period.split(' ')[0] }}</span>
              <div>{{ metric.format(metric.value, true) }} {{ getMetricCurrencySign(metric) }}</div>
            </div>
            <small v-if="getContextualPeriodLabel('past')" class="d-flex justify-space-between">
              <span>{{ getContextualPeriodLabel("past") }}</span>
              <div>{{ metric.format(metric.pastPeriodValue, true) }} {{ getMetricCurrencySign(metric) }}</div>
            </small>
            <small v-if="getContextualPeriodLabel('future')" class="d-flex justify-space-between">
              <span>{{ getContextualPeriodLabel("future") }}</span>
              <div>{{ metric.format(metric.futurePeriodValue, true) }} {{ getMetricCurrencySign(metric) }}</div>
            </small>
          </div>
        </template>
      </metric-block>
    </b-col>
  </v-row>
</template>

<script>
import RevenueReportService from "@/services/reports/revenue-report";
import { getPeriodString, isStartAndEndOfSameMonth } from "@/utils/date";
import { mapGetters, mapState } from "vuex";
import RevenueReportModel from "@/models/reports/revenue/revenue-report";
import moment from "moment";
import FactMetricInfo from "./fact-metric-info.vue";
import MetricBlock from "../../metric-block.vue";
import PlanMetricInfo from "./plan-metric-info.vue";

export default {
  name: "ReportRevenueMetricsBlock",
  components: {
    FactMetricInfo,
    MetricBlock,
    PlanMetricInfo,
  },
  props: {
    context: {
      type: String,
      default: "default",
    },
  },
  metricTestAttributes: {
    [RevenueReportService.metricsBlockTypes.amount.key]: {
      period: "report-revenue-widget-accommodation-period",
      sum: "report-revenue-widget-accommodation-sum",
    },
    [RevenueReportService.metricsBlockTypes.revpar.key]: {
      period: "report-revenue-widget-revpar-period",
      sum: "report-revenue-widget-revpar-sum",
    },
    [RevenueReportService.metricsBlockTypes.adr.key]: {
      period: "report-revenue-widget-adr-period",
      sum: "report-revenue-widget-adr-sum",
    },
    [RevenueReportService.metricsBlockTypes.load.key]: {
      period: "report-revenue-widget-loading-period",
      sum: "report-revenue-widget-loading-sum",
    },
  },
  computed: {
    ...mapState("revenueReport", [
      "externalFilters",
      "isReportActual",
      "metrics",
      "selectedCategories",
      "selectedMetrics",
      "yearsRevenuePlan",
    ]),
    ...mapGetters("revenueReport", ["canShowPlanData", "isFullCurrentMonthChosen"]),
    ...mapGetters("user", ["isGuest"]),
    selectedMetricsSet() {
      return new Set(this.selectedMetrics || []);
    },
    yearKey() {
      const [startStr, endStr] = this.externalFilters.periodOfStay;

      return this.externalFilters.periodOfStay.length === 2 && isStartAndEndOfSameMonth(
        [startStr, endStr],
        RevenueReportService.sendingDataFormat,
      )
        ? moment(startStr, RevenueReportService.sendingDataFormat).format("YYYY")
        : "";
    },
    monthKey() {
      const [startStr] = this.externalFilters.periodOfStay;
      return this.yearKey
        ? moment(startStr, RevenueReportService.sendingDataFormat).format("M")
        : "";
    },
    isSagComponent() {
      return this.context === "separated";
    },
    shouldUseRowLayout() {
      return !this.isSagComponent;
    },
    displayedMetrics() {
      return [
        {
          type: RevenueReportService.metricsBlockTypes.amount.key,
          value: this.metrics[RevenueReportService.metricsBlockTypes.amount.key] || 0,
          pastPeriodValue: this.metrics.past[RevenueReportService.metricsBlockTypes.amount.key] || 0,
          futurePeriodValue: this.metrics.future[RevenueReportService.metricsBlockTypes.amount.key] || 0,
          isPercentType: false,
          hintComponent: RevenueReportService.metricsBlockTypes.amount.hintComponent,
          hidden: !this.selectedMetricsSet.has(RevenueReportService.metricsBlockTypes.amount.key),
          format: (value, forceShowFractions = false) => {
            return this.formattedValue(value, RevenueReportService.metricsBlockTypes.amount.alternativeKey, 2, forceShowFractions);
          },
          planValue: this.getPlanMetricValue(RevenueReportService.metricsBlockTypes.amount.alternativeKey),
        },
        {
          type: RevenueReportService.metricsBlockTypes.revpar.key,
          value: this.metrics[RevenueReportService.metricsBlockTypes.revpar.key] || 0,
          pastPeriodValue: this.metrics.past[RevenueReportService.metricsBlockTypes.revpar.key] || 0,
          futurePeriodValue: this.metrics.future[RevenueReportService.metricsBlockTypes.revpar.key] || 0,
          isPercentType: false,
          hintComponent: RevenueReportService.metricsBlockTypes.revpar.hintComponent,
          hidden: !this.selectedMetricsSet.has(RevenueReportService.metricsBlockTypes.revpar.key),
          format: (value, forceShowFractions = false) => this.formattedValue(value, RevenueReportService.metricsBlockTypes.revpar.key, 2, forceShowFractions),
          planValue: this.getPlanMetricValue(RevenueReportService.metricsBlockTypes.revpar.key),
        },
        {
          type: RevenueReportService.metricsBlockTypes.adr.key,
          value: this.metrics[RevenueReportService.metricsBlockTypes.adr.key] || 0,
          pastPeriodValue: this.metrics.past[RevenueReportService.metricsBlockTypes.adr.key] || 0,
          futurePeriodValue: this.metrics.future[RevenueReportService.metricsBlockTypes.adr.key] || 0,
          isPercentType: false,
          hintComponent: RevenueReportService.metricsBlockTypes.adr.hintComponent,
          hidden: !this.selectedMetricsSet.has(RevenueReportService.metricsBlockTypes.adr.key),
          format: (value, forceShowFractions = false) => this.formattedValue(value, RevenueReportService.metricsBlockTypes.adr.key, 2, forceShowFractions),
          planValue: this.getPlanMetricValue(RevenueReportService.metricsBlockTypes.adr.key),
        },
        {
          type: RevenueReportService.metricsBlockTypes.load.key,
          value: this.metrics[RevenueReportService.metricsBlockTypes.load.key] || 0,
          pastPeriodValue: this.metrics.past[RevenueReportService.metricsBlockTypes.load.key] || 0,
          futurePeriodValue: this.metrics.future[RevenueReportService.metricsBlockTypes.load.key] || 0,
          isPercentType: true,
          hintComponent: RevenueReportService.metricsBlockTypes.load.hintComponent,
          hidden: !this.selectedMetricsSet.has(RevenueReportService.metricsBlockTypes.load.key),
          format: (value, forceShowFractions = false) => this.formattedValue(value, RevenueReportService.metricsBlockTypes.load.key, 1, forceShowFractions),
          planValue: this.getPlanMetricValue(RevenueReportService.metricsBlockTypes.load.key),
        },
      ].filter(metric => !metric.hidden);
    },
    period() {
      return this.externalFilters.periodOfStay.length === 2
        ? getPeriodString(this.externalFilters.periodOfStay, RevenueReportService.sendingDataFormat, RevenueReportService.showDataFormat)
        : "";
    },
    partialFuturePeriodHint() {
      return `${this.$t("Данные к ")} ${moment().format("DD.MM.YYYY")}`;
    },
    shouldShowPartialFuturePeriodHint() {
      if (this.externalFilters?.periodOfStay?.length !== 2) return false;
      const [startStr, endStr] = this.externalFilters.periodOfStay;
      const today = moment().startOf("day");
      const start = moment(startStr, RevenueReportService.sendingDataFormat);
      const end = moment(endStr, RevenueReportService.sendingDataFormat);

      // Подсказка нужна если: есть будущие даты И период не полный месяц
      return (start.isValid() && end.isValid())
        && (end.isAfter(today))
        && !isStartAndEndOfSameMonth([startStr, endStr], RevenueReportService.sendingDataFormat);
    },
  },
  methods: {
    getMetricCurrencySign(metric) {
      return metric?.isPercentType ? "%" : this.$store.state.hotel?.currency_sign || "";
    },
    formattedValue(number, type = null, fractions = 2, forceShowFractions = false) {
      if (type && ((!this.isGuest && this.canShowPlanData && !!this.getPlanMetricValue(type)) || forceShowFractions)) {
        return RevenueReportModel.formattedValue(number, {
          minimumFractionDigits: fractions,
          maximumFractionDigits: fractions,
        });
      }
      return RevenueReportModel.formattedValue(Math.trunc(number));
    },
    getMetricName(type) {
      return RevenueReportService?.metricsBlockTypes?.[type]?.name || type;
    },
    getPlanMetricValue(type) {
      return this.yearsRevenuePlan.getMonthMetricValue(this.yearKey, this.monthKey, type);
    },
    getContextualPeriodLabel(type) {
      if (!this.isFullCurrentMonthChosen) {
        return "";
      }
      return RevenueReportService.getContextualPeriodLabel(type);
    },
  },
};
</script>

<style lang="scss">
.report-revenue-metrics-block {
  max-width: 1350px;
  grid-template-columns: repeat(4, 1fr);
}

.report-revenue-metrics-block--total {
  grid-template-columns: repeat(2, 1fr);
  row-gap: 16px !important;
}

section .report-revenue-metrics-block--separated {
  display: grid;
}

@media #{map-get($display-breakpoints, lg-and-up)} {
  .report-revenue-metrics-block--total.report-revenue-metrics-block--with-doughnut {
    display: grid !important;
    align-self: stretch;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }

  .report-revenue-metrics-block--total.report-revenue-metrics-block--row {
    display: flex !important;
    align-items: start;
    gap: map-get($gaps, groups);
  }
}

@media (max-width: map-get($grid-breakpoints-custom, xl)) {
  .report-revenue-metrics-block {
    max-width: 50%;
    grid-template-columns: repeat(2, 1fr);
    row-gap: 16px !important;
  }
}

@media (max-width: map-get($grid-breakpoints-custom, lg)) {
  .report-revenue-metrics-block {
    max-width: 1000px;
    grid-template-columns: 1fr 1fr;
    row-gap: 16px !important;
  }
  .report-revenue-metrics-block--no-adr-revpar {
    gap: 0px !important;
  }

  .report-revenue-metrics-block--total {
    width: 1000px;
    & > div > .report-revenue__card-wrapper {
      min-width: 280px;
    }
  }

}

@media (max-width: map-get($grid-breakpoints-custom, sm)) {
  .report-revenue-metrics-block {
    grid-template-columns: 1fr;
  }

  .report-revenue__metrics-section {
    flex-direction: column;
  }

  section > .report-revenue__metrics-section {
    max-width: none;
    & > .report-revenue-metrics-block--total {
      width: auto;
      grid-template-columns: repeat(2, 1fr);
      .report-revenue__card-wrapper--total {
        min-width: auto;
      }
      & .report-revenue__card-wrapper {
        max-width: 480px;
      }
    }
  }
}

@media (max-width: 480px) {
  section > .report-revenue__metrics-section > .report-revenue-metrics-block--total {
    width: auto;
    grid-template-columns: repeat(1, 1fr);
  }
}


</style>
