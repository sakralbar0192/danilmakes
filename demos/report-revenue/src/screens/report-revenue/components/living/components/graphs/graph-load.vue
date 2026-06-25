<template>
  <graph-template
    :id="chartId"
    :chart-options-prop="chartOptions"
    :chart-data-prop="chartData"
    :chart-plugins-prop="plugins"
    :caption="captionWithoutCount"
    :title="title"
    :additional-classes="additionalClasses"
    :in-modal="inModal"
    @toggle-full-screen="toggleFullScreen"
  >
    <template #tooltip="{ slotProps: wrapperRef }">
      <tooltip-template
        :is-visible="tooltipActive"
        :position="tooltipPosition"
        :graph-id="chartId"
        :wrapper-ref="wrapperRef"
        :tooltip-data="tooltipData"
      >
        <template #(loadPlan)-content="props">
          <plan-tooltip-content
            v-bind="props"
            :fractions="1"
            :can-show-percentage-diff="false"
          />
        </template>
      </tooltip-template>
    </template>
  </graph-template>
</template>

<script>
import modules from "@/screens/report-revenue/assets/modules";
import { mapState, mapGetters } from "vuex";
import GraphTemplate from "./graph-template.vue";
import TooltipTemplate from "./tooltip-template.vue";
import SharedGraphSettings from "./mixins/sharedGraphSettings";
import SharedTooltipSettings from "./mixins/sharedTooltipSettings";
import strategiesDatasetDictionary from "./dictionaries/strategiesDatasetDictionary";
import SharedPlanGraphSettings from "./mixins/sharedPlanGraphSettings";
import PlanTooltipContent from "./tooltips/plan-tooltip-content.vue";

export default {
  name: "ReportRevenueGraphLoad",
  components: {
    PlanTooltipContent,
    GraphTemplate,
    TooltipTemplate,
  },
  mixins: [
    SharedGraphSettings,
    SharedTooltipSettings,
    SharedPlanGraphSettings,
  ],
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
  data() {
    return { title: this.$t("Загрузка") };
  },
  lineStrategy: strategiesDatasetDictionary.filled,
  barStrategy: strategiesDatasetDictionary.default,
  computed: {
    ...mapGetters("revenueReport", ["categorySelectedText", "categorySelectedAttributeText"]),
    ...mapState("revenueReport", ["loadData", "externalFilters", "loadPlan"]),
    getChartDataSource() {
      return this.loadData;
    },
    getPlanDataSource() {
      return this.loadPlan;
    },
  },
  created() {
    const max = 100;
    const stepSize = 25;
    const chartOptions = modules.getDefaultChartOpts.bind(this)();
    const ticksY = { stepSize };
    chartOptions.plugins["line-marker"] = {
      borderColor: this?.$vuetify?.theme?.currentTheme?.error,
      borderWidth: 1.5,
      dash: [4, 3],
    };
    chartOptions.fill = true;
    chartOptions.scales.xAxisKey.ticks.padding = 4;
    chartOptions.scales.xAxisKey.ticks.labelOffset = 0;
    chartOptions.scales.xAxisKey.title.text = this.$t("Дата");
    chartOptions.scales.yAxisKey.ticks = { ...chartOptions.scales.yAxisKey.ticks, ...ticksY };
    chartOptions.scales.yAxisKey.title.text = `${this.$t("Загрузка")}, %`;
    chartOptions.scales.yAxisKey.max = max;
    chartOptions.scales.yAxisKey.title.padding = 8;
    this.chartOptions = chartOptions;
  },
  methods: {
    getMainDatasetLabel({
      isSomePast, isSomeFuture, isTodayInRange,
    }) {
      let result = this.$t("Итог");
      if (isSomePast && !isSomeFuture && !isTodayInRange) {
        result = this.$t("Итог Загрузка");
      } else if (!isSomePast && isSomeFuture) {
        result = this.$t("Загрузка на будущие даты");
      }

      return result;
    },
    getFutureDatasetLabel() {
      return this.$t("Загрузка на будущие даты");
    },
  },
};
</script>
