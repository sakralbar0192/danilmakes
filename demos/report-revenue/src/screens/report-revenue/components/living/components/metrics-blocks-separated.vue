<template>
  <v-app v-if="hasHotelExperimentsForShown">
    <section :class="{'set': !isHidden}">
      <header class="d-inline-flex align-baseline">
        <h3 class="text-h3 mb-0">
          {{ headerText }}
        </h3>
        <a class="ml-4 v-link--no-underline nowrap" href="#" @click="toggle">
          {{ showButtonText }}
          <v-icon small class="bnovo-report-revenue-chevron">
            {{ icon }}
          </v-icon>
        </a>
      </header>
      <footer :class="['mb-4', 'bnovo-report-revenue__slide-element', {'bnovo-report-revenue__slide-element--hide': isHidden}]">
        <div class="d-inline-flex mb-5">
          <p class="mb-0">
            {{ $t("Основные показатели, характеризующие эффективность гостиничного бизнеса. Подробнее в отчете") }}&nbsp;
            <a href="/reports/revenue" target="_blank">{{ $t("«Доход, ADR, Загрузка»") }}</a>
          </p>
        </div>
        <metrics-blocks context="separated"/>
      </footer>
    </section>
  </v-app>
</template>

<script>
import { mapState, mapActions } from "vuex";
import moment from "moment";
import RevenueReportService from "@/services/reports/revenue-report";
import { getActualAccount } from "@/router/helpers/account";
import MetricsBlocks from "./metrics-blocks.vue";

// временно скрыто от пользователей
const IS_HIDDEN_FROM_USERS = true;

export default {
  name: "BnovoReportRevenueMetricsBlocksSepatated",
  components: { MetricsBlocks },
  data() {
    return { isHidden: true };
  },
  computed: {
    ...mapState("hotelRoom", ["roomtypes"]),
    ...mapState("revenueReport", ["externalFilters", "additionalServices"]),
    showButtonText() {
      let result = this.$t("Скрыть");
      if (this.isHidden) result = this.$t("Показать");
      return result;
    },
    icon() {
      let result = "icon-chevron-up";
      if (this.isHidden) result = "icon-chevron-down";
      return result;
    },
    selectedMonth() {
      return moment(this.externalFilters.periodOfStay[0]).format("MMMM");
    },
    headerText() {
      return `${this.$t("Основные показатели за")} ${this.$t(this.selectedMonth)}`;
    },
    hasRoleForShown() {
      return this.user.roles.includes("hotel_reports_services") || this.user.roles.includes("hotel_reports_adr") || this.user.roles.includes("hotel_owner");
    },
    hasHotelExperimentsForShown() {
      return this.hasRoleForShown && !IS_HIDDEN_FROM_USERS;
    },
  },
  async beforeCreate() {
    if (IS_HIDDEN_FROM_USERS) return;
    const promiseArray = [
      getActualAccount(),
      this.$store.dispatch("hotelRoom/getRoomTypes"),
      this.$store.dispatch("revenueReport/getAdditionalServices"),
    ];
    await Promise.all(promiseArray);
    if (!this.hasHotelExperimentsForShown) return;
    const currentHotelId = this?.hotel?.id;
    this.isHidden = currentHotelId ? Boolean(this.user?.extra?.revenue_report_data?.[currentHotelId]?.metrics_block_hidden) : true;

    const selectedCategories = this.roomtypes.reduce((arr, roomtype) => {
      if (roomtype?.rooms?.length && !roomtype?.extra?.excluded) {
        arr.push(roomtype.id);
      }
      return arr;
    }, []);

    const selectedServices = this.additionalServices.reduce((arr, service) => {
      if (!service.deleted) {
        arr.push(service.id);
      }
      return arr;
    }, []);

    await this.$store.dispatch("revenueReport/setExternalData", { selectedCategories, selectedServices });
    await this.getReportData();
  },
  methods: {
    ...mapActions("revenueReport", ["getReportData"]),
    async toggle() {
      this.isHidden = !this.isHidden;
      await RevenueReportService.saveBlockStatus(this.isHidden);
    },
  },
};
</script>

<style lang="scss">
.bnovo-report-revenue-chevron {
    color: $primary !important;
}

.bnovo-report-revenue__slide-element {
    max-height: max-content;
    transition: max-height 0.5s ease, opacity 0.5s ease;
}

.bnovo-report-revenue__slide-element--hide {
    max-height: 0;
    z-index: -1;
    opacity: 0;
}

section footer .bnovo-report-revenue-metrics-block {
  max-width: 1664px;
  grid-template-columns: repeat(5, 1fr);
}

@media (max-width: map-get($grid-breakpoints-custom, lg)) {
  section footer .bnovo-report-revenue-metrics-block {
    max-width: 1000px;
    grid-template-columns: 1fr 1fr;
    row-gap: 16px !important;
    & .bnovo-report-revenue__card-wrapper {
      max-width: none;
    }
  }
}

@media (max-width: map-get($grid-breakpoints-custom, sm)) {
  section footer .bnovo-report-revenue-metrics-block {
    grid-template-columns: 1fr;
  }
}
</style>
