<template>
  <b-mixed-chart
    id="report-revenue-doughnut-graph"
    data-test="bnovo-report-revenue-graph-doughnut"
    chart
    :chart-data="formattedData"
    chart-type="doughnut"
    :plugins="doughnutPlugin"
    height="272px"
    width="272px"
  />
</template>

<script>
import colors from "@/utils/colors";
import vuetify from "@/plugins/vuetify";
import RevenueReportModel from "@/models/reports/revenue/revenue-report";

const BACKGROUND_COLORS = Object.freeze([
  "#E5F6E8",
  "#FEF2E1",
]);

const BORDER_COLORS = Object.freeze([
  colors.success.light,
  vuetify.preset.theme.themes.light.sand,
]);

export default {
  name: "BnovoReportRevenueGraphDoughnut",
  props: {
    chartData: {
      type: Array,
      default: () => [],
      required: true,
    },
  },
  data() {
    return {
      doughnutPlugin: [
        {
          id: "doughnutPlugin",
          beforeInit(chart) {
            chart.options.maintainAspectRatio = false;
            chart.options.events = [];
            chart.options.plugins = {
              datalabels: { display: false },
              legend: { display: false },
            };

            const dataset = chart?.data?.datasets[0];

            if (!dataset) {
              return false;
            }

            dataset.borderWidth = 2;
            dataset.borderRadius = 2;

            chart.total = dataset.data.reduce((a, b) => a + b, 0); // Общая сумма всех значений

            dataset.originData = dataset.data;
          },
          afterDraw: (function (chart) {
            const { ctx, chartArea } = chart;

            const centerX = (chartArea.left + chartArea.right) / 2;
            const centerY = (chartArea.top + chartArea.bottom) / 2;

            ctx.textAlign = "center";
            ctx.fillStyle = "#3C435A";
            ctx.textBaseline = "middle";
            ctx.font = "600 20px Inter";

            const value = RevenueReportModel.formattedValue((Math.trunc(chart.total)));

            ctx.fillText(value, centerX, centerY - 8);

            ctx.fillStyle = "#838A9A";
            ctx.font = "400 12px Inter";

            ctx.fillText(this.hotel.currency_sign, centerX, centerY + 8);
          }).bind(this),
        },

      ],
    };
  },
  computed: {
    formattedData() {
      return {
        datasets: [{
          data: this.chartData, backgroundColor: BACKGROUND_COLORS, borderColor: BORDER_COLORS, spacing: 4,
        }],
      };
    },
  },
};
</script>
