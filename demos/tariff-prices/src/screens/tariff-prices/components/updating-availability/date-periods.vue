<template>
  <div>
    <b-input-label label="Период"/>
    <div :class="$style['dates-container']">
      <div
        v-for="(date, periodIndex) in $v.datesPeriods.$each.$iter"
        :key="date.uid"
        :class="['d-flex', {
          'align-start': !isMobileDevice,
          'flex-grow-1': isMobileDevice,
          [$style.error]: displayedDatesError(date.period)
        }]"
      >
        <b-related-dropdown-date-range
          :value="date.period.$model"
          :min="$options.minDate"
          :max="$options.maxDate"
          :start-props="datePickerStartProps"
          :end-props="datePickerEndProps"
          :data-test="`tariff-mass-availability-date-period-${periodIndex}`"
          @input="setPeriodValues(date.$model.uid, $event)"
        />
        <b-btn
          v-if="datesPeriods.length > 1"
          class="ml-typo"
          text
          squared
          color="error"
          @click="removeDatePeriod(date.$model.uid)"
        >
          <v-icon class="icon-trash"/>
        </b-btn>
      </div>
    </div>
    <div>
      <b-btn
        v-if="mayAddPeriod"
        text-inline
        font-weight-regular
        class="text--primary"
        @click="createDatePeriod"
      >
        <v-icon class="icon-plus" left/>
        {{ $t('Добавить период') }}
      </b-btn>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import BRelatedDropdownDateRange from "@/uikit/b-related-dropdown-date-range";
import uid from "@/utils/uid";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingAvailabilityDatePeriods",
  components: { BRelatedDropdownDateRange },
  mixins: [validationMixin],
  props: {
    value: {
      type: Array,
      required: true,
    },
  },
  minDate: moment().format(PriceAndRestrictionsService.massiveUpdatingPricesDatesFormats.value),
  maxDate: moment().add(2, "y").format(PriceAndRestrictionsService.massiveUpdatingPricesDatesFormats.value),
  computed: {
    datePickerStartProps() {
      return {
        solo: true,
        clearable: !this.isMobileDevice,
        hideDetails: "auto",
        ...(this.isMobileDevice ? { manualInput: false } : {}),
      };
    },
    datePickerEndProps() {
      return {
        solo: true,
        clearable: !this.isMobileDevice,
        hideDetails: "auto",
        left: true,
        ...(this.isMobileDevice ? { manualInput: false } : {}),
      };
    },
    datesPeriods: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit("input", v);
      },
    },
    mayAddPeriod() {
      return this.datesPeriods.length < PriceAndRestrictionsService.maxUpdatingPricesDatesPeriods;
    },
  },
  watch: {
    datesPeriods: {
      handler(datesPeriods) {
        if (datesPeriods.length > 1 && datesPeriods.every(item => this.isCompletePeriod(item.period))) {
          const mergedPeriods = this.mergeOverlappingPeriods(datesPeriods);
          if (datesPeriods.length > mergedPeriods.length) this.datesPeriods = mergedPeriods;
        }
      },
      deep: true,
    },
    "$v.$anyError": {
      handler(v) {
        this.$emit("update:error", v);
      },
    },
  },
  methods: {
    setPeriodValues(periodId, period) {
      this.datesPeriods = this.datesPeriods.map(item => (
        item.uid !== periodId ? item : { ...item, period: [...period] }
      ));
    },
    isCompletePeriod(period = []) {
      return Array.isArray(period) && period.length === 2 && period.every(Boolean);
    },
    createDatePeriod() {
      this.$v.datesPeriods.$touch();
      if (!this.$v.datesPeriods.$invalid) {
        this.$v.datesPeriods.$reset();
        this.datesPeriods = [...this.datesPeriods, {
          period: [],
          uid: uid(),
        }];
      } else {
        this.$emit("need-scroll-to-alerts");
      }
    },
    removeDatePeriod(periodId) {
      this.datesPeriods = this.datesPeriods.filter(item => item.uid !== periodId);
    },
    mergeOverlappingPeriods(periods) {
      if (!periods?.length) return [];

      let changed;
      do {
        changed = false;
        const result = [];
        const processed = new Set();
        const fmt = PriceAndRestrictionsService.massiveUpdatingPricesDatesFormats.value;

        for (let i = 0; i < periods.length; i += 1) {
          if (processed.has(i)) continue;

          const current = { ...periods[i], period: [...periods[i].period] };

          for (let j = i + 1; j < periods.length; j += 1) {
            if (processed.has(j)) continue;

            const other = periods[j];
            const currentStart = moment(current.period[0], fmt);
            const currentEnd = moment(current.period[1], fmt);
            const otherStart = moment(other.period[0], fmt);
            const otherEnd = moment(other.period[1], fmt);

            if (currentStart.isSameOrBefore(otherEnd) && currentEnd.isSameOrAfter(otherStart)) {
              current.period = [
                moment.min(currentStart, otherStart).format(fmt),
                moment.max(currentEnd, otherEnd).format(fmt),
              ];
              processed.add(j);
              changed = true;
            }
          }

          result.push(current);
        }

        periods = result;
      } while (changed);

      return periods;
    },
    displayedDatesError(value) {
      return this.$v.datesPeriods.$dirty && (!value.required || !value.completePeriod);
    },
  },
  validations: {
    datesPeriods: {
      $each: {
        period: {
          required,
          completePeriod: value => Array.isArray(value) && value.length === 2 && value.every(Boolean),
        },
      },
    },
  },
};
</script>

<style lang="scss" module>
.dates-container {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: map-get($gaps, groups);
  margin-bottom: map-get($gaps, typo);

  .error :global(.v-input__slot) fieldset {
    border-color: $error !important;
  }
}
</style>
