<template>
  <b-screen-footer>
    <template #leftSide>
      <b-btn
        :disabled="isLoading"
        outlined
        color="tertiary"
        data-test="tariff-footer-discard-changes"
        @click="$emit('click-discard')"
      >
        {{ $t("Отменить изменения") }}
      </b-btn>
      <b-btn
        :loading="isLoading"
        color="primary"
        data-test="tariff-footer-save-changes"
        @click="$emit('click-save')"
      >
        {{ $t("Сохранить изменения") }}
      </b-btn>
    </template>
  </b-screen-footer>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "TariffPricesFooter",
  computed: { ...mapState("tariffPricesAndRestrictions", ["isLoading"]) },
};
</script>
