<template>
  <div data-test="tariff-mass-availability-alerts">
    <b-alert v-if="serverError" type="error" class="mt-groups">
      {{ serverError }}
    </b-alert>
    <b-alert v-if="hasValidationErrors" type="error" class="mt-groups">
      {{ $t('Заполните обязательные поля') }}
    </b-alert>
    <b-alert v-if="hasEmptyGridError" type="error" class="mt-groups">
      {{ $t("Укажите значения наличия хотя бы для одной категории и дня недели") }}
    </b-alert>
  </div>
</template>

<script>
export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingAvailabilityAlerts",
  props: {
    serverError: { type: String, default: "" },
    hasValidationErrors: { type: Boolean, default: false },
    hasEmptyGridError: { type: Boolean, default: false },
  },
};
</script>
