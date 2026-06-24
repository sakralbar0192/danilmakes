<template>
  <div class="set mb-ingroup">
    <div
      v-if="isAmountSelected"
      class="bnovo-report-revenue__graph-wrapper bnovo-report-revenue__graph-wrapper--total"
    >
      <widget-doughnut-total
        v-if="isAllAvailableCategorySelected && isReportActual"
        class="bnovo-report-revenue__widget-doughunt--split"
      />
      <div v-if="!isReportDataFetching" class="bnovo-report-revenue__graph-with-doughnut">
        <graph-revenue
          v-show="isReportActual"
          @toggle-full-screen="showGraphModalEmit(graphRevenue)"
        />
      </div>
    </div>
    <div v-if="isRevparSelected" class="bnovo-report-revenue__graph-wrapper">
      <graph-revpar
        v-if="!isReportDataFetching"
        @toggle-full-screen="showGraphModalEmit(graphRevPAR)"
      />
    </div>
    <div v-if="isAdrSelected" class="bnovo-report-revenue__graph-wrapper">
      <graph-adr
        v-if="!isReportDataFetching"
        @toggle-full-screen="showGraphModalEmit(graphADR)"
      />
    </div>
    <div v-if="isLoadSelected" class="bnovo-report-revenue__graph-wrapper">
      <graph-load
        v-if="!isReportDataFetching"
        @toggle-full-screen="showGraphModalEmit(graphLoad)"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import RevenueReportService from "@/services/reports/revenue-report";
import GraphRevenue from "../components/graphs/graph-revenue.vue";
import GraphRevpar from "../components/graphs/graph-revpar.vue";
import GraphAdr from "../components/graphs/graph-adr.vue";
import GraphLoad from "../components/graphs/graph-load.vue";
import WidgetDoughnutTotal from "../components/graphs/widget-doughnut-total.vue";

export default {
  name: "BnovoReportRevenueSplitGraphLayout",
  components: {
    GraphRevenue, GraphRevpar, GraphAdr, GraphLoad, WidgetDoughnutTotal,
  },
  computed: {
    ...mapGetters("revenueReport", ["isAllAvailableCategorySelected"]),
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
.bnovo-report-revenue__graph-wrapper--total {
  display: flex;
  gap: 8px;

  .bnovo-report-revenue__card-graph-wrapper {
    flex-grow: 1;
  }
}

.bnovo-report-revenue__graph-with-doughnut {
  flex-grow: 1;

  >div {
    height: 100%;
  }
}

@media (max-width: map-get($grid-breakpoints-custom, md)) {
  .bnovo-report-revenue__graph-with-doughnut {
    overflow: auto;
  }
}

@media (max-width: map-get($grid-breakpoints-custom, sm)) {
  .bnovo-report-revenue__graph-wrapper--total {
    flex-direction: column;
    gap: 16px;

    & .bnovo-report-revenue__widget-doughunt--split {
      height: auto;
    }
  }
}
</style>
