<template>
  <div class="chart-mixed" :style="{ width, height }">
    <b-chart
      :id="id"
      :chart-options="chartOptions"
      :chart-data="chartData"
      :chart-type="chartType"
      :plugins="plugins"
    />
  </div>
</template>

<script>
import BChart from "./b-chart.vue";

export default {
  name: "BMixedChart",
  components: { BChart },
  props: {
    id: { type: String, default: "chr" },
    chartOptions: { type: Object, default: () => ({}) },
    chartData: { type: Object, default: () => ({}) },
    chartType: { type: String, default: "bar" },
    plugins: { type: Array, default: () => [] },
    width: { type: String, default: "100%" },
    height: { type: String, default: "100%" },
  },
};
</script>
