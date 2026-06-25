<template>
  <section>
    <header class="mb-1">
      <div class="d-flex align-center justify-start">
        <div class="d-flex align-center">
          <p class="font-weight-bold mb-0">
            {{ captionWithoutCount }}
          </p>
        </div>
      </div>
    </header>
    <div class="mb-1">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <p class="font-weight-bold mb-0">
            {{ currentDateInTooltipFormatted }}
          </p>
          <span v-if="isGroupedByDates" class="report-revenue__text--dark ml-1">
            {{ currentWeekDayInTooltipFormatted }}
          </span>
        </div>
      </div>
    </div>
    <footer v-for="(data, index) in currentTooltipData" :key="index" class="mb-1">
      <slot
        :name="`(${data.graphKey})-content`"
        :types="defaultValue"
        :format="formatTooltipValue"
        :data="data"
      >
        <div class="d-flex align-start justify-space-between">
          <div class="d-flex flex-column">
            <div class="d-flex align-center">
              <div
                :class="{
                  'report-revenue__square': getType(data) === defaultValue.square,
                  'report-revenue__dashed': getType(data) === defaultValue.dot}"
                :style="`background-color: ${getColor(data)}; border-color: ${getColor(data)};`"
              />
              {{ data.title }}
            </div>
            <small v-if="isShowSubhintToday(data.phase)" class="report-revenue__text--dark mt-n1"> {{ $t("к") }} {{ currentDay }}</small>
          </div>
          <span
            :style="{marginRight: data.graphema === 'percent' ? '-2px' : null}"
            class="font-weight-bold"
          >{{ formatTooltipValue(data.value, data.graphema === "percent", formatFractionDigits) }}</span>
        </div>
      </slot>
    </footer>
    <div v-if="isCurrentMonthColTooltip && pastAndFutureMetricValues">
      <div class="set set_typo">
        <small v-if="getContextualPeriodLabel('past')" class="d-flex justify-space-between">
          <span>{{ getContextualPeriodLabel("past") }}</span>
          <div>{{ formatTooltipValue(pastAndFutureMetricValues.past, isPercentTypeMetric, formatFractionDigits) }}</div>
        </small>
        <small v-if="getContextualPeriodLabel('future')" class="d-flex justify-space-between">
          <span>{{ getContextualPeriodLabel("future") }}</span>
          <div>{{ formatTooltipValue(pastAndFutureMetricValues.future, isPercentTypeMetric, formatFractionDigits) }}</div>
        </small>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import moment from "moment";
import RevenueReportService from "@/services/reports/revenue-report";
import strategiesDatasetDictionary from "../dictionaries/strategiesDatasetDictionary";
import SharedTooltipView from "../mixins/sharedTooltipView";

export default {
  name: "ReportRevenueManyDatasetTooltip",
  mixins: [SharedTooltipView],
  props: {
    tooltipDataProps: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    ...mapState("revenueReport", ["metrics"]),
    ...mapGetters("revenueReport", ["canShowPlanData"]),
    isCurrentMonthColTooltip() {
      return this.isGroupedByMonths && moment(this.currentDateInTooltip, RevenueReportService.sendingDataFormat).isSame(moment(), "month");
    },
    currentGrafKey() {
      return this.currentTooltipData?.[0]?.graphKey || "";
    },
    currentMetricKey() {
      return Object.values(RevenueReportService.metricsBlockTypes)
        .find(metricType => this.currentGrafKey === metricType.key || this.currentGrafKey === metricType.alternativeKey)?.key || "";
    },
    pastAndFutureMetricValues() {
      return this.currentMetricKey in RevenueReportService.metricsBlockTypes
      && { past: this.metrics.past[this.currentMetricKey], future: this.metrics.future[this.currentMetricKey] };
    },
    isPercentTypeMetric() {
      return this.currentMetricKey === RevenueReportService.metricsBlockTypes.load.key;
    },
    isGroupedByDates() {
      return this.currentGroupTypeId === strategiesDatasetDictionary.dates;
    },
    isGroupedByMonths() {
      return this.currentGroupTypeId === strategiesDatasetDictionary.months;
    },
    formatFractionDigits() {
      if (this.isCurrentMonthColTooltip && this.pastAndFutureMetricValues) {
        return this.currentTooltipData[0].graphema === "percent" ? 1 : 2;
      }

      if (this.isGroupedByDates) {
        return 0;
      }

      if (!this.canShowPlanData) {
        return 0;
      }

      const external = this.datasetExternalData;
      if (external == null) {
        return 0;
      }
      if (!external.planValue || external.planValue < 0) {
        return 0;
      }

      return this.currentTooltipData[0].graphema === "percent" ? 1 : 2;
    },
  },
  watch: {
    tooltipDataProps(newVal) {
      this.tooltipData = newVal;
    },
  },
  methods: {
    isShowSubhintToday(phase) {
      return phase === this.defaultValue.today || phase === this.defaultValue.future;
    },
    getType(data) {
      if (this.isGroupedByMonths) {
        return data?.type || this.defaultValue.square;
      }
      return data?.combinedType || this.defaultValue.square;
    },
    getColor(data) {
      if (this.isGroupedByMonths) {
        return data?.color || this.defaultValue.color;
      }
      return data?.combinedColor || this.defaultValue.color;
    },
    getContextualPeriodLabel(type) {
      if (!this.isCurrentMonthColTooltip) {
        return "";
      }
      return RevenueReportService.getContextualPeriodLabel(type);
    },
  },
};
</script>
