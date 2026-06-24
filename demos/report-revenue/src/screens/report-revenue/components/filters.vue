<template>
  <div class="report-revenue-filters">
    <v-overlay
      v-if="isLoading"
      :model-value="true"
      class="align-center justify-center report-revenue-loading-overlay"
      contained
      persistent
      scrim="#35435b"
      :z-index="10"
    >
      <div class="d-flex flex-column align-center">
        <v-progress-circular indeterminate :size="64" color="primary"/>
        <span class="text--primary mt-2">
          {{ $t('Идет построение отчета') }}
        </span>
      </div>
    </v-overlay>
    <v-row>
      <v-col cols="12" class="py-1">
        <div
          :class="'d-flex set align-baseline bnovo-report-revenue__filters'"
        >
          <div
            class="d-flex set bnovo-report-revenue__filters-period-stay"
            data-tour="bnovo-revenue-report-tour-step-1"
          >
            <div
              class="bnovo-report-revenue__input-252"
            >
              <b-input-label
                :label="$t('Период проживания/услуги')"
                :label-hint="$t('Максимальный период для построения отчета - 1 год')"
                :class="{
                  'bnovo-report-revenue__datepicker-bg': internalFilters.periodOfStay.length
                }"
              >
                <b-dropdown-datepicker
                  v-model="periodOfStay"
                  range
                  hide-details="auto"
                  pre-filters-current
                  data-test="bnovo-report-revenue-period"
                  :pre-filters="$options.preFilters"
                  :allowed-dates="allowedData"
                  :error-messages="dateErrorsPeriodOfStay"
                >
                  <template #pre-filters="{ select, display }">
                    <v-tooltip
                      v-for="period in $options.preFilters"
                      :key="period"
                      :disabled="!$options.periodHintMap[period]"
                      location="bottom"
                    >
                      <template #activator="{ props: activatorProps }">
                        <a
                          href="javascript:void(0);"
                          class="v-link--no-underline"
                          v-bind="activatorProps"
                          @click="select(period)"
                        >
                          {{ display(period) }}
                        </a>
                      </template>
                      <template #default>
                        {{ $options.periodHintMap[period] }}
                      </template>
                    </v-tooltip>
                  </template>
                </b-dropdown-datepicker>
              </b-input-label>
            </div>
            <div
              v-if="isComparedPeriodOn"
              class="bnovo-report-revenue__input-252"
            >
              <b-input-label
                :label="$t('Сравниваемый период')"
                :class="{
                  'bnovo-report-revenue__datepicker-bg': internalFilters.compare.length
                }"
              >
                <compare-period-picker
                  v-model:is-custom-period="isCustomPeriod"
                  :period-of-stay="internalFilters.periodOfStay"
                  :disabled="disableComparedPeriod"
                  @input="internalFilters = {
                    ...internalFilters,
                    compare:$event
                  }"
                />
              </b-input-label>
            </div>
          </div>
          <b-input-label class="bnovo-report-revenue__align-fix bnovo-report-revenue__show-button" label="align">
            <b-btn
              color="primary"
              size="large"
              data-test="bnovo-report-revenue-show-button"
              @click="showHandler"
            >
              {{ $t("Показать") }}
            </b-btn>
          </b-input-label>

          <b-input-label
            v-if="isComparedPeriodOn"
            v-show="isSomethingSelected"
            class="bnovo-report-revenue__align-fix"
            label="align"
          >
            <b-btn
              color="tertiary"
              outlined
              @click="resetFilters"
            >
              <v-icon left>
                icon-cross
              </v-icon>
              {{ $t("Сбросить фильтры") }}
            </b-btn>
          </b-input-label>
        </div>
      </v-col>
    </v-row>
    <v-row v-if="isLeapYear">
      <v-col cols="auto">
        <b-alert type="info" class="mb-6">
          {{ isLeapYearText }}
        </b-alert>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import moment from "moment";
import { required, minLength } from "vuelidate/lib/validators";
import { validationMixin } from "vuelidate";
import RevenueReportService from "@/services/reports/revenue-report";
import { mapActions, mapState } from "vuex";
import ymHelpers from "@/utils/ym-helpers";
import modules from "../assets/modules";
import ComparePeriodPicker from "./datepickers/compare-period-picker.vue";
import { PERIOD_PRE_FILTERS, PERIOD_PRE_FILTERS_HINT_MAP } from "../assets/period-pre-filters";

const checkGreaterThenOneYearPeriod = modules.checkGreaterThenOneYearPeriod;

export default {
  name: "BnovoReportRevenueFilters",
  components: { ComparePeriodPicker },
  mixins: [validationMixin],
  data() {
    return {
      isCustomPeriod: false,
      isComparedPeriodOn: RevenueReportService.isComparedPeriodOn,
    };
  },
  preFilters: PERIOD_PRE_FILTERS,
  periodHintMap: PERIOD_PRE_FILTERS_HINT_MAP,
  computed: {
    ...mapState("hotelRoom", ["roomtypesLoading"]),
    ...mapState("revenueReport", ["internalFilters", "isReportDataFetching", "servicesReady"]),
    periodOfStay: {
      get() {
        return this.internalFilters.periodOfStay;
      },
      set(periodOfStay) {
        this.setInternalFilters({
          ...this.internalFilters,
          periodOfStay,
        });
      },
    },
    isLoading() {
      return this.isReportDataFetching || !this.servicesReady || this.roomtypesLoading;
    },
    disableComparedPeriod() {
      const currentDate = moment();
      if (this.internalFilters.periodOfStay.length === 0) return true;
      const startDate = moment(this.internalFilters.periodOfStay[0], RevenueReportService.sendingDataFormat);
      const endDate = moment(this.internalFilters.periodOfStay[1], RevenueReportService.sendingDataFormat);
      if (((Math.abs(startDate.diff(currentDate, "days")) > 365)) || ((Math.abs(endDate.diff(currentDate, "days")) > 365))) {
        return true;
      }
      return false;
    },
    isFebruarySelected() {
      const start = moment(this.internalFilters.periodOfStay[0], RevenueReportService.sendingDataFormat);
      const end = moment(this.internalFilters.periodOfStay[1], RevenueReportService.sendingDataFormat);
      const isFebruarySelected = start.month() === 1 && end.month() === 1;
      const isFullMonthSelected = start.date() === 1 && end.date() === moment([end.year(), end.month(), 1]).daysInMonth();
      return isFebruarySelected && isFullMonthSelected;
    },
    // високосный год
    isLeapYear() {
      if (!this.isCustomPeriod && this.isFebruarySelected && this.internalFilters.compare.length === 2) {
        const compareMoment = moment(this.internalFilters.compare[0], RevenueReportService.sendingDataFormat);
        const periodOfStayMoment = moment(this.internalFilters.periodOfStay[0], RevenueReportService.sendingDataFormat);
        if (compareMoment.isLeapYear()) {
          if (!periodOfStayMoment.isLeapYear()) {
            return compareMoment.year();
          }
        }
        if (periodOfStayMoment.isLeapYear()) {
          if (!compareMoment.isLeapYear()) {
            return periodOfStayMoment.year();
          }
        }
        return false;
      }
      return false;
    },
    isLeapYearText() {
      return `${this.isLeapYear} ${this.$t("является високосным - это может привести к увеличению общего числа бронирований в феврале")}`;
    },
    isSomethingSelected() {
      return this.internalFilters.compare.length || this.internalFilters.periodOfStay.length;
    },
    dateErrorsPeriodOfStay() {
      if (
        !this.$v.internalFilters.periodOfStay.required
        && this.$v.internalFilters.periodOfStay.$dirty
      ) return this.$t("Укажите период проживания/услуги");
      if (
        !this.$v.internalFilters.periodOfStay.checkGreaterThenOneYearPeriod
        && this.$v.internalFilters.periodOfStay.$dirty) return this.$t("Максимальный период год");
      return "";
    },
    isFullMonthSelected() {
      return RevenueReportService.isFullMonthSelected(this?.internalFilters?.periodOfStay || []);
    },
    configuration() {
      return RevenueReportService.configuration(this?.internalFilters?.periodOfStay || []);
    },
  },
  watch: {
    configuration(val) {
      this.$emit("update:configuration", val);
    },
    isLeapYear(val) {
      this.$emit("update:is-leap-year", val);
    },
  },
  methods: {
    ...mapActions("revenueReport", ["saveFilters", "setInternalFilters", "resetFilters", "activateService", "deactivateService", "removeServiceFromSelection"]),
    allowedData(val) {
      let result = true;
      if (this.internalFilters.periodOfStay.length === 1) {
        const startMoment = moment(
          this.internalFilters.periodOfStay.length === 1 ? this.internalFilters.periodOfStay[0] : this.internalFilters.periodOfStay[0],
          RevenueReportService.sendingDataFormat,
        );
        const valMoment = moment(val, RevenueReportService.sendingDataFormat);
        if (valMoment.isAfter(startMoment.clone().add(1, "year")) || valMoment.isBefore(startMoment.clone().subtract(1, "year"))) {
          result = false;
        }
      }
      return result;
    },
    showHandler() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$v.$reset();
        ymHelpers.sendHit("main", "default_period_selected", "Отчет показан без сравниваемого периода", {}, "revenue_report");

        if (RevenueReportService.shouldHideResortFee(this.periodOfStay)) {
          this.deactivateService([RevenueReportService.resortFeeId]);
          this.removeServiceFromSelection(RevenueReportService.resortFeeId);
        } else {
          this.activateService([RevenueReportService.resortFeeId]);
        }

        this.saveFilters(this.internalFilters);
      }
    },
  },
  validations: {
    internalFilters: {
      periodOfStay: {
        required, checkGreaterThenOneYearPeriod, minLengthValue: minLength(2),
      },
      compare: { checkGreaterThenOneYearPeriod },
    },
  },
};
</script>

<style lang="scss">

.datepicker-prefilters {
  height: $switch-thumb-height;
}

.bnovo-report-revenue__input-252 {
  width: 252px;
}

.bnovo-report-revenue__align-fix {
  .b-input-label__label {
    opacity: 0;
  }
}

.bnovo-report-revenue__datepicker-bg {
  div .v-input__control .v-input__slot {
    background-color: $sky-active !important;
  }
}

.report-revenue-loading-overlay {
  position: absolute;
}

.report-revenue-filters {
  position: relative;
}

@media (max-width: map-get($grid-breakpoints-custom, sm)) {
  .bnovo-report-revenue__filters-period-stay {
    flex-grow: 1;
  }

  .bnovo-report-revenue__input-252 {
    width: auto;
    flex-grow: 1;
  }
}

@media (max-width: map-get($grid-breakpoints-extra, xs)) {
  .bnovo-report-revenue__filters-period-stay {
    flex-grow: 1;
  }

  .bnovo-report-revenue__input-252 {
    width: auto;
  }

  .bnovo-report-revenue__show-button {
    flex-shrink: 0;
  }
}


@media (max-width: map-get($grid-breakpoints-extra, xxs)) {
  .bnovo-report-revenue__filters-period-stay {
    flex-grow: 1;
  }

  .bnovo-report-revenue__filters {
    gap: 8px !important;
  }

  .b-input-label__label {
    width: max-content !important;
  }

  .bnovo-report-revenue__input-252 {
    width: auto;
  }

  .bnovo-report-revenue__show-button {
    flex-shrink: 0;
  }
}
</style>
