<template>
  <section class="set report-revenue-living">
    <template v-if="isEmptyReport">
      <v-row>
        <b-col class="set justify-items-center py-8">
          <template v-if="isNoRoomtypes">
            <error-empty>
              {{ $t("Нет данных для показа, так как в объекте отсутствуют категории") }}
            </error-empty>
          </template>
          <template v-else>
            <error-empty>
              {{ $t("Нет данных для показа, так как в объекте отсутствуют номера") }}
            </error-empty>
          </template>
        </b-col>
      </v-row>
    </template>
    <template v-else-if="canShowReport">
      <div
        v-if="!isPastAndFutureFullMonth"
        class="report-revenue-living__section report-revenue__metrics-section"
      >
        <metrics-block/>
      </div>
      <div class="report-revenue-living__section">
        <component
          :is="currentLayout"
          @showGraphModal="showGraphModal"
        />
      </div>
      <div class="report-revenue-living__section report-revenue-living__section--table">
        <report-revenue-living-page-table/>
      </div>
    </template>
    <div v-else class="d-flex justify-center align-center py-8">
      <v-icon class="icon-alert-circle" left color="primary"/>
      {{ $t("Нет данных для показа") }}
    </div>
  </section>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import ReportRevenueLivingPageTable from "./components/table.vue";
import MetricsBlock from "./components/metrics-blocks.vue";
import ErrorEmpty from "../shared/error-empty.vue";
import DefaultLayoutGraph from "./layouts/default.vue";
import SplitLayoutGraph from "./layouts/split.vue";

export default {
  name: "ReportRevenueLivingPage",
  components: {
    ReportRevenueLivingPageTable,
    MetricsBlock,
    ErrorEmpty,
    DefaultLayoutGraph,
    SplitLayoutGraph,
  },
  computed: {
    ...mapGetters("revenueReport", ["isPastAndFutureFullMonth", "canShowReport"]),
    ...mapState("hotelRoom", ["roomtypes", "roomtypesReady"]),
    currentLayout() {
      return this.isPastAndFutureFullMonth ? SplitLayoutGraph : DefaultLayoutGraph;
    },
    isNoRooms() {
      return this.roomtypes.every(roomtype => roomtype.rooms.length === 0);
    },
    isNoRoomtypes() {
      return this.roomtypes.length === 0;
    },
    isEmptyReport() {
      return this.roomtypesReady && (this.isNoRooms || this.isNoRoomtypes);
    },
  },
  methods: {
    showGraphModal(graph) {
      this.$dialog.modal({
        simple: true,
        closable: false,
        modalContent: graph,
        props: { inModal: true },
        size: "xxLarge",
      });
    },
  },
};
</script>

<style lang="scss">

.report-revenue-living {
  display: flex;
  flex-direction: column;
  gap: map-get($gaps, outer);
  padding: map-get($gaps, outer);
}

.report-revenue-living__section {
  min-width: 0;
}

.report-revenue-living__section--table {
  overflow-x: auto;
}

.report-revenue__metrics-section {
  display: flex;
  flex-wrap: wrap;
  max-width: max-content;
  gap: map-get($gaps, groups);
  & .report-revenue__card-wrapper {
    min-width: 320px;
  }
}

@media (max-width: map-get($grid-breakpoints-custom, lg)) {
  .report-revenue__metrics-section {
    flex-direction: column;
    max-width: 640px;

    & .report-revenue-metrics-block--total {
      width: auto;
    }
  }
}

@media #{map-get($display-breakpoints, 'lg-and-up')} {
  .report-revenue__metrics-section {
    max-width: max-content;

    & .report-revenue__card-wrapper {
      min-width: 320px;
    }
  }
}

</style>
