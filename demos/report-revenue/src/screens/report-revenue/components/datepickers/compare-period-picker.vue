<template>
  <div>
    <b-menu v-if="!disabled">
      <template #activator="{ on, attrs }">
        <slot :on="on" :attrs="attrs">
          <div>
            <b-dropdown-datepicker
              v-if="isCustomPeriod"
              v-model="customPeriodValue"
              range
              :readonly="readOnly"
              :allowed-dates="allowedDates"
            />
            <b-select
              v-else
              v-model="selectedYear"
              clearable
              class="cursor-pointer"
              :append-icon="isSomethingSelected ? '' : 'icon-chevron-down'"
              :prepend-inner-icon="isSomethingSelected ? 'icon-calendar' : ''"
              :items="selectedYearsItems"
            />
            <div class="datepicker-prefilters set set_ingroup">
              {{ $t("Указать свой период") }}
              <b-switch v-model="model" small/>
            </div>
          </div>
        </slot>
      </template>
    </b-menu>
    <b-text-field v-else disabled :sub-hint="subHint"/>
  </div>
</template>

<script>
import moment from "moment";
import RevenueReportService from "@/services/reports/revenue-report";

export default {
  name: "BnovoReportRevenueComparePeridPicker",
  mixins: [],
  props: {
    periodOfStay: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: () => false,
    },
    isCustomPeriod: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      selectedYear: null,
      customPeriodValue: [],
    };
  },
  computed: {
    model: {
      get() {
        return this.isCustomPeriod;
      },
      set(e) {
        this.$emit("update:is-custom-period", e);
      },
    },
    isSomethingSelected() {
      return this.selectedYear;
    },
    selectedYearsItems() {
      const periodOfStayMoment = this.periodOfStay[0] ? moment(this.periodOfStay[0], RevenueReportService.sendingDataFormat) : moment();
      const periodOfStayYear = periodOfStayMoment.year();
      return [
        periodOfStayYear - 1,
        periodOfStayYear - 2,
        periodOfStayYear - 3,
      ];
    },
    subHint() {
      if (this.periodOfStay.length === 0) return "";
      return `${this.$t("Доступен при выборе периода проживания не более года от")} ${moment().format("DD.MM.YYYY")}`;
    },
    readOnly() {
      return this.customPeriodValue.length === 1;
    },
  },
  watch: {
    customPeriodValue(val) {
      if (val.length === 1) {
        const startPeriodOfStayMoment = moment(this.periodOfStay[0], RevenueReportService.sendingDataFormat);
        const endPeriodOfStayMoment = moment(this.periodOfStay[1], RevenueReportService.sendingDataFormat);
        const endDate = moment(val[0], RevenueReportService.sendingDataFormat).add(Math.abs(endPeriodOfStayMoment.diff(startPeriodOfStayMoment, "days")), "days");
        val[1] = endDate.format(RevenueReportService.sendingDataFormat);
      }
      this.$emit("input", val);
    },
    selectedYear(val) {
      if (val === null) {
        this.$emit("input", []);
        return;
      }
      const year = Number(val);
      const firstDay = moment([year, 0, 1]).format(RevenueReportService.sendingDataFormat);
      const lastDay = moment([year, 11, 31]).format(RevenueReportService.sendingDataFormat);
      const result = [firstDay, lastDay];
      this.$emit("input", result);
    },
    periodOfStay(val) {
      if (val.length === 0) {
        this.selectedYear = null;
        this.customPeriodValue = [];
      }
    },
  },
  methods: {
    allowedDates(val) {
      const startMoment = moment(this.periodOfStay[0], RevenueReportService.sendingDataFormat);
      const endMomemt = moment(this.periodOfStay[1], RevenueReportService.sendingDataFormat);
      const daysDiff = Math.abs(endMomemt.diff(startMoment, "days"));
      const valMoment = moment(val, RevenueReportService.sendingDataFormat);
      if ((valMoment.isSameOrAfter(startMoment.clone().subtract(daysDiff, "days"))) && (valMoment.isSameOrBefore(endMomemt))) {
        return false;
      }
      return true;
    },
  },
};

</script>

<style lang="scss">

.bnovo-v-app {
  &::v-deep .datepicker-prefilters {
    align-items: baseline;
  }
  .v-input--selection-controls {
    padding-top: 0px !important;
  }
}

.bnovo-v-app {
  .datepicker-text-field .v-input__icon--prepend-inner .v-icon {
    font-size: 1.5rem;
  }
}

.bnovo-v-app .v-input__prepend-inner .v-icon.v-icon {
  font-size: 1.5rem;
  color: $breadcrumbs !important
}
</style>
