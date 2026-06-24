<template>
  <v-responsive :width="isMobileDevice ? '100%' : 240" class="overflow-visible">
    <updating-restrictions-categories-filter
      :value="value"
      :categories="categories"
      @input="$emit('input', $event)"
      @update:error="$emit('update:error', $event)"
      @close="$emit('close')"
    />
  </v-responsive>
</template>

<script>
import UpdatingRestrictionsCategoriesFilter from "../updating-restrictions/categories-filter.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingAvailabilityCategoriesFilter",
  components: { UpdatingRestrictionsCategoriesFilter },
  props: {
    value: { type: Array, default: () => [] },
    categories: { type: Array, default: () => [] },
  },
};
</script>
