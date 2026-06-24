<template>
  <div class="d-flex">
    <v-responsive max-width="85" class="overflow-visible">
      <b-checkbox
        :input-value="allDaysOfTheWeekSelected"
        :indeterminate="someDaysOfTheWeekSelected"
        hide-details
        :label="$t('Все дни:')"
        @click="selectAll"
        @change="$v.innerValue.$touch()"
      />
    </v-responsive>
    <div
      :class="['pl-ingroup', $style['days-container'], {
        [$style.error]: selectedWeekDaysError,
      }]"
    >
      <v-responsive
        v-for="item in $options.daysOfWeekList"
        :key="item.value"
        max-width="50"
        class="overflow-visible"
      >
        <b-checkbox
          v-model="$v.innerValue.$model"
          :label-prepend="true"
          :value="item.value"
          class="remove-animation"
          :label="item.title"
          @change="$v.innerValue.$touch()"
        />
      </v-responsive>
    </div>
  </div>
</template>

<script>
import AutomationService from "@/services/automation";
import { minLength, required } from "vuelidate/lib/validators";
import { validationMixin } from "vuelidate";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingRestrictionsWeekDaysFilter",
  mixins: [validationMixin],
  props: {
    value: {
      type: Array,
      required: true,
    },
  },
  daysOfWeekList: AutomationService.daysOfWeekList,
  computed: {
    innerValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
    allDaysOfTheWeekSelected: {
      get() {
        return this.$options.daysOfWeekList.every(item => {
          return this.innerValue.includes(item.value);
        });
      },
      set(v) {
        if (v) {
          this.innerValue = this.$options.daysOfWeekList.map(item => item.value);
        } else {
          this.innerValue = [];
        }
      },
    },
    someDaysOfTheWeekSelected() {
      return this.innerValue.length > 0 && this.innerValue.length < this.$options.daysOfWeekList.length;
    },
    selectedWeekDaysError() {
      return this.$v.innerValue.$dirty && this.$v.innerValue.$anyError;
    },
  },
  watch: {
    "$v.$anyError": {
      handler(value) {
        this.$emit("update:error", value);
      },
    },
  },
  methods: {
    selectAll() {
      if (!this.allDaysOfTheWeekSelected) {
        this.innerValue = this.$options.daysOfWeekList.map(el => el.value);
      } else {
        this.innerValue = [];
      }
    },
  },
  validations: {
    innerValue: {
      required,
      minLength: minLength(1),
    },
  },
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
