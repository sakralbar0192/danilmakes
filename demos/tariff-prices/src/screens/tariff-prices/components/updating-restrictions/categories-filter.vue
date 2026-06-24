<template>
  <b-select
    v-model="$v.innerCategories.$model"
    data-test="tariff-mass-restrictions-categories-select"
    search
    multiple
    :items="categories"
    item-text="name"
    item-value="id"
    label="Категории"
    hide-details="auto"
    :class="[$style.select, {
      'updating-restrictions--input-error': $v.innerCategories.$dirty && $v.innerCategories.$anyError,
    }]"
    @blur="$v.innerCategories.$touch()"
    @close="$emit('close')"
  />
</template>

<script>
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingRestrictionsCategoriesFilter",
  mixins: [validationMixin],
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    categories: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    innerCategories: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
  watch: {
    "$v.innerCategories.$anyError": {
      handler(value) {
        this.$emit("update:error", value);
      },
    },
  },
  validations: { innerCategories: { required } },
};
</script>

<style lang="scss" module>
.select :global(.v-list-item__title) {
  white-space: normal;
  word-break: break-word;
  overflow: visible;
  text-overflow: unset;
}
</style>
