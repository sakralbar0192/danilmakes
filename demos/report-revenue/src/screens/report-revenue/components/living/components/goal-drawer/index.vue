<template>
  <b-drawer
    :value="value"
    :width="$options.dialogWidth"
    stateless
    lock-overflow
  >
    <div class="v-dialog--scrollable height-100">
      <v-card class="pa-ingroup pb-0 d-flex flex-column" height="100%">
        <v-card-title :class="$style.header">
          <h3 class="bnovo-report-revenue__drawer-header mb-0 text-h2">
            {{ $t("Настройка плана") }}
          </h3>
          <v-spacer/>
          <b-btn
            color="tertiary"
            text-inline
            large
            @click="hideDrawer"
          >
            <v-icon class="icon-cross"/>
          </b-btn>
        </v-card-title>

        <v-card-text ref="scrollable" class="flex-grow-1">
          <category-row-select v-if="needShowCategorySelect" v-model="excludedCategories" class="mb-typo"/>

          <p class="mb-outer">
            {{
              $t(`Установите общий план за проживание на каждый месяц по показателям Доход, ADR и Загрузка.
                При указании плана по ADR и Загрузке, план по RevPAR рассчитается автоматически`)
            }}
          </p>
          <year-picker
            v-model="selectedYear"
            :displayed-years="displayedYears"
            class="mb-outer"
          />
          <input-forms
            :years-data="planData"
            :selected-year="selectedYear"
            @update:yearsData="updateYearsData"
          />
        </v-card-text>
        <v-spacer/>
        <v-card-actions :class="['justify-space-between pa-groups', $style.footer]">
          <b-btn outlined color="tertiary" @click="hideDrawer">
            {{ $t("Отменить") }}
          </b-btn>
          <b-btn
            color="primary"
            class="ma-0"
            @click="saveYearsData"
          >
            {{ $t("Сохранить") }}
          </b-btn>
        </v-card-actions>
      </v-card>
    </div>
  </b-drawer>
</template>

<script>
import { dialogWidths } from "@/uikit/b-dialog/assets/sizing";
import moment from "moment";
import { mapActions, mapGetters, mapState } from "vuex";
import AutomationService from "@/services/automation";
import { deepEqual } from "@/utils/object";
import ymHelpers from "@/utils/ym-helpers";
import CategoryRowSelect from "./category-row-select.vue";
import YearPicker from "./year-picker.vue";
import InputForms from "./input-forms.vue";

export default {
  name: "BnovoReportRevenueGoalDrawer",
  components: {
    CategoryRowSelect,
    YearPicker,
    InputForms,
  },
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      excludedCategories: [],
      planData: {},
      selectedYear: moment().year(),
    };
  },
  dialogWidth: dialogWidths.medium,
  computed: {
    ...mapGetters("hotelRoom", ["excludedRoomtypes"]),
    ...mapState("revenueReport", ["yearsRevenuePlan"]),
    needShowCategorySelect() {
      return this.excludedRoomtypes.length;
    },
    displayedYears() {
      return Object.keys(this.planData)
        .map(y => parseInt(y, 10));
    },
  },
  watch: {
    value() {
      if (this.value) {
        this.createPlanRange();
        this.$refs.scrollable.scrollTo(0, 0);
      }
    },
  },
  methods: {
    ...mapActions("revenueReport", ["saveYearsRevenuePlan"]),
    async saveYearsData() {
      if (this.isEqualData()) {
        this.hideDrawer();
        return;
      }

      if (this.isReadonly) {
        this.showMessage("primary", "В демо-аккаунте сохранение недоступно");
        this.hideDrawer();
        return;
      }
      this.$dialog.loader();
      try {
        await this.saveYearsRevenuePlan({
          yearsData: this.preparePlanForSaving(),
          categories: this.excludedCategories,
        });
        ymHelpers.sendHit("main", "save_plan", "Нажатие на кнопку \"Сохранить\"", {}, "revenue_report");
        this.createPlanRange();
        this.showMessage("success", "План успешно сохранен!");
        this.hideDrawer();
      } catch (e) {
        console.error(e);
        this.showMessage("error", "Не удалось сохранить план");
      } finally {
        this.$dialog.hideLoader();
      }
    },
    hideDrawer() {
      this.$emit("input", false);
    },
    updateYearsData({
      month,
      metric,
      value,
    }) {
      this.$set(this.planData[this.selectedYear][month], metric, value);
    },
    createPlanRange() {
      const plan = this.preparePlanForEditing();
      const categories = [...this.yearsRevenuePlan.categories];
      this.planData = plan;
      this.excludedCategories = categories;
      this.$options.originalPlan = structuredClone(plan);
      this.$options.originalCategories = structuredClone(categories);
    },
    showMessage(type, message) {
      this.$dialog.toast({
        type,
        content: `${this.$t(message)}`,
      });
    },
    preparePlanForSaving() {
      const prepareMonth = (data) => {
        return Object.fromEntries(
          Object.entries(data)
            .map(([month, value]) => [month, value == null || value === "" ? -1 : value]),
        );
      };
      const result = {};
      for (const [year, yearData] of Object.entries(this.planData)) {
        result[year] = {};
        for (const [month, monthData] of Object.entries(yearData)) {
          result[year][month] = prepareMonth(monthData);
        }
      }

      return result;
    },
    preparePlanForEditing() {
      const currentYear = moment().year();
      const fromYear = currentYear - 3;
      const toYear = currentYear + 3;
      const yearsData = {};

      for (let year = fromYear; year <= toYear; year++) {
        yearsData[year] = {};

        for (const month of AutomationService.monthsOfYearList) {
          const monthName = month.value;
          const monthValue = this.yearsRevenuePlan.getMonthData(year, monthName);
          yearsData[year][monthName] = {
            revenue: monthValue?.revenue ?? null,
            adr: monthValue?.adr ?? null,
            load: monthValue?.load ?? null,
          };
        }
      }

      return yearsData;
    },
    isEqualData() {
      return deepEqual(this.planData, this.$options.originalPlan)
        && deepEqual(this.excludedCategories, this.$options.originalCategories);
    },
  },
};
</script>

<style lang="scss" module>
.header {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #fff;
}

.footer {
  position: sticky;
  bottom: 0;
  z-index: 1;
  background: #fff;
  border-top: 1px solid #DDDDE3;
}
</style>
