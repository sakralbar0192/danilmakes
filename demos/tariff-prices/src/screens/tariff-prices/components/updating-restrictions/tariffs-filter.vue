<template>
  <b-select
    v-model="$v.innerTariffs.$model"
    multiple
    search
    :items="tarrifs"
    item-text="name"
    item-value="id"
    label="Тарифы"
    selection="тариф"
    hide-details="auto"
    :class="{
      'updating-restrictions--input-error': $v.innerTariffs.$dirty && $v.innerTariffs.$anyError,
    }"
    @change="$emit('change')"
    @blur="$v.innerTariffs.$touch()"
  />
</template>

<script>
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingRestrictionsTariffFilter",
  mixins: [validationMixin],
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    tarrifs: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    innerTariffs: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
  watch: {
    "$v.innerTariffs.$anyError": {
      handler(value) {
        this.$emit("update:error", value);
      },
    },
  },
  validations: { innerTariffs: { required } },
};
</script>
