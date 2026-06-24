<template>
  <div class="d-flex pt-outer">
    <v-responsive width="85" class="overflow-visible">
      <b-checkbox
        v-model="allWeekDaysSelected"
        hide-details
        :label="$t('Все дни:')"
      />
    </v-responsive>
    <div
      :class="['pl-ingroup', $style['days-container'], {
        [$style.error]: selectedWeekDaysError
      }]"
    >
      <template v-for="item in $options.daysOfWeekList" :key="item.value">
        <v-responsive max-width="50" class="overflow-visible">
          <b-checkbox
            v-model="$v.internalValue.$model"
            hide-details
            :label="item.title"
            :value="item.value"
          />
        </v-responsive>
      </template>
    </div>
  </div>
</template>

<script>
import AutomationService from "@/services/automation";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import { getCompatModel, setCompatModel } from "@/utils/compat-model";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingPricesWeekDays",
  mixins: [validationMixin],
  props: {
    value: {
      type: Array,
      default: undefined,
    },
    modelValue: {
      type: Array,
      default: undefined,
    },
  },
  daysOfWeekList: AutomationService.daysOfWeekList,
  computed: {
    internalValue: {
      get() {
        return getCompatModel(this) || [];
      },
      set(v) {
        setCompatModel(this, v);
      },
    },
    allWeekDaysSelected: {
      get() {
        return this.$options.daysOfWeekList.every(item => {
          return this.internalValue.includes(item.value);
        });
      },
      set(v) {
        if (v) {
          this.internalValue = this.$options.daysOfWeekList.map(item => item.value);
        } else {
          this.internalValue = [];
        };
      },
    },
    selectedWeekDaysError() {
      return this.$v?.internalValue?.$dirty && !this.$v?.internalValue?.required;
    },
  },
  watch: {
    selectedWeekDaysError(v) {
      this.$emit("update:error", v);
    },
  },
  validations: { internalValue: { required } },
};
</script>

<style lang="scss" module>
.days-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: map-get($gaps, ingroup);

  &.error :global(.v-input--selection-controls__input) {
    border-color: $error !important;
  }
}
</style>
