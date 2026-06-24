<template>
  <div
    class="mb-ingroup bnovo-report-revenue__graph-layout--multiply"
    :class="{ 'bnovo-report-revenue__graph-layout--single': isSingleGraphVisible }"
  >
    <div v-if="isAmountSelected" class="bnovo-report-revenue__graph-wrapper">
      <graph-revenue
        v-if="!isReportDataFetching"
        @toggle-full-screen="showGraphModalEmit(graphRevenue)"
      />
    </div>
    <div v-if="isAdrRevparLoadSelected" class="bnovo-report-revenue__graph-wrapper">
      <graph-adr-revpar-load
        v-if="!isReportDataFetching"
        @toggle-full-screen="showGraphModalEmit(GraphAdrRevparLoad)"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import RevenueReportService from "@/services/reports/revenue-report";
import GraphRevenue from "../components/graphs/graph-revenue.vue";
import GraphAdrRevparLoad from "../components/graphs/graph-adr-revpar-load.vue";

export default {
  name: "BnovoReportRevenueDefaultGraphLayout",
  components: { GraphRevenue, GraphAdrRevparLoad },
  computed: {
    ...mapState("revenueReport", ["isReportDataFetching", "selectedMetrics"]),
    isAmountSelected() {
      return this.selectedMetrics.includes(RevenueReportService.metricsBlockTypes.amount.key);
    },
    isAdrRevparLoadSelected() {
      const {
        adr,
        revpar,
        load,
      } = RevenueReportService.metricsBlockTypes;
      return this.selectedMetrics.some(metric => (
        metric === adr.key || metric === revpar.key || metric === load.key
      ));
    },
    isSingleGraphVisible() {
      return this.isAmountSelected !== this.isAdrRevparLoadSelected;
    },
    graphRevenue() {
      return GraphRevenue;
    },
    GraphAdrRevparLoad() {
      return GraphAdrRevparLoad;
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

.bnovo-report-revenue__graph-layout--multiply {
  display: flex;
  gap: 16px;

  & .bnovo-report-revenue__graph-wrapper {
    flex-grow: 1;
    max-width: 50%;
  }
}

.bnovo-report-revenue__graph-layout--single {
  & .bnovo-report-revenue__graph-wrapper {
    max-width: 100%;
  }
}

@media (max-width: map-get($grid-breakpoints-custom, lg)) {
  .bnovo-report-revenue__graph-layout--multiply {
    flex-direction: column;

    & .bnovo-report-revenue__graph-wrapper {
      max-width: 100%;
    }
  }
}

</style>
