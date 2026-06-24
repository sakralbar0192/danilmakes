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
    data-test="bnovo-report-revenue-graph-accommodation"
    @toggle-full-screen="toggleFullScreen"
  >
    <template #tooltip="{ slotProps: wrapperRef }">
      <tooltip-template
        :is-visible="tooltipActive"
        :tooltip-data="tooltipData"
        :position="tooltipPosition"
        :graph-id="chartId"
        :wrapper-ref="wrapperRef"
        data-test="bnovo-report-revenue-graph-accommodation-tooltip"
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
import { mapGetters, mapState } from "vuex";
import GraphTemplate from "./graph-template.vue";
import TooltipTemplate from "./tooltip-template.vue";
import SharedGraphSettings from "./mixins/sharedGraphSettings";
import SharedTooltipSettings from "./mixins/sharedTooltipSettings";
import SharedPlanGraphSettings from "./mixins/sharedPlanGraphSettings";
import PlanTooltipContent from "./tooltips/plan-tooltip-content.vue";

/**
 * Особенности:
 * - Автоматическое переключение между тысячами (К) и миллионами (М)
 * - Всегда 5 горизонтальных делений
 * - Правильное округление до чисел кратных 4
 * - Верхняя линия всегда выше максимального значения данных
 */
export default {
  name: "BnovoReportRevenueGraphRevenue",
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
    return { title: this.$t("Доход за проживание") };
  },
  computed: {
    ...mapGetters("revenueReport", ["categorySelectedText", "categorySelectedAttributeText", "currentGroupTypeId"]),
    ...mapState("revenueReport", ["revenueData", "externalFilters", "revenuePlan"]),
    getChartDataSource() {
      return this.revenueData;
    },
    getPlanDataSource() {
      return this.revenuePlan;
    },
  },
  created() {
    const {
      max, stepSize, isMillions,
    } = modules.calculateRevenueScale(this.chartData.datasets);
    const chartOptions = modules.getDefaultChartOpts.bind(this)();
    const ticksY = {
      // Форматируем числа в зависимости от масштаба (тысячи или миллионы)
      callback: (val) => modules.formatNumberWithSuffix(val, isMillions),
      stepSize,
    };
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
    chartOptions.scales.yAxisKey.title.text = `${this.$t("Доход")}, ${this.hotel.currency_sign}`;
    chartOptions.scales.yAxisKey.max = max;
    chartOptions.scales.yAxisKey.title.padding = 8;
    this.chartOptions = chartOptions;
  },
};
</script>
