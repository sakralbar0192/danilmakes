<template>
  <div class="px-typo report-revenue-screen">
    <v-row dense class="report-revenue__intro-row">
      <v-col cols="12" md="8" lg="12" xl="12">
        <p class="report-revenue__intro">
          {{ $t("В данном отчете представлены основные показатели, характеризующие эффективность гостиничного бизнеса") }}
        </p>
      </v-col>
    </v-row>
    <v-row dense class="report-revenue__panel-row">
      <v-col>
        <v-card flat class="report-revenue__content-panel">
          <report-revenue-living-page/>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters, mapMutations } from "vuex";
import RevenueReportService from "../../services/reports/revenue-report";
import ReportRevenueLivingPage from "./components/living/index.vue";

export default {
  name: "ReportRevenueScreen",
  components: {
    ReportRevenueLivingPage,
  },
  computed: {
    ...mapState("hotelRoom", ["roomtypes"]),
    ...mapGetters("user", ["isGuest"]),
  },
  async created() {
    this.setPageHeaderTestAttributes({ title: "report-revenue-header-title" });
    await this.$store.dispatch("hotelRoom/getRoomTypes");

    const availableCategories = this.roomtypes.reduce((arr, roomtype) => {
      if (roomtype?.rooms?.length && !roomtype?.extra?.excluded && (this.isGuest ? !roomtype?.extra?.exclude_for_report : true)) {
        arr.push(roomtype.id);
      }
      return arr;
    }, []);

    const availableMetrics = Object.values(RevenueReportService.metricsSelectionOptions).map(item => item.key);
    const periodOfStay = RevenueReportService.startDateInterval();

    this.setAvailableCategories({ availableCategories });
    this.setAvailableMetrics({ availableMetrics });
    this.setExternalData({
      selectedCategories: availableCategories,
      selectedMetrics: availableMetrics,
    });
    this.setExternalFilters({
      periodOfStay,
      compare: [],
    });

    const result = await this.getReportData();

    if (result !== "success" && result !== "permission") {
      this.$dialog.toast({
        content: `${this.$t("Ошибка при получении отчета")}`,
        type: "error",
      });
    }
  },
  beforeUnmount() {
    this.setPageHeaderTestAttributes({});
  },
  methods: {
    ...mapActions("revenueReport", [
      "getReportData",
      "setAvailableCategories",
      "setAvailableMetrics",
      "setExternalData",
      "setExternalFilters",
    ]),
    ...mapMutations("page", ["setPageHeaderTestAttributes"]),
  },
};
</script>
