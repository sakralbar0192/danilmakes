<template>
  <div class="chart-mixed" :style="{width, height}">
    <b-chart
      :id="id"
      :chart-options="chartOptions"
      :chart-data="chartData"
      :chart-type="chartType"
      :dataset-id-key="datasetIdKey"
      :plugins="plugins"
      :css-classes="cssClasses"
      :styles="styles"
      :width="width"
      :height="height"
    />
  </div>
</template>

<script>
import BChart from "./b-chart.vue";

export default {
  name: "BMixedChart",
  components: { BChart },
  props: {
    id: {
      type: String,
      default: "chr",
    },
    chartOptions: {
      type: Object,
      default: () => {
        return {};
      },
    },
    chartData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    chartType: {
      type: String,
      default: "bar",
    },
    datasetIdKey: {
      type: String,
      default: "label",
    },
    width: {
      type: String,
      default: "auto",
    },
    height: {
      type: String,
      default: "400px",
    },
    cssClasses: {
      default: "",
      type: String,
    },
    styles: {
      type: Object,
      default: () => {
      },
    },
    plugins: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {};
  },
};
</script>
