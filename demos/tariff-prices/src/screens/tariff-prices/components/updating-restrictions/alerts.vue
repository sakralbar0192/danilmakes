<template>
  <div class="set" data-test="tariff-mass-restrictions-alerts">
    <b-alert v-if="hasDatePeriodsErrors" type="error">
      {{ $t("Введите даты периода.") }}
    </b-alert>

    <b-alert v-if="hasWeekDaysErrors" type="error">
      {{ $t("Не заданы дни недели для обновления.") }}
    </b-alert>

    <b-alert v-if="hasTariffSelectErrors" type="error">
      {{ $t("Не заданы тарифы для обновления.") }}
    </b-alert>

    <b-alert v-if="hasCategoriesSelectErrors" type="error">
      {{ $t("Не заданы категории для обновления.") }}
    </b-alert>

    <b-alert v-if="hasRestrictionErrors" type="error">
      {{ $t("Не заданы ограничения для обновления.") }}
    </b-alert>

    <b-alert v-if="hasMinMaxRestrictionErrors" type="error">
      {{ minMaxStayMessage }}
    </b-alert>

    <b-alert v-if="serverError" type="error">
      <template v-if="serverErrorIsPlain">
        {{ serverError }}
      </template>
      <template v-else>
        {{ $t(serverError) }}
      </template>
    </b-alert>
  </div>
</template>

<script>
export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingRestrictionsAlerts",
  props: {
    /**
     * Наличие ошибок валидации периодов.
     */
    hasDatePeriodsErrors: {
      type: Boolean,
      default: false,
    },
    /**
     * Наличие ошибок валидации у дней недели.
     */
    hasWeekDaysErrors: {
      type: Boolean,
      default: false,
    },
    /**
     * Наличие ошибок валидации у селекта тарифов.
     */
    hasTariffSelectErrors: {
      type: Boolean,
      default: false,
    },
    /**
     * Наличие ошибок валидации у селекта ограничений.
     */
    hasCategoriesSelectErrors: {
      type: Boolean,
      default: false,
    },
    hasRestrictionErrors: {
      type: Boolean,
      default: false,
    },
    hasMinMaxRestrictionErrors: {
      type: Boolean,
      default: false,
    },
    minMaxStayMessage: {
      type: String,
      default: "",
    },
    /**
     * Ошибка после сохранения.
     */
    serverError: {
      type: String,
      default: "",
    },
    serverErrorIsPlain: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
