<template>
  <b-btn
    v-if="isVisible"
    data-test="tariff-switch-to-old-version"
    color="tertiary"
    :squared="iconOnly"
    :title="$t('Вернуться на старую версию Цены и ограничения')"
    @click="performSwitchToOld"
  >
    <v-icon :left="!iconOnly" class="icon-redo"/>
    <template v-if="!iconOnly">
      <span class="tariff-version-switcher__label--full">
        {{ $t("Вернуться на старую версию") }}
      </span>
      <span class="tariff-version-switcher__label--short">
        {{ $t("На старую версию") }}
      </span>
    </template>
  </b-btn>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { canSwitchTariffPricesVersion,
  buildLegacyTariffPricesUrl,
  shouldPreferLegacyTariffPrices } from "@/utils/tariff/can-switch-tariff-prices-version";

export default {
  name: "TariffVersionSwitcher",
  props: {
    iconOnly: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(["user", "hotel"]),
    ...mapState("tariffPricesAndRestrictions", ["currentTariff"]),
    isVisible() {
      return canSwitchTariffPricesVersion(this.hotel)
        && !shouldPreferLegacyTariffPrices({ hotel: this.hotel, user: this.user })
        && !this.user?.extra?.is_guest;
    },
  },
  methods: {
    ...mapActions("user", ["updateTariffPricesVersion"]),
    async performSwitchToOld() {
      this.$dialog.loader();
      try {
        const response = await this.updateTariffPricesVersion(true);

        if (response?.result !== "success") {
          this.$dialog.hideLoader();
          this.$dialog.error({
            content: this.$t(
              "При обработке запроса возникли ошибки. Мы уже работаем над их решением. Приносим извинения за доставленные неудобства ",
            ),
          });
          return;
        }

        const tariffId = this.currentTariff?.id;
        const legacyUrl = buildLegacyTariffPricesUrl({
          tariffId,
          query: this.$route.query,
        });
        window.location.href = legacyUrl;
      } catch {
        this.$dialog.hideLoader();
        this.$dialog.error({
          content: this.$t(
            "При обработке запроса возникли ошибки. Мы уже работаем над их решением. Приносим извинения за доставленные неудобства ",
          ),
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.tariff-version-switcher__label--short {
  display: none;
}

@media (max-width: 364px) {
  .tariff-version-switcher__label--full {
    display: none;
  }

  .tariff-version-switcher__label--short {
    display: inline;
  }
}
</style>
