<template>
  <div class="d-flex align-baseline gap-ingroup">
    <v-icon class="icon-warning-triangle" x-small color="warning"/>
    <div class="text-caption warning--text">
      {{ message }}
    </div>
  </div>
</template>

<script>
export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingRestrictionsRestrictionWarningMessage",
  props: {
    message: {
      type: String,
      required: true,
    },
  },
};
</script>
