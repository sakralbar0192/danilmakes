<template>
  <div class="pt-outer">
    <updating-restrictions-week-days-filter
      :value="value"
      @input="$emit('input', $event)"
      @update:error="$emit('update:error', $event)"
    />
  </div>
</template>

<script>
import UpdatingRestrictionsWeekDaysFilter from "../updating-restrictions/week-days-filter.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingAvailabilityWeekDaysFilter",
  components: { UpdatingRestrictionsWeekDaysFilter },
  props: { value: { type: Array, required: true } },
};
</script>
