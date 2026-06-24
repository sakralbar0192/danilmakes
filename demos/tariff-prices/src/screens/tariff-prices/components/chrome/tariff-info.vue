<template>
  <v-row v-if="isCurrentTariffDepend || isCurrentTariffHasDependedRestrictions || isRmsPricingEnabled" dense>
    <b-col>
      <component :is="component" v-if="!resetDependentPricesActive && isCurrentTariffDepend && isOneOfPricesModesEnabled" type="warning">
        {{ $t('Если вы указываете цену вручную, то при изменении цены в родительском тарифе') }}
        <a :href="parentTariffUrl" target="_blank">{{ parentTariff.name }}</a>
        {{ $t('цена в текущем не изменится') }}.
      </component>
      <p v-if="isRestrictionModeEnabled && showAllInfo && isCurrentTariffHasDependedRestrictions">
        {{ tariffDependentRestrictionsNames.length === 1 ? $t('Ограничение') : $t('Ограничения') }}
        {{ tariffDependentRestrictionsNames.join(', ') }}
        {{ $t('в данном тарифе автоматически') }}
        {{ tariffDependentRestrictionsNames.length === 1 ? $t('копируется') : $t('копируются') }}
        {{ $t('из тарифа') }}
        <a :href="restrictionsParentTariffUrl" target="_blank">{{ restrictionsParentTariff.name }}</a>
      </p>
      <template v-if="isOneOfPricesModesEnabled && isRmsPricingEnabled">
        <template v-if="showAllInfo">
          <p class="mb-0">
            <b>
              {{
                $t('Цена продажи')
              }} -
            </b>
            {{
              $t('это цена, по которой продается номер. Рассчитывается согласно настроенному')
            }}
            <a href="/tariff/automation/advance-in-price" target="blank">{{ $t('Бизнес-правилу') }}</a>.
          </p>
          <p>
            <b>
              {{
                $t('Базовая цена')
              }} -
            </b>
            {{
              $t('это цена, от которой рассчитывается цена продажи.')
            }}
          </p>
        </template>
        <template v-else>
          <component :is="component" v-if="isOneOfDynamicPricesModesEnabled" type="warning">
            {{
              $t('Динамические цены рассчитываются согласно настроенному')
            }}
            <a href="/tariff/automation/advance-in-price" target="blank">{{ $t('правилу') }}</a>.
            {{ $t('Если на определенные даты вы указываете цену вручную, тогда на данные даты цены из правила применяться не будут') }}
          </component>
          <component :is="component" v-else type="warning">
            {{
              $t('При изменении базовой цены динамические цены будут пересчитаны согласно настроенному')
            }}
            <a href="/tariff/automation/advance-in-price" target="blank">{{ $t('Правилу') }}</a>
          </component>
        </template>
      </template>
    </b-col>
  </v-row>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { getPlanModification, getTariffDependentRestrictions } from "../../config/screen-config.js";

export default {
  name: "BnovoUpdatingPricesTariffInfo",
  props: {
    showAllInfo: {
      type: Boolean,
      default: false,
    },
    resetDependentPricesActive: {
      type: Boolean,
      default: false,
    },
  },
  modeDefaultPrice: PriceAndRestrictionsService.modeDefaultPrice,
  modeDynamicPrice: PriceAndRestrictionsService.modeDynamicPrice,
  modeRestrictions: PriceAndRestrictionsService.modeRestrictions,
  modeRestrictionsWithDynamicPrice: PriceAndRestrictionsService.modeRestrictionsWithDynamicPrices,
  modeRestrictionsWithPrice: PriceAndRestrictionsService.modeRestrictionsWithPrices,
  computed: {
    ...mapState("hotel", ["rplansByIds"]),
    ...mapState("additionalServices", ["additionalServices"]),
    ...mapState("tariffPricesAndRestrictions", ["currentTariff", "mode"]),
    ...mapGetters("tariffPricesAndRestrictions", ["isOneOfPricesModesEnabled", "isRmsPricingEnabled", "isOneOfDynamicPricesModesEnabled", "isCurrentTariffDepend", "isCurrentTariffHasDependedRestrictions", "isRestrictionModeEnabled"]),
    ...mapState("additionalServices", ["additionalServices"]),
    restrictionsParentTariff() {
      return this.rplansByIds[this.currentTariff?.dependent_restrictions?.parent_plan_id];
    },
    parentTariff() {
      return this.rplansByIds[this.currentTariff?.parent_id];
    },
    queryString() {
      const query = this.$route.query;
      const params = new URLSearchParams(query).toString();
      return params ? `?${params}` : "";
    },
    restrictionsParentTariffUrl() {
      return `/tariff/index/${this.restrictionsParentTariff?.id}${this.queryString}`;
    },
    parentTariffUrl() {
      return `/tariff/index/${this.parentTariff?.id}${this.queryString}`;
    },
    component() {
      return this.showAllInfo ? "p" : "b-alert";
    },
    tariffDependentRestrictionsNames() {
      return getTariffDependentRestrictions(this.currentTariff);
    },
  },
  methods: {
    getPlanModification() {
      return getPlanModification(
        this.currentTariff,
        this.parentTariff,
        this.hotel.currency_sign,
        this.additionalServices,
        false,
      );
    },
  },
};
</script>
