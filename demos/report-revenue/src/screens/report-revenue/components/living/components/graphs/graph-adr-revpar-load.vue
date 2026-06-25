<template>
  <graph-template
    :id="chartId"
    :chart-options-prop="chartOptions"
    :chart-data-prop="chartData"
    :chart-plugins-prop="plugins"
    :title="graphTitle"
    :additional-classes="additionalClasses"
    :in-modal="inModal"
    :caption="captionWithoutCount"
    data-test="report-revenue-graph-revpar-adr-load"
    @toggle-full-screen="toggleFullScreen"
  >
    <template #tooltip="{ slotProps: wrapperRef }">
      <tooltip-template
        :is-visible="tooltipActive"
        :position="tooltipPosition"
        :graph-id="chartId"
        :wrapper-ref="wrapperRef"
        data-test="report-revenue-graph-revpar-adr-load-tooltip"
      >
        <many-dataset-tooltip :tooltip-data-props="tooltipData"/>
      </tooltip-template>
    </template>
  </graph-template>
</template>

<script>
import modules from "@/screens/report-revenue/assets/modules";
import { mapState, mapGetters } from "vuex";
import colors from "@/utils/colors";
import RevenueReportModel from "@/models/reports/revenue/revenue-report";
import RevenueReportService from "@/services/reports/revenue-report";
import GraphTemplate from "./graph-template.vue";
import TooltipTemplate from "./tooltip-template.vue";
import SharedGraphSettings from "./mixins/sharedGraphSettings";
import SharedTooltipSettings from "./mixins/sharedTooltipSettings";
import ManyDatasetTooltip from "./tooltips/many-dataset-tooltip.vue";
import orderDictionary from "./dictionaries/orderDictionary";
import orderStrategies from "./strategies/orderStrategies";

const PHASE_DASH = {
  today: [6, 6],
  future: [6, 6],
  past: [],
};

const PHASE_WIDTH = {
  today: 2,
  future: 2,
  past: 3,
};

export default {
  name: "ReportRevenueADRRevParGraph",
  components: {
    GraphTemplate, TooltipTemplate, ManyDatasetTooltip,
  },
  mixins: [SharedGraphSettings, SharedTooltipSettings],
  props: {
    hideTitle: {
      type: Boolean,
      default: false,
    },
    inModal: {
      type: Boolean,
      default: false,
    },
    additionalClasses: {
      type: String,
      default: "",
    },
    chartDataProp: {
      type: Object,
      default: () => {},
    },
    yMax: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    ...mapGetters("revenueReport", ["categorySelectedText", "categorySelectedAttributeText"]),
    ...mapState("revenueReport", ["adrData", "revparData", "loadData", "externalFilters", "selectedMetrics"]),
    selectedMetricsSet() {
      return new Set(this.selectedMetrics);
    },
    isRevparSelected() {
      return this.selectedMetricsSet.has(RevenueReportService.metricsBlockTypes.revpar.key);
    },
    isAdrSelected() {
      return this.selectedMetricsSet.has(RevenueReportService.metricsBlockTypes.adr.key);
    },
    isLoadSelected() {
      return this.selectedMetricsSet.has(RevenueReportService.metricsBlockTypes.load.key);
    },
    selectedChartMetrics() {
      const metricsOrder = [
        RevenueReportService.metricsBlockTypes.revpar.key,
        RevenueReportService.metricsBlockTypes.adr.key,
        RevenueReportService.metricsBlockTypes.load.key,
      ];
      return metricsOrder.filter(metric => this.selectedMetricsSet.has(metric));
    },
    graphTitle() {
      if (!this.selectedChartMetrics.length) {
        return this.$t("RevPAR/ADR/Загрузка");
      }
      const labels = {
        [RevenueReportService.metricsBlockTypes.revpar.key]: this.$t("RevPAR"),
        [RevenueReportService.metricsBlockTypes.adr.key]: this.$t("ADR"),
        [RevenueReportService.metricsBlockTypes.load.key]: this.$t("Загрузка"),
      };
      return this.selectedChartMetrics.map(metric => labels[metric]).join("/");
    },
    currencyAxisTitle() {
      if (this.isRevparSelected && this.isAdrSelected) {
        return `${this.$t("RevPAR, ADR")} ${this.hotel.currency_sign}`;
      }
      if (this.isRevparSelected) {
        return `${this.$t("RevPAR")} ${this.hotel.currency_sign}`;
      }
      if (this.isAdrSelected) {
        return `${this.$t("ADR")} ${this.hotel.currency_sign}`;
      }
      return "";
    },
    getChartDataSource() {
      const dataSources = {
        [RevenueReportService.metricsBlockTypes.revpar.key]: this.revparData,
        [RevenueReportService.metricsBlockTypes.adr.key]: this.adrData,
        [RevenueReportService.metricsBlockTypes.load.key]: this.loadData,
      };
      const metric = this.selectedChartMetrics.find(item => dataSources[item]?.length);
      return metric ? dataSources[metric] : this.adrData;
    },
    chartData() {
      const labels = [];
      const dataSource = this.getChartDataSource;
      let isSomeFuture = false;
      let isTodayInRange = false;
      let isSomePast = false;
      for (const item of dataSource) {
        labels.push(item.day);
        if (item.phase === "future") isSomeFuture = true;
        if (item.phase === "today") isTodayInRange = true;
        if (item.phase === "past") isSomePast = true;
      }

      const isNeedChangeLabels = (isSomeFuture && !isSomePast) || (!isSomeFuture && !isSomePast);

      let datasets = this.getMainDatasetConfig(isNeedChangeLabels);

      if (isTodayInRange) {
        datasets.push({
          type: "line",
          label: this.$t("Текущая дата"),
          specType: "future",
          borderColor: this.$vuetify.theme.currentTheme.error,
          order: orderStrategies[orderDictionary.second],
        });
      }

      if (isSomeFuture && isSomePast) {
        datasets = datasets.concat(this.getAdditionalFutureDataset());
      }

      datasets.sort((a, b) => a.order - b.order);

      return {
        labels,
        datasets,
      };
    },
  },
  watch: {
    selectedMetrics() {
      this.setChartOptions();
    },
  },
  created() {
    this.setChartOptions();
  },
  methods: {
    setChartOptions() {
      const { max, stepSize } = modules.fixStepSize(this.chartData.datasets, 5);
      const chartOptions = modules.getDefaultChartOpts.bind(this)();
      const percentage = {
        position: "right",
        grid: {
          borderWidth: 0,
          drawTicks: false,
          drawOnChartArea: true,
        },
        title: {
          display: true,
          text: this.$t("Загрузка %"),
          color: this.$vuetify.theme.themes.light.secondary.darken3,
          font: {
            size: 12,
            weight: 400,
          },
          padding: {
            left: 0,
            right: 20,
            top: 0,
            bottom: 0,
          },
          align: "center",
        },
        ticks: {
          beginAtZero: false,
          callback: val => `${val}%`,
          stepSize: 25,
        },
        max: 100,
      };

      chartOptions.scales.yAxisKey.grid.display = false;
      chartOptions.scales.xAxisKey.title.text = this.$t("Дата");
      chartOptions.scales.xAxisKey.ticks.labelOffset = 0;
      chartOptions.scales.xAxisKey.ticks.align = "start";

      chartOptions.scales.yAxisKey.ticks = { ...chartOptions.scales.yAxisKey.ticks, stepSize };
      chartOptions.scales.yAxisKey.max = max;
      chartOptions.scales.yAxisKey.ticks.callback = val => RevenueReportModel.formattedValue(val);
      chartOptions.scales.yAxisKey.title.text = this.currencyAxisTitle;

      if (this.isLoadSelected) {
        chartOptions.scales.percentage = percentage;
      }

      chartOptions.plugins["line-marker"] = {
        borderColor: this?.$vuetify?.theme?.currentTheme?.error,
        borderWidth: 1.5,
        dash: [4, 3],
      };

      chartOptions.plugins.legend.fullSize = false;
      chartOptions.plugins.tooltip.position = "maxY";

      this.chartOptions = chartOptions;
    },
    getMainDatasetConfig(isNeedChangeLabels) {
      const order = isNeedChangeLabels ? orderStrategies[orderDictionary.third] : orderStrategies[orderDictionary.first];
      const datasets = [];

      if (this.isRevparSelected) {
        datasets.push({
          type: "line",
          label: isNeedChangeLabels ? this.$t("RevPAR на будущие даты") : this.$t("Итог RevPAR"),
          data: this.revparData,
          borderColor: colors.primary.blue,
          segment: {
            borderDash: (ctx) => PHASE_DASH[ctx.p0.raw.phase],
            borderWidth: (ctx) => PHASE_WIDTH[ctx.p0.raw.phase],
          },
          specType: isNeedChangeLabels ? "future" : "box",
          order,
        });
      }

      if (this.isAdrSelected) {
        datasets.push({
          type: "line",
          label: isNeedChangeLabels ? this.$t("ADR на будущие даты") : this.$t("Итог ADR"),
          data: this.adrData,
          borderColor: this.$vuetify.theme.themes.light.sand,
          segment: {
            borderDash: (ctx) => PHASE_DASH[ctx.p0.raw.phase],
            borderWidth: (ctx) => PHASE_WIDTH[ctx.p0.raw.phase],
          },
          specType: isNeedChangeLabels ? "future" : "box",
          order,
        });
      }

      if (this.isLoadSelected) {
        datasets.push({
          type: "bar",
          label: isNeedChangeLabels ? this.$t("Загрузка на будущие даты") : this.$t("Итог Загрузка"),
          data: this.loadData,
          borderColor: isNeedChangeLabels ? "#7ec8ea" : this.$vuetify.theme.currentTheme.primary,
          categoryPercentage: 0.8,
          maxBarThickness: 24,
          backgroundColor: (element) => {
            if (element?.raw?.phase === "future" || element?.raw?.phase === "today") {
              // todo: заменить на переменные sass/vuetify цвета
              return "#7ec8ea";
            }
            return this.$vuetify.theme.currentTheme.primary;
          },
          specType: "future-box",
          borderRadius: 2,
          yAxisID: "percentage",
          order,
        });
      }

      return datasets;
    },
    getAdditionalFutureDataset() {
      const datasets = [];

      if (this.isRevparSelected) {
        datasets.push({
          type: "line",
          label: this.$t("RevPAR на будущие даты"),
          data: [],
          specType: "future",
          borderColor: colors.primary.blue,
          filterType: "future",
        });
      }

      if (this.isAdrSelected) {
        datasets.push({
          type: "line",
          label: this.$t("ADR на будущие даты"),
          data: [],
          specType: "future",
          borderColor: this.$vuetify.theme.themes.light.sand,
          filterType: "future",
        });
      }

      if (this.isLoadSelected) {
        datasets.push({
          type: "line",
          label: this.$t("Загрузка на будущие даты"),
          data: [],
          specType: "future-box",
          // todo: заменить на переменные sass/vuetify цвета
          borderColor: "#7ec8ea",
          filterType: "future",
        });
      }

      return datasets;
    },
  },
};
</script>
