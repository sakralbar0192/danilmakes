<template>
  <div :class="chartType" style="height: 100%; width: 100%;">
    <canvas :id="id" ref="canvas"/>
  </div>
</template>

<script>
import Chart from "chart.js/auto";

Chart.defaults.elements.point.radius = 0;
Chart.defaults.scales.linear.min = 0;
Chart.defaults.font.family = "\"Inter\", Sans-serif, Arial";

export default {
  name: "BChart",
  props: {
    chartType: String,
    chartData: Object,
    chartOptions: Object,
    plugins: Array,
    id: {
      type: String,
      default: "chr",
    },
  },
  data() {
    return {};
  },
  watch: {
    chartData() {
      const chr = Chart.getChart(this.id);
      chr.destroy();
      const {
        chartType, chartData, chartOptions, plugins,
      } = this;
      this.chartConstructor(chartType, chartData, chartOptions, plugins);
    },
  },
  mounted() {
    const {
      chartType, chartData, chartOptions, plugins,
    } = this;
    this.chartConstructor(chartType, chartData, chartOptions, plugins);
  },
  methods: {
    chartConstructor(chartType, chartData, chartOptions, plugins) {
      const chartElement = this.$refs.canvas;
      const chart = new Chart(chartElement, {
        type: this.chartType,
        data: this.chartData,
        options: this.chartOptions,
        plugins: this.plugins,
      });
    },
  },
};
</script>
