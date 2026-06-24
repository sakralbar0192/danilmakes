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
  watch: {
    chartData() {
      const chr = Chart.getChart(this.id);
      if (chr) {
        chr.data = this.chartData;
        chr.options = this.chartOptions;
        chr.update();
        return;
      }
      this.rebuild();
    },
  },
  mounted() {
    this.rebuild();
  },
  beforeUnmount() {
    const chr = Chart.getChart(this.id);
    chr?.destroy();
  },
  methods: {
    rebuild() {
      const existing = Chart.getChart(this.id);
      existing?.destroy();
      const chartElement = this.$refs.canvas;
      if (!chartElement || !this.chartData) {
        return;
      }
      // eslint-disable-next-line no-new
      new Chart(chartElement, {
        type: this.chartType,
        data: this.chartData,
        options: this.chartOptions,
        plugins: this.plugins,
      });
    },
  },
};
</script>
