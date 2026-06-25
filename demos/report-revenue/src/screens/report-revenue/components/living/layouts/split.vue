<template>
  <div class="report-revenue__graph-layout report-revenue__graph-layout--split">
    <div
      v-if="isAmountSelected"
      class="report-revenue__graph-wrapper report-revenue__graph-wrapper--total"
    >
      <graph-revenue
        v-if="!isReportDataFetching"
        v-show="isReportActual"
        @toggle-full-screen="showGraphModalEmit(graphRevenue)"
      />
    </div>
    <div v-if="isRevparSelected" class="report-revenue__graph-wrapper">
      <graph-revpar
        v-if="!isReportDataFetching"
        @toggle-full-screen="showGraphModalEmit(graphRevPAR)"
      />
    </div>
    <div v-if="isAdrSelected" class="report-revenue__graph-wrapper">
      <graph-adr
        v-if="!isReportDataFetching"
        @toggle-full-screen="showGraphModalEmit(graphADR)"
      />
    </div>
    <div v-if="isLoadSelected" class="report-revenue__graph-wrapper">
      <graph-load
        v-if="!isReportDataFetching"
        @toggle-full-screen="showGraphModalEmit(graphLoad)"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import RevenueReportService from "@/services/reports/revenue-report";
import GraphRevenue from "../components/graphs/graph-revenue.vue";
import GraphRevpar from "../components/graphs/graph-revpar.vue";
import GraphAdr from "../components/graphs/graph-adr.vue";
import GraphLoad from "../components/graphs/graph-load.vue";

export default {
  name: "ReportRevenueSplitGraphLayout",
  components: {
    GraphRevenue, GraphRevpar, GraphAdr, GraphLoad,
  },
  computed: {
    ...mapState("revenueReport", ["isReportDataFetching", "isReportActual", "selectedMetrics"]),
    selectedMetricsSet() {
      return new Set(this.selectedMetrics);
    },
    isAmountSelected() {
      return this.selectedMetricsSet.has(RevenueReportService.metricsBlockTypes.amount.key);
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
    graphRevenue() {
      return GraphRevenue;
    },
    graphRevPAR() {
      return GraphRevpar;
    },
    graphADR() {
      return GraphAdr;
    },
    graphLoad() {
      return GraphLoad;
    },
  },
  methods: {
    showGraphModalEmit(graph) {
      this.$emit("showGraphModal", graph);
    },
  },
};
</script>

<style lang="scss">
.report-revenue__graph-layout--split {
  display: flex;
  flex-direction: column;
  gap: map-get($gaps, groups);
}

.report-revenue__graph-wrapper--total {
  display: flex;
  gap: 8px;

  .report-revenue__card-graph-wrapper {
    flex-grow: 1;
  }
}
</style>
