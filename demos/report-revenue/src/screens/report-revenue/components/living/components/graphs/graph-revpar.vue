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
        <template #(plan)-content="props">
          <plan-tooltip-content v-bind="props"/>
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
  name: "ReportRevenueGraphRevPAR",
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
  lineStrategy: strategiesDatasetDictionary.notFilled,
  barStrategy: strategiesDatasetDictionary.default,
  data() {
    return { title: this.$t("RevPAR") };
  },
  computed: {
    ...mapGetters("revenueReport", ["categorySelectedText", "categorySelectedAttributeText"]),
    ...mapState("revenueReport", ["revparData", "externalFilters", "revparPlan"]),
    getChartDataSource() {
      return this.revparData;
    },
    getPlanDataSource() {
      return this.revparPlan;
    },
  },
  created() {
    const { max, stepSize } = modules.fixStepSize(this.chartData.datasets, 5);
    const chartOptions = modules.getDefaultChartOpts.bind(this)();
    const ticksY = {
      callback: (val) => modules.formatNumberWithSuffix(val, false),
      stepSize,
    };

    chartOptions.plugins["line-marker"] = {
      borderColor: this?.$vuetify?.theme?.currentTheme?.error,
      borderWidth: 1.5,
      dash: [4, 3],
    };
    chartOptions.scales.xAxisKey.ticks.padding = 4;
    chartOptions.scales.xAxisKey.ticks.labelOffset = 0;
    chartOptions.scales.xAxisKey.title.text = this.$t("Дата");
    chartOptions.scales.yAxisKey.ticks = { ...chartOptions.scales.yAxisKey.ticks, ...ticksY };
    chartOptions.scales.yAxisKey.title.text = `${this.$t("RevPAR")}, ${this.hotel.currency_sign}`;
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
        result = this.$t("Итог RevPAR");
      } else if (!isSomePast && isSomeFuture) {
        result = this.$t("RevPAR на будущие даты");
      }

      return result;
    },
    getFutureDatasetLabel() {
      return this.$t("RevPAR на будущие даты");
    },
  },
};
</script>
