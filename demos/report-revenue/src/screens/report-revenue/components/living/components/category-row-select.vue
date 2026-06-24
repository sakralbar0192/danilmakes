<template>
  <v-row
    dense
    :class="['mb-ingroup set set_ingroup d-flex', {'justify-space-between': isNeedGoalButtonRender}]"
  >
    <b-col
      :cols="isMobileDevice ? '' : 'auto'"
      class="py-0 d-flex gap-outer bnovo-report-revenue__category-select"
    >
      <v-responsive :width="250" data-tour="bnovo-revenue-report-tour-step-2">
        <b-select
          v-model="selectedCategoriesProxy"
          grouped
          search
          :items="roomtypesItemsGroup"
          :readonly-items="disabledRoomtypesGroup"
          group-text="name"
          element-text="name"
          :show-master-checkbox="isNeedToShowMasterBox"
          :search-placeholder="$t('Поиск')"
          :label="$t('Категории')"
          :class="{
            'bnovo-report-revenue__datepicker-bg': isNeedToShowBackground
          }"
          element-text-class="bnovo-report-revenue__category-select--text-wrap"
          @close="onClose"
        />
      </v-responsive>
      <template v-if="isPastAndFutureFullMonth">
        <b-input-label
          :label="$t('Показать')"
          class="mr-4 bnovo-report-revenue__btn-group--desktop"
        >
          <b-btn-group
            v-model="groupTypeProxy"
            :borderless="false"
            mandatory
            color="secondary"
          >
            <b-btn
              v-for="(period, index) in groupByMethods"
              :key="period.id"
              :color="index === groupTypeProxy ? 'secondary' : 'tertiary'"
              :outlined="index !== groupTypeProxy"
              active-class="revenue-report-button--active"
              :title="period.title"
            >
              {{ period.name }}
            </b-btn>
          </b-btn-group>
        </b-input-label>
      </template>
    </b-col>
    <template>
      <b-col cols="auto" class="py-0 bnovo-report-revenue__metrics-select">
        <v-responsive :width="isMobileDevice ? 'auto' : 250">
          <b-menu-tooltip
            right
            color="success"
            :value="isShowAlert"
            :open-on-hover="false"
            :open-on-click="false"
          >
            <template #activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on">
                <b-select
                  v-model="selectedMetricsProxy"
                  multiple
                  :items="metricsItems"
                  item-text="name"
                  item-value="key"
                  hide-details
                  :label="$t('Показатели')"
                  :class="{ 'bnovo-report-revenue__datepicker-bg': isNeedMetricsBackground }"
                  @close="onMetricsClose"
                >
                  <template #selection="{ index }">
                    <div
                      v-if="selectedMetricsText && index === 0"
                      :class="selectedMetricsCount === 1 ? 'v-autocomplete__output' : 'v-autocomplete__output-count'"
                    >
                      {{ selectedMetricsText }}
                    </div>
                  </template>
                </b-select>
              </div>
            </template>
            <template #default>
              <v-card color="success">
                <v-card-title class="pt-0 px-0 d-flex align-center flex-nowrap subtitle-1 mb-0 pb-2">
                  <b class="white--text font-weight-bold">
                    {{ $t('Обновление') }}
                  </b>
                  <v-spacer/>
                  <span
                    class="cursor-pointer"
                    @click="isShowAlert = false"
                  >
                    <v-icon
                      small
                      class="icon-cross"
                      color="white"
                    />
                  </span>
                </v-card-title>
                <v-card-text class="px-0 pb-0">
                  <span class="white--text" :style="{fontSize: '12px'}">
                    {{ $t('Теперь вы можете выбирать показатели для отображения в отчете') }}
                  </span>
                </v-card-text>
              </v-card>
            </template>
          </b-menu-tooltip>
          <v-responsive/>
        </v-responsive>
      </b-col>
    </template>
    <b-col cols="auto" class="py-0 d-flex align-end bnovo-report-revenue__additional-block">
      <excel-download v-if="canShowReport" @excelDownload="onExcelDownload"/>
      <b-btn
        v-if="isNeedGoalButtonRender"
        color="tertiary"
        :squared="isMobileDevice"
        data-tour="bnovo-revenue-report-tour-step-3"
        @click="onDrawerOpened"
      >
        <v-icon :class="{'mr-2': !isMobileDevice}">
          icon-settings
        </v-icon>
        <template v-if="!isMobileDevice">
          {{ $t("Настроить план") }}
        </template>
      </b-btn>
    </b-col>
    <b-col
      v-if="isPastAndFutureFullMonth"
      cols="12"
      class="mt-1 bnovo-report-revenue__btn-group--mobile"
    >
      <b-btn-group
        v-model="groupTypeProxy"
        :borderless="false"
        mandatory
        color="secondary"
        style="width: 100%;"
      >
        <b-btn
          v-for="(period, index) in groupByMethods"
          :key="period.id"
          :color="index === groupTypeProxy ? 'secondary' : 'tertiary'"
          :outlined="index !== groupTypeProxy"
          active-class="revenue-report-button--active"
          :title="period.title"
          style="width: 50%;"
        >
          {{ period.name }}
        </b-btn>
      </b-btn-group>
    </b-col>
  </v-row>
</template>

<script>
import { mapGetters } from "vuex";
import ymHelpers from "@/utils/ym-helpers";
import OnceShow from "@/mixins/once-show";
import RevenueReportService from "@/services/reports/revenue-report";
import { goalDrawerEnabled } from "../../../config/screen-config";
import ExcelDownload from "../../shared/excel-download.vue";

export default {
  name: "BnovoReportRevenueCategorySelectRow",
  components: { ExcelDownload },
  mixins: [OnceShow],
  props: {
    roomtypesItemsGroup: {
      type: Array,
      required: true,
    },
    disabledRoomtypesGroup: {
      type: Object,
      required: true,
    },
    localSelectedCategories: {
      type: Array,
      required: true,
    },
    localSelectedMetrics: {
      type: Array,
      required: true,
    },
    groupType: {
      type: Number,
      required: true,
    },
    groupByMethods: {
      type: Array,
      required: true,
    },
    isPastAndFutureFullMonth: {
      type: Boolean,
      required: true,
    },
    canShowReport: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    ...mapGetters("user", ["isGuest"]),
    isNeedGoalButtonRender() {
      return goalDrawerEnabled && !this.isGuest;
    },
    selectedCategoriesProxy: {
      get() {
        const selectedCategories = Object.keys(
          this.localSelectedCategories.reduce((obj, categoryId) => {
            obj[categoryId] = [];
            return obj;
          }, {}),
        );
        return { 1: selectedCategories };
      },
      set(v) {
        this.$emit("update:localSelectedCategories", Object.values(v).flatMap(i => i));
      },
    },
    selectedMetricsProxy: {
      get() {
        return this.localSelectedMetrics;
      },
      set(value) {
        this.$emit("update:localSelectedMetrics", value);
      },
    },
    groupTypeProxy: {
      get() {
        return this.groupType;
      },
      set(value) {
        this.$emit("update:groupType", value);
      },
    },
    isNeedToShowBackground() {
      return this.localSelectedCategories.length;
    },
    isNeedMetricsBackground() {
      return this.localSelectedMetrics.length;
    },
    isNeedToShowMasterBox() {
      return this.roomtypesItemsGroup.length > 1;
    },
    selectedMetricsCount() {
      return this.localSelectedMetrics.length;
    },
    selectedMetricsText() {
      const count = this.selectedMetricsCount;

      if (!count) {
        return "";
      }
      if (count === this.metricsItems.length) {
        return this.$t("Выбраны все показатели");
      }
      if (count === 1) {
        return this.getMetricName(this.localSelectedMetrics[0]);
      }

      return `${this.$t("Выбрано")} ${this.$tc("показатель", count)}`;
    },
    metricsItems() {
      return Object.values(RevenueReportService.metricsSelectionOptions).map((v) => {
        return {
          key: v.key,
          name: v.key === RevenueReportService.metricsSelectionOptions.amount.key
            ? RevenueReportService.metricsSelectionOptions.amount.shortName
            : v.name,
        };
      });
    },
  },
  created() {
    this.initFirstVisit("localStorage", "showMetricSelectNewUpdateMessage");
  },
  mounted() {
    this.showElementOnce("localStorage", "showMetricSelectNewUpdateMessage");
  },
  beforeUnmount() {
    if (this.refWatcher) {
      this.refWatcher();
    }
  },
  methods: {
    onDrawerOpened() {
      this.$emit("openDrawer");
      ymHelpers.sendHit("main", "open_plan_drawer", "Нажатие на кнопку \"Настроить план\"", {}, "revenue_report");
    },
    onExcelDownload(done) {
      this.$emit("excelDownload", done);
    },
    onClose() {
      this.$emit("category-select-blur");
    },
    onMetricsClose() {
      this.$emit("metrics-select-blur");
    },
    getMetricName(key) {
      const item = this.metricsItems.find(metric => metric.key === key);
      return item?.shortName || item?.name || key;
    },
  },
};
</script>
