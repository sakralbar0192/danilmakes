<template>
  <section class="set">
    <template v-if="isEmptyReport">
      <v-row>
        <b-col class="set justify-items-center">
          <img
            :src="$localImage('gear-computer-info.svg')"
            loading="lazy"
            width="220"
            height="224"
          >
          <template v-if="isNoRoomtypes">
            <error-empty :href-prop="'/roomTypes'">
              {{ $t("Нет данных для показа, так как в объекте отсутствуют категории") }}
              <template #button>
                {{ $t("Перейти в категории") }}
              </template>
            </error-empty>
          </template>
          <template v-else>
            <error-empty :href-prop="'/room'">
              {{ $t("Нет данных для показа, так как в объекте отсутствуют номера") }}
              <template #button>
                {{ $t("Перейти в номера") }}
              </template>
            </error-empty>
          </template>
        </b-col>
      </v-row>
      <v-row>
        <b-col/>
      </v-row>
    </template>
    <template v-else>
      <category-select-row
        :roomtypes-items-group="roomtypesItemsGroup"
        :disabled-roomtypes-group="disabledRoomtypesGroup"
        :local-selected-categories="localSelectedCategories"
        :local-selected-metrics="localSelectedMetrics"
        :group-type="groupType"
        :group-by-methods="groupByMethods"
        :is-past-and-future-full-month="isPastAndFutureFullMonth"
        :can-show-report="canShowReport"
        @category-select-blur="onCategorySelectBlur"
        @metrics-select-blur="onMetricsSelectBlur"
        @update:localSelectedCategories="setLocalSelectedCategories"
        @update:localSelectedMetrics="setLocalSelectedMetrics"
        @update:groupType="updateGroupedType"
        @excelDownload="excelDownloadHandler"
        @openDrawer="isDrawerShown = true"
      />
    </template>
    <template v-if="!isEmptyReport">
      <template v-if="canShowReport">
        <div
          v-if="!isPastAndFutureFullMonth"
          class="d-flex bnovo-report-revenue__metrics-section pl-1"
          data-tour="bnovo-revenue-report-tour-step-4"
        >
          <widget-doughnut-total v-if="canShowTotalRevenueGraph" class="bnovo-report-revenue__widget-doughunt"/>
          <metrics-block class="py-1"/>
        </div>
        <component
          :is="currentLayout"
          @showGraphModal="showGraphModal"
        />
        <v-row dense class="overflow-x-auto">
          <b-col cols="auto" class="py-0">
            <bnovo-report-revenue-living-page-table/>
          </b-col>
        </v-row>
      </template>
      <div v-else class="d-flex justify-center align-center py-8">
        <v-icon class="icon-alert-circle" left color="primary"/>
        {{ $t("Нет данных для показа. Задайте параметры в фильтрах") }}
      </div>
    </template>
    <goal-drawer
      v-if="goalDrawerEnabled"
      v-model="isDrawerShown"
    />
  </section>
</template>

<script>
import { mapActions, mapState, mapGetters } from "vuex";
import RevenueReportService from "@/services/reports/revenue-report";
import RevenueReportPrimaryModel from "@/models/reports/revenue/revenue-report-primary";
import BnovoReportRevenueLivingPageTable from "./components/table.vue";
import MetricsBlock from "./components/metrics-blocks.vue";
import WidgetDoughnutTotal from "./components/graphs/widget-doughnut-total.vue";
import GoalDrawer from "./components/goal-drawer/index.vue";
import CategorySelectRow from "./components/category-row-select.vue";
import ExcelDownload from "../shared/excel-download.vue";
import ErrorEmpty from "../shared/error-empty.vue";
import DefaultLayoutGraph from "./layouts/default.vue";
import SplitLayoutGraph from "./layouts/split.vue";
import modules from "../../assets/modules";
import { goalDrawerEnabled } from "../../config/screen-config";

export default {
  name: "BnovoReportRevenueLivingPage",
  components: {
    BnovoReportRevenueLivingPageTable,
    MetricsBlock,
    ExcelDownload,
    ErrorEmpty,
    DefaultLayoutGraph,
    SplitLayoutGraph,
    WidgetDoughnutTotal,
    CategorySelectRow,
    GoalDrawer,
  },
  props: {
    configuration: {
      type: String,
      required: true,
    },
  },
  data() {
    return { groupByMethods: RevenueReportPrimaryModel.groupByMethods, isDrawerShown: false, goalDrawerEnabled };
  },
  computed: {
    ...mapGetters("revenueReport", ["isPastAndFutureFullMonth", "canShowReport", "isAllAvailableCategorySelected"]),
    ...mapState("revenueReport", ["selectedCategories", "localSelectedCategories", "selectedMetrics", "localSelectedMetrics", "availableMetrics", "externalFilters", "revenueData", "isReportDataFetching", "servicesReady", "groupType", "isReportActual"]),
    ...mapState("hotelRoom", ["roomtypes", "roomtypesReady"]),
    currentLayout() {
      let result = DefaultLayoutGraph;
      if (this.isPastAndFutureFullMonth) {
        result = SplitLayoutGraph;
      }
      return result;
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
    selectedGroupByMethod: {
      get() {
        return this.groupType;
      },
      set(index) {
        this.updateGroupedType(index);
      },
    },
    selectedCategoriesModel: {
      get() {
        const selectedCategories = Object.keys(this.localSelectedCategories.reduce((obj, categoryId) => {
          obj[categoryId] = [];
          return obj;
        }, {}));
        return { 1: selectedCategories };
      },
      set(v) {
        const keys = Object.keys(v);
        const selectedCategories = [];
        for (const key of keys) {
          v[key].forEach(id => selectedCategories.push(id));
        }
        this.setLocalSelectedCategories(selectedCategories);
      },
    },
    roomtypes() {
      return (this.$store?.state?.hotelRoom?.roomtypes || []);
    },
    roomtypesItemsGroup() {
      const allRoomTypes = this.$store?.state?.hotelRoom?.roomtypes || [];
      const groups = [];

      const hasRoomsGroup = {
        checked: false,
        elements: [],
        id: 1,
        name: this.$t("Категории с номерами"),
        readonly: true,
      };

      const noRoomsGroup = {
        checked: false,
        elements: [],
        id: 2,
        name: this.$t("Категории без номеров"),
        readonly: true,
      };

      for (const roomtype of allRoomTypes) {
        const element = {
          id: roomtype.id,
          name: roomtype.name,
          checked: false,
        };

        if (roomtype?.extra?.exclude_for_report) continue;

        if ((roomtype?.rooms || []).length) {
          hasRoomsGroup.elements.push(element);
        } else {
          noRoomsGroup.elements.push(element);
        }
      }

      groups.push(hasRoomsGroup);
      if (noRoomsGroup.elements.length > 0) {
        groups.push(noRoomsGroup);
      }

      return groups;
    },
    disabledRoomtypes() {
      return (this.$store?.state?.hotelRoom?.roomtypes || []).reduce((disabledArr, roomtype) => {
        if (!(roomtype?.rooms || []).length) disabledArr[roomtype.id] = [];
        return disabledArr;
      }, {});
    },
    disabledRoomtypesGroup() {
      let result = {};
      if (this.roomtypesItemsGroup?.[1]?.elements) {
        result = { 2: this.roomtypesItemsGroup[1].elements.map(element => element.id) };
      }
      return result;
    },
    isNeedToShowBackground() {
      return this.localSelectedCategories.length;
    },
    isNeedToShowMasterBox() {
      return this.roomtypesItemsGroup.length > 1;
    },
    isReportReady() {
      return !this.isReportDataFetching;
    },
    canShowTotalRevenueGraph() {
      return this.isAllAvailableCategorySelected
        && this.isReportActual
        && this.selectedMetrics.includes(RevenueReportService.metricsBlockTypes.amount.key);
    },
  },
  async created() {
    await this.$store.dispatch("hotelRoom/getRoomTypes");
    this.selectedRoomtypes = this.roomtypes.reduce((obj, roomtype) => {
      if (!Object.keys(this.disabledRoomtypes).includes(roomtype.id)) obj[roomtype.id] = [];
      return obj;
    }, {});
  },
  methods: {
    ...mapActions("revenueReport", [
      "setSelectedCategories",
      "setLocalSelectedCategories",
      "setSelectedMetrics",
      "setLocalSelectedMetrics",
      "updateGroupedType",
    ]),
    onCategorySelectBlur() {
      if (modules.haveDifferentContent(this.selectedCategories, this.localSelectedCategories)) {
        this.setSelectedCategories(modules.getRightOrderArray(this.localSelectedCategories, this.roomtypes.map(roomtype => roomtype.id)), this.isReadonly);
      }
    },
    onMetricsSelectBlur() {
      let nextMetrics = this.localSelectedMetrics;
      if (!nextMetrics.length) {
        nextMetrics = this.availableMetrics;
        this.setLocalSelectedMetrics(nextMetrics);
      }
      if (modules.haveDifferentContent(this.selectedMetrics, nextMetrics)) {
        this.setSelectedMetrics(nextMetrics);
      }
    },
    isNoRoomsInRoomtype(roomType) {
      return Object.keys(this.disabledRoomtypes).includes(roomType);
    },
    showGraphModal(graph) {
      const modalContent = graph;
      this.$dialog.modal({
        simple: true,
        closable: false,
        modalContent,
        props: { inModal: true },
        size: "xxLarge",
      });
    },
    async excelDownloadHandler(done) {
      await RevenueReportService.getExcel({
        type: RevenueReportService.typesExcelReports.incomes,
        to: this.externalFilters.periodOfStay[1],
        from: this.externalFilters.periodOfStay[0],
        roomtypeIds: this.selectedCategories,
        metrics: this.selectedMetrics.map((key) => RevenueReportService.mapMetricKeyToServer(key)),
      });

      if (done instanceof Function) done();
    },
  },
};
</script>

<style lang="scss">

.bnovo-report-revenue__widget-doughunt {
  width: 320px;
}

.bnovo-report-revenue__metrics-section {
  max-width: max-content;
  gap: 16px;
  & .bnovo-report-revenue__card-wrapper {
    min-width: 320px;
  }
}

.bnovo-report-revenue__additional-block {
  gap: 16px;
  & .b-input-label div.v-btn-toggle button.revenue-report-button--active {
    background-color: $secondary-blue !important;
    border-color: $secondary-blue-hover !important;
  }
}

.bnovo-report-revenue__btn-group--mobile .v-btn-toggle button.revenue-report-button--active {
  background-color: $secondary-blue !important;
  border-color: $secondary-blue-hover !important;
}

.bnovo-report-revenue__graph-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(1, 1fr);
  gap: 16px;
}

.bnovo-report-revenue__card.rounded-lg.v-card {
  border: 1px solid $border-color;
}

.bnovo-report-revenue__card-sheet {
  small {
    color: var(--v-secondary-darken3);
  }
}

.hero-34 {
  font-size: 34px;
}

.bnovo-report-revenue__btn-group--mobile {
  display: none;
}

.bnovo-report-revenue__category-select {
  &--text-wrap {
    white-space: normal;
    word-break: break-word;
    overflow: visible;
    text-overflow: unset;
  }
}

.bnovo-report-revenue__metrics-select {
  flex-grow: 1;
}

@media (max-width: map-get($grid-breakpoints-custom, lg)) {
  .bnovo-report-revenue__metrics-section {
    flex-direction: column;
    max-width: 640px;
    & .bnovo-report-revenue__widget-doughunt {
      width: auto;
    }

    & .bnovo-report-revenue-metrics-block--total {
      width: auto;
    }
  }
}

@media #{map-get($display-breakpoints, 'lg-and-up')} {
  .bnovo-report-revenue__metrics-section {
    max-width: max-content;
    & .bnovo-report-revenue__card-wrapper {
      min-width: 320px;
    }
  }
}

@media (max-width: map-get($grid-breakpoints-custom, sm)) {
  .bnovo-report-revenue__category-select {
    flex-grow: 1;
    & .v-responsive.overflow-visible {
      width: auto !important;
    }
  }

  .bnovo-report-revenue__widget-doughunt {
    display: flex;
    flex-direction: column;
    width: auto;
  }

  .bnovo-report-revenue__btn-group--desktop {
    display: none;
  }

  .bnovo-report-revenue__btn-group--mobile {
    display: flex;
  }
}


</style>
