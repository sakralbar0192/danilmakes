<template>
  <info-block v-if="currentTariff?.extra?.price_round">
    <template #title>
      {{ $t('Округление цен') }}
    </template>
    <template #content>
      {{ $t('Цена в данном тарифе округляется до') }}
      <span>{{ priceRoundValue }}</span>.
      {{ $t('Изменить округление вы можете в') }}
      <a :href="`/tariff/edit/${currentTariff.id}`" target="_blank">{{ $t('Настройках тарифа') }}</a>.
    </template>
  </info-block>
</template>

<script>
import { mapState } from "vuex";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import InfoBlock from "./info-block.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsInfoDrawerPriceRound",
  components: { InfoBlock },
  computed: {
    ...mapState("tariffPricesAndRestrictions", ["currentTariff"]),
    priceRoundValue() {
      return `${PriceAndRestrictionsService.roundingMap[this.currentTariff?.extra?.price_round] || 1} ${this.hotel.currency_sign}`;
    },
  },
};
</script>
