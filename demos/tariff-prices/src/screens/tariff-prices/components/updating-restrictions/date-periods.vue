<template>
  <div class="d-flex flex-column gap-typo justify-start">
    <b-input-label label="Период"/>
    <div class="d-flex flex-column gap-groups">
      <div
        v-for="(date, periodIndex) in $v.datePeriods.$each.$iter"
        :key="date.uid"
        :class="['d-flex', {
          'align-start': !isMobileDevice,
          'flex-column': isMobileDevice,
          [$style.error]: displayedDatesError(date.values)
        }]"
        :data-test="`tariff-mass-restrictions-date-period-${periodIndex}`"
      >
        <div :style="{ width }">
          <b-related-dropdown-date-range
            :value="date.values.$model"
            :min="$options.restrictions.min"
            :max="$options.restrictions.max"
            :start-props="datePickerStartProps"
            :end-props="datePickerEndProps"
            @input="setPeriodValues(date.$model.uid, $event)"
          />
        </div>
        <b-btn
          v-if="value.length > 1"
          color="error"
          squared
          text
          :class="isMobileDevice ? 'mt-1' : ''"
          @click="removeDatePeriod(date.$model.uid)"
        >
          <v-icon class="icon-trash"/>
        </b-btn>
      </div>
    </div>
    <div>
      <b-btn
        v-if="mayAddPeriod"
        small
        text-inline
        @click="addDatePeriod"
      >
        <v-icon left class="icon-plus"/>
        {{ $t("Добавить период") }}
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
import modules from "./assets/modules.js";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingRestrictionsDatePeriods",
  components: { BRelatedDropdownDateRange },
  mixins: [validationMixin],
  props: {
    value: {
      type: Array,
      required: true,
    },
  },
  restrictions: {
    min: moment().format(PriceAndRestrictionsService.massiveUpdatingPricesDatesFormats.value),
    max: moment().add(2, "y").format(PriceAndRestrictionsService.massiveUpdatingPricesDatesFormats.value),
  },
  computed: {
    datePickerStartProps() {
      return {
        clearable: !this.isMobileDevice,
        hideDetails: "auto",
        ...(this.isMobileDevice ? { manualInput: false } : {}),
      };
    },
    datePickerEndProps() {
      return {
        clearable: !this.isMobileDevice,
        hideDetails: "auto",
        left: true,
        ...(this.isMobileDevice ? { manualInput: false } : {}),
      };
    },
    width() {
      return this.isMobileDevice ? "100%" : 240;
    },
    datePeriods: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
    mayAddPeriod() {
      return this.datePeriods.length < PriceAndRestrictionsService.maxUpdatingPricesDatesPeriods;
    },
  },
  watch: {
    "$v.$anyError": {
      handler(v) {
        this.$emit("update:error", v);
      },
    },
    datePeriods: {
      handler(datePeriods) {
        if (datePeriods.length > 1 && datePeriods.every(it => this.isCompletePeriod(it.values))) {
          const merged = this.mergeOverlappingPeriods(datePeriods);
          if (datePeriods.length > merged.length) {
            this.datePeriods = merged;
          }
        }
      },
      deep: true,
    },
  },
  methods: {
    setPeriodValues(periodId, values) {
      this.datePeriods = this.datePeriods.map(item => (
        item.uid !== periodId ? item : { ...item, values: [...values] }
      ));
    },
    isCompletePeriod(period = []) {
      return Array.isArray(period) && period.length === 2 && period.every(Boolean);
    },
    removeDatePeriod(uid) {
      this.datePeriods = this.datePeriods.filter(period => period.uid !== uid);
    },
    addDatePeriod() {
      this.$v.datePeriods.$touch();
      if (!this.$v.datePeriods.$invalid) {
        this.$v.datePeriods.$reset();
        this.datePeriods = [...this.datePeriods, modules.createDatePeriodEntry()];
      }
    },
    mergeOverlappingPeriods(periods) {
      if (!periods?.length) return [];

      let changed;
      do {
        changed = false;
        const result = [];
        const processed = new Set();

        for (let i = 0; i < periods.length; i++) {
          if (processed.has(i)) continue;

          const current = { ...periods[i], values: [...periods[i].values] };

          for (let j = i + 1; j < periods.length; j++) {
            if (processed.has(j)) continue;

            const other = periods[j];
            const dateFormat = PriceAndRestrictionsService.massiveUpdatingPricesDatesFormats.value;
            const currentStart = moment(current.values[0], dateFormat);
            const currentEnd = moment(current.values[1], dateFormat);
            const otherStart = moment(other.values[0], dateFormat);
            const otherEnd = moment(other.values[1], dateFormat);

            if (currentStart.isSameOrBefore(otherEnd) && currentEnd.isSameOrAfter(otherStart)) {
              current.values = [
                moment.min(currentStart, otherStart).format(dateFormat),
                moment.max(currentEnd, otherEnd).format(dateFormat),
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
      return this.$v.datePeriods.$dirty && (!value.required || !value.completePeriod);
    },
  },
  validations: {
    datePeriods: {
      required,
      $each: {
        values: {
          required,
          completePeriod: value => Array.isArray(value) && value.length === 2 && value.every(Boolean),
        },
      },
    },
  },
};
</script>

<style lang="scss" module>
.error :global(.v-input__slot) fieldset {
  border-color: $error !important;
}

</style>
